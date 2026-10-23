import type { FeedResult, PetInfo } from './pet-api';

export type PetStage = PetInfo['stage'];
export type PetAction =
  | 'idle'
  | 'walk-right'
  | 'walk-left'
  | 'greet'
  | 'eat'
  | 'happy'
  | 'hungry'
  | 'sleep'
  | 'dragged'
  | 'look'
  | 'grow-out'
  | 'grow-in';

export interface PetFrame {
  rect: [number, number, number, number];
  duration: number;
}

export interface PetClip {
  frames: PetFrame[];
  loop: boolean;
}

export interface PetAtlasManifest {
  schema: 'polyv-pet/2';
  version: string;
  width: number;
  height: number;
  cell: [number, number];
  stages: Record<PetStage, { file: string; poster: string }>;
  actions: Record<string, PetClip>;
}

export interface PetScene {
  stage: PetStage;
  action: PetAction;
  token: number;
  lookIndex: number;
  busy: boolean;
}

/** 使用累计时长选帧，允许眨眼、咀嚼和停顿采用不同帧时长。 */
export function sampleClip(clip: PetClip, elapsed: number): { frame: PetFrame; done: boolean } {
  const total = clip.frames.reduce((sum, frame) => sum + frame.duration, 0);
  const done = !clip.loop && elapsed >= total;
  const time = clip.loop ? elapsed % total : Math.min(elapsed, total - 1);
  let end = 0;
  const frame =
    clip.frames.find(item => {
      end += item.duration;
      return time < end;
    }) || clip.frames[clip.frames.length - 1];
  return { frame, done };
}

/** 业务状态即时落账，展示阶段只在动作链的成长切点更新。 */
export class PetDirector {
  scene: PetScene;
  private targetStage: PetStage;
  private sequence = 0;
  private resolveClip: ((played: boolean) => void) | null = null;
  private playedActions = new Set<string>();

  constructor(stage: PetStage, private readonly onChange: (scene: PetScene) => void) {
    this.targetStage = stage;
    this.scene = { stage, action: 'idle', token: 0, lookIndex: 0, busy: false };
  }

  private publish() {
    this.onChange({ ...this.scene });
  }

  sync(stage: PetStage) {
    this.targetStage = stage;
    if (!this.scene.busy) {
      this.scene.stage = stage;
      this.publish();
    }
  }

  /** 拖拽、收起、后台和卸载均结束旧动作，且收敛到最新服务端阶段。 */
  interrupt(action: PetAction = 'idle') {
    this.sequence += 1;
    this.resolveClip?.(false);
    this.resolveClip = null;
    this.scene = {
      ...this.scene,
      stage: this.targetStage,
      action,
      busy: false,
      token: this.scene.token + 1,
    };
    this.publish();
  }

  beginFeed(): number {
    this.interrupt();
    this.scene.busy = true;
    this.publish();
    return this.sequence;
  }

  failFeed(sequence: number) {
    if (sequence === this.sequence) {
      this.interrupt();
    }
  }

  ambient(action: PetAction, lookIndex = 0) {
    if (this.scene.busy || (action === this.scene.action && lookIndex === this.scene.lookIndex)) {
      return;
    }
    this.scene = { ...this.scene, action, lookIndex, token: this.scene.token + 1 };
    this.publish();
  }

  private play(action: PetAction): Promise<boolean> {
    this.scene = { ...this.scene, action, token: this.scene.token + 1 };
    const completion = new Promise<boolean>(resolve => {
      this.resolveClip = resolve;
    });
    this.publish();
    return completion;
  }

  complete(token: number) {
    if (token !== this.scene.token) {
      return;
    }
    const resolve = this.resolveClip;
    this.resolveClip = null;
    if (resolve) {
      resolve(true);
    } else if (this.scene.action === 'greet' || this.scene.action === 'happy') {
      this.ambient('idle');
    }
  }

  async finishFeed(
    result: FeedResult,
    sequence: number,
    nextStageReady?: Promise<void>,
  ): Promise<boolean> {
    this.targetStage = result.pet.stage;
    // 请求途中发生拖拽/收起时保留用户操作，不能由迟到响应重启整段动画。
    if (sequence !== this.sequence) {
      this.sync(result.pet.stage);
      return false;
    }
    if (result.idempotent || this.playedActions.has(result.actionId)) {
      this.interrupt();
      return false;
    }
    this.playedActions.add(result.actionId);
    if (this.playedActions.size > 64) {
      this.playedActions.delete(this.playedActions.values().next().value as string);
    }
    try {
      if (!(await this.play('eat')) || sequence !== this.sequence) {
        return false;
      }
      if (result.evolved && this.scene.stage !== result.pet.stage) {
        if (nextStageReady) await nextStageReady;
        if (sequence !== this.sequence) return false;
        if (!(await this.play('grow-out')) || sequence !== this.sequence) {
          return false;
        }
        this.scene.stage = result.pet.stage;
        if (!(await this.play('grow-in')) || sequence !== this.sequence) {
          return false;
        }
      }
      return await this.play('happy');
    } finally {
      if (sequence === this.sequence) {
        this.interrupt();
      }
    }
  }
}
