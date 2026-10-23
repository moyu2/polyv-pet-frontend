import type { PetClip, PetStage } from './pet-animation';

const bowlTransition = 180;

export interface FeedingBowlTiming {
  arriveStart: number;
  arriveEnd: number;
  leaveStart: number;
  leaveEnd: number;
}

interface FeedingClip extends PetClip {
  bowlTiming?: FeedingBowlTiming;
}

// 坐标基于 256×224 图集；小碗避开前爪，碗口的左半部承接两次舔食帧的舌尖。
const bowlAnchors: Record<
  string,
  Record<PetStage, { x: number; ground: number; width: number; approach?: number }>
> = {
  dog: {
    egg: { x: 168, ground: 224, width: 40, approach: 28 },
    juvenile: { x: 180, ground: 224, width: 44, approach: 28 },
    adult: { x: 192, ground: 224, width: 48, approach: 28 },
  },
};

/** 狗先低头再接碗，收碗时停留在低头姿态，避免抬头帧的前爪踏进食物。 */
export function withFeedingTiming(clip: PetClip, species = 'dog'): FeedingClip {
  if (species !== 'dog') return clip;
  if (species === 'dog' && clip.frames.length === 8) {
    const approach = clip.frames.slice(0, 2).reduce((total, frame) => total + frame.duration, 0);
    const chewing = clip.frames.slice(0, 6).reduce((total, frame) => total + frame.duration, 0);
    return {
      loop: false,
      frames: [
        { ...clip.frames[0], duration: bowlTransition },
        ...clip.frames.slice(0, 6),
        { ...clip.frames[4], duration: bowlTransition },
        ...clip.frames.slice(6),
      ],
      bowlTiming: {
        arriveStart: bowlTransition + approach,
        arriveEnd: bowlTransition + approach + clip.frames[2].duration,
        leaveStart: bowlTransition + chewing,
        leaveEnd: bowlTransition + chewing + bowlTransition,
      },
    };
  }
  return {
    loop: false,
    frames: [
      { ...clip.frames[0], duration: bowlTransition },
      ...clip.frames,
      { ...clip.frames[clip.frames.length - 1], duration: bowlTransition },
    ],
  };
}

function easeProgress(elapsed: number, start: number, end: number) {
  const progress = Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
  return progress * progress * (3 - 2 * progress);
}

/** 特效与逐帧播放器共用时钟，暂停、慢帧和后台恢复时不会先于宠物消失。 */
export function feedingBowlStyle(
  species: string,
  stage: PetStage,
  elapsed: number,
  duration: number,
  reducedMotion = false,
  timing?: FeedingBowlTiming,
) {
  if (species !== 'dog') return {};
  const anchor = (bowlAnchors[species] || bowlAnchors.dog)[stage];
  const visibleUntil = timing?.leaveEnd ?? duration;
  const progress = reducedMotion
    ? 1
    : Math.max(0, Math.min(1, elapsed / bowlTransition, (visibleUntil - elapsed) / bowlTransition));
  const opacity = progress * progress * (3 - 2 * progress);
  // 站立和抬头时让碗停在爪子前方；只有低头后才送到舌尖处，原路收回后再抬头。
  const offset = timing
    ? (anchor.approach || 0) *
      (1 -
        easeProgress(elapsed, timing.arriveStart, timing.arriveEnd) +
        easeProgress(elapsed, timing.leaveStart, timing.leaveEnd))
    : 0;
  return {
    left: `${((anchor.x + offset) / 256) * 100}%`,
    bottom: `${((224 - anchor.ground) / 224) * 100}%`,
    width: `${(anchor.width / 256) * 100}%`,
    opacity,
    transform: `translate(-50%, ${(opacity - 1) * 24}%) scale(${0.94 + opacity * 0.06})`,
  };
}
