<template>
  <div
    class="pet-sprite"
    :class="`is-${action}`"
    :data-action="action"
    :data-stage="stage"
    :data-species="species"
    @load.capture="onPreviewLoad"
  >
    <!-- 先绘制食盆，低头时让随后绘制的嘴部和前爪自然盖在食盆上方。 -->
    <img
      v-if="action === 'eat' && species === 'dog'"
      class="pet-sprite__bowl pet-sprite__bowl--dog"
      :src="bowlSrc"
      :style="bowlStyle"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
    <pet-legacy-sprite
      v-if="!hasPetAtlas(species)"
      :stage="stage"
      :species="species"
      :animation="legacyAnimation"
      :satiety="action === 'hungry' ? 0 : 100"
    />
    <canvas
      v-else
      ref="canvasRef"
      v-show="ready"
      width="256"
      height="224"
      aria-hidden="true"
    />
    <img
      v-if="hasPetAtlas(species) && !ready && fallbackSrc"
      class="pet-sprite__poster"
      :src="fallbackSrc"
      alt=""
      draggable="false"
      @error="onPosterError"
    />
    <span
      v-if="hasPetAtlas(species) && !ready && !fallbackSrc"
      class="pet-sprite__unavailable"
      >宠物加载中</span
    >
    <span
      v-if="action === 'eat' && species !== 'dog'"
      class="pet-sprite__bowl"
      aria-hidden="true"
      >🥣</span
    >
    <span
      v-if="action === 'happy'"
      class="pet-sprite__heart"
      aria-hidden="true"
      >♡</span
    >
    <span
      v-if="action === 'grow-out' || action === 'grow-in'"
      class="pet-sprite__glow"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { PetAction, PetAtlasManifest, PetClip, PetStage } from './pet-animation';
import { sampleClip } from './pet-animation';
import { feedingBowlStyle, withFeedingTiming } from './pet-feeding';
import type { FeedingBowlTiming } from './pet-feeding';
import { hasPetAtlas, loadPetImage, loadPetManifest, petPoster } from './pet-assets';
import PetLegacySprite from './pet-legacy-sprite.vue';
import { alphaHitArea, fullPetHitArea } from './pet-hit-area';
import type { PetHitArea } from './pet-hit-area';

const props = withDefaults(
  defineProps<{
    stage: PetStage;
    species?: string;
    action?: PetAction;
    token?: number;
    lookIndex?: number;
    paused?: boolean;
  }>(),
  { species: 'dog', action: 'idle', token: 0, lookIndex: 0, paused: false },
);
const emit = defineEmits<{
  (event: 'complete', token: number): void;
  (event: 'hit-area', area: PetHitArea): void;
}>();
const canvasRef = ref<HTMLCanvasElement>();
const ready = ref(false);
const posterFailures = ref(0);
const reducedMotion = ref(false);
const feedingElapsed = ref(0);
const feedingDuration = ref(0);
const feedingTiming = ref<FeedingBowlTiming>();
const bowlSrc = `${(process.env.VUE_APP_PUBLIC_PATH || '/').replace(
  /\/?$/,
  '/',
)}assets/pets/effects/feeding-bowl.svg`;
const bowlStyle = computed(() =>
  feedingBowlStyle(
    props.species,
    props.stage,
    feedingElapsed.value,
    feedingDuration.value,
    reducedMotion.value,
    feedingTiming.value,
  ),
);
let manifest: PetAtlasManifest | null = null;
let eatingClip: PetClip;
let atlas: HTMLImageElement | null = null;
let requestVersion = 0;
let disposed = false;
let animationFrame = 0;
let lastTime = 0;
let elapsed = 0;
let paintedFrame = '';
let completedToken = -1;
let motionPreference: MediaQueryList | null = null;
let hitContext: CanvasRenderingContext2D | null = null;
const hitCache = new Map<string, PetHitArea>();
let lastHitArea = '';

/** 每个姿态只分析一次；使用独立小画布，避免主动画画布反复读取像素。 */
function publishHitArea(image: HTMLImageElement, key: string, rect?: number[]) {
  let area = hitCache.get(key);
  if (!area) {
    try {
      if (!hitContext) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 224;
        hitContext = canvas.getContext('2d', { willReadFrequently: true });
      }
      if (hitContext) {
        hitContext.clearRect(0, 0, 256, 224);
        if (rect) hitContext.drawImage(image, rect[0], rect[1], rect[2], rect[3], 0, 0, 256, 224);
        else {
          // 封面与旧物种使用 object-fit: contain，点击框须采用相同的居中比例。
          const ratio = Math.min(256 / image.naturalWidth, 224 / image.naturalHeight);
          const width = image.naturalWidth * ratio;
          const height = image.naturalHeight * ratio;
          hitContext.drawImage(image, (256 - width) / 2, (224 - height) / 2, width, height);
        }
        area = alphaHitArea(hitContext.getImageData(0, 0, 256, 224).data, 256, 224);
      }
    } catch {
      // 资源不可读取时仍保留可操作的点击框，素材失败不影响喂养和拖拽。
    }
    area = area || fullPetHitArea;
    hitCache.set(key, area);
  }
  const stamp = `${area.x}:${area.y}:${area.width}:${area.height}`;
  if (stamp !== lastHitArea) {
    lastHitArea = stamp;
    emit('hit-area', area);
  }
}
function onPreviewLoad(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement) || !target.naturalWidth) return;
  if (
    target.classList.contains('pet-sprite__poster') ||
    target.classList.contains('pet-legacy-sprite__asset')
  )
    publishHitArea(target, `poster:${target.src}`);
}

// 已接入图集的物种共用动作时钟，其他物种仍使用原有形象。
const legacyAnimation = computed(() =>
  props.action === 'eat'
    ? 'eat'
    : ['grow-out', 'grow-in', 'happy'].includes(props.action)
    ? 'evolve'
    : '',
);

const fallbackSrc = computed(() => {
  if (!hasPetAtlas(props.species) || posterFailures.value > 1) return '';
  if (posterFailures.value === 0) return petPoster(props.stage, props.species);
  // 位图不可用时回退到同物种、同阶段的 SVG。
  const stageDir = props.species === 'dog' && props.stage === 'egg' ? 'puppy' : props.stage;
  const base = (process.env.VUE_APP_PUBLIC_PATH || '/').replace(/\/?$/, '/');
  return `${base}assets/pets/${props.species}/${stageDir}/idle.svg`;
});
function onPosterError() {
  posterFailures.value += 1;
}

function currentClip(): PetClip {
  const idle = manifest?.actions.idle;
  if (props.action === 'eat' && props.species === 'dog') return eatingClip;
  if (props.action === 'grow-out' || props.action === 'grow-in') {
    return {
      loop: false,
      frames: [{ rect: idle?.frames[0].rect || [0, 0, 256, 224], duration: 360 }],
    };
  }
  if (props.action === 'look' && manifest?.actions.look) {
    const frame = manifest.actions.look.frames[Math.max(0, Math.min(15, props.lookIndex))];
    return { loop: true, frames: [frame] };
  }
  if (manifest?.actions[props.action]) return manifest.actions[props.action];
  // 即使资源失败也推进动作时钟，避免喂养按钮永久锁定。
  return {
    loop: !['eat', 'happy', 'greet'].includes(props.action),
    frames: [{ rect: [0, 0, 256, 224], duration: props.action === 'eat' ? 1440 : 900 }],
  };
}

function prepareEatingClip(clip?: PetClip) {
  const prepared = withFeedingTiming(
    clip || { loop: false, frames: [{ rect: [0, 0, 256, 224], duration: 1440 }] },
    props.species,
  );
  eatingClip = prepared;
  feedingTiming.value = prepared.bowlTiming;
  feedingDuration.value = eatingClip.frames.reduce((total, frame) => total + frame.duration, 0);
}

function paint(clip: PetClip) {
  if (!atlas || !ready.value || !canvasRef.value) return;
  const frame = sampleClip(clip, reducedMotion.value ? 0 : elapsed).frame;
  const stamp = `${props.stage}:${frame.rect.join(',')}`;
  if (paintedFrame === stamp) return;
  const context = canvasRef.value.getContext('2d');
  if (context) {
    context.clearRect(0, 0, 256, 224);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(atlas, ...frame.rect, 0, 0, 256, 224);
    publishHitArea(atlas, stamp, frame.rect);
    paintedFrame = stamp;
  }
}
function finish() {
  if (completedToken !== props.token) {
    completedToken = props.token;
    emit('complete', props.token);
  }
}
function tick(now: number) {
  animationFrame = 0;
  const clip = currentClip();
  if (lastTime) elapsed += Math.min(now - lastTime, 100);
  lastTime = now;
  if (props.action === 'eat' && props.species === 'dog') feedingElapsed.value = elapsed;
  paint(clip);
  if (sampleClip(clip, elapsed).done) finish();
  if (!disposed && !props.paused && !document.hidden && !reducedMotion.value) {
    animationFrame = window.requestAnimationFrame(tick);
  }
}
function stopClock() {
  window.cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  lastTime = 0;
}
function startClock() {
  stopClock();
  if (disposed || props.paused || document.hidden) return;
  if (reducedMotion.value) {
    paint(currentClip());
    if (!currentClip().loop) {
      // 延后到状态发布结束，保证导演层已注册本次完成回调。
      const token = props.token;
      Promise.resolve().then(() => {
        if (!disposed && token === props.token) finish();
      });
    }
  } else {
    animationFrame = window.requestAnimationFrame(tick);
  }
}
function onMotionPreference() {
  reducedMotion.value = motionPreference?.matches || false;
  paintedFrame = '';
  startClock();
}

watch(
  () => [props.stage, props.species],
  async () => {
    const version = ++requestVersion;
    const { species, stage } = props;
    ready.value = false;
    posterFailures.value = 0;
    hitCache.clear();
    lastHitArea = '';
    emit('hit-area', fullPetHitArea);
    atlas = null;
    manifest = null;
    prepareEatingClip();
    startClock();
    if (!hasPetAtlas(species)) return;
    try {
      const nextManifest = await loadPetManifest(species);
      const nextAtlas = await loadPetImage(
        `${nextManifest.stages[stage].file}?v=${nextManifest.version}`,
        species,
      );
      if (!disposed && version === requestVersion) {
        manifest = nextManifest;
        prepareEatingClip(nextManifest.actions.eat);
        atlas = nextAtlas;
        ready.value = true;
        paintedFrame = '';
        startClock();
      }
    } catch {
      // 封面及同物种 SVG 独立回退；业务动作完成不依赖解码成功。
    }
  },
  { immediate: true },
);
watch(
  () => [props.action, props.token, props.lookIndex],
  () => {
    elapsed = 0;
    feedingElapsed.value = 0;
    completedToken = -1;
    paintedFrame = '';
    startClock();
  },
);
watch(() => props.paused, startClock);
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', onMotionPreference);
  document.addEventListener('visibilitychange', startClock);
  onMotionPreference();
});
onBeforeUnmount(() => {
  disposed = true;
  requestVersion += 1;
  stopClock();
  atlas = null;
  hitContext = null;
  hitCache.clear();
  motionPreference?.removeEventListener('change', onMotionPreference);
  document.removeEventListener('visibilitychange', startClock);
});
</script>

<style lang="scss">
.pet-sprite {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  > .pet-legacy-sprite {
    width: 100%;
    height: 100%;
  }
  &::before {
    position: absolute;
    right: 19%;
    bottom: 2%;
    left: 19%;
    height: 8%;
    content: '';
    background: rgba(73, 47, 22, 0.16);
    filter: blur(3px);
    border-radius: 50%;
  }
  canvas,
  &__poster {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  &__unavailable {
    position: absolute;
    bottom: 20%;
    width: 100%;
    font-size: 12px;
    color: #795b3d;
    text-align: center;
  }
  &__bowl {
    position: absolute;
    right: -3%;
    bottom: 1%;
    font-size: 25px;
  }
  &__bowl--dog {
    right: auto;
    display: block;
    height: auto;
    transform-origin: center bottom;
  }
  &__heart {
    position: absolute;
    top: 5%;
    right: 3%;
    font-size: 24px;
    color: #da826e;
    animation: pet-heart 900ms ease-out both;
  }
  &__glow {
    position: absolute;
    inset: -8%;
    background: radial-gradient(
      ellipse,
      rgba(255, 246, 208, 0.95),
      rgba(255, 218, 152, 0.6) 35%,
      transparent 70%
    );
    border-radius: 50%;
  }
  &.is-grow-out &__glow {
    animation: pet-growth 360ms ease-in both;
  }
  &.is-grow-in &__glow {
    animation: pet-growth 360ms ease-out reverse both;
  }
  &.is-dragged::before {
    opacity: 0.35;
    transform: scale(0.7);
  }
}
@keyframes pet-heart {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.8);
  }
  30% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(-16px) scale(1);
  }
}
@keyframes pet-growth {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1.15);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pet-sprite__heart,
  .pet-sprite__glow {
    display: none;
  }
}
</style>
