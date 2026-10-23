<template>
  <div
    v-if="store.pet || store.loginError"
    class="pet-companion"
    @keydown.esc="bubbleOpen = false"
  >
    <button
      v-if="store.pet && collapsed && !fullscreen"
      class="pet-recall"
      type="button"
      @click="restorePet"
    >
      🐾 唤回小伙伴
    </button>
    <div
      v-if="store.pet && !collapsed && !fullscreen"
      ref="rootRef"
      class="pet-desktop"
      :style="deskStyle"
    >
      <button
        class="pet-desktop__hide"
        :style="hideStyle"
        type="button"
        aria-label="收起宠物"
        @click="collapsePet"
      >
        ×
      </button>
      <pet-canvas
        class="pet-desktop__visual"
        :stage="scene.stage"
        :species="store.pet.species"
        :action="scene.action"
        :token="scene.token"
        :look-index="scene.lookIndex"
        :paused="paused"
        @hit-area="hitArea = $event"
        @complete="director.complete($event)"
      />
      <button
        class="pet-desktop__pet"
        :class="{ 'is-dragging': dragging }"
        :style="hitStyle"
        type="button"
        :aria-label="`${store.pet.name}，${stageName}，左键打招呼，右键或长按喂养，也可拖动`"
        :aria-expanded="bubbleOpen"
        aria-controls="pet-feed-bubble"
        aria-keyshortcuts="Shift+F10"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
        @lostpointercapture="onPointerCancel"
        @click="greetPet"
        @contextmenu.prevent.stop="openFeeding"
        @keydown="onPetKeydown"
      />
      <transition name="pet-bubble">
        <section
          v-if="bubbleOpen"
          ref="bubbleRef"
          id="pet-feed-bubble"
          class="pet-desktop__bubble"
          :style="bubbleStyle"
          aria-label="宠物喂养"
          @keydown.esc.stop="bubbleOpen = false"
        >
          <div class="pet-desktop__heading">
            <strong>{{ store.pet.name }}</strong
            ><span>{{ stageName }}</span>
            <button
              class="pet-desktop__switch"
              type="button"
              :disabled="interactionBusy"
              @click="openPicker"
            >
              换宠物
            </button>
            <button
              type="button"
              aria-label="关闭喂养面板"
              @click="bubbleOpen = false"
            >
              ×
            </button>
          </div>
          <div class="pet-desktop__wallet">
            <span>可用积分</span><strong>{{ shortBalance }}</strong>
          </div>
          <comment-reward-hint />
          <div class="pet-desktop__meter-label">
            <span>成长经验</span
            ><span>{{ store.pet.exp }} / {{ store.pet.nextStageExp ?? '已长大' }}</span>
          </div>
          <div
            class="pet-desktop__meter"
            role="progressbar"
            aria-label="成长经验"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <i :style="{ width: `${progress}%` }" />
          </div>
          <div class="pet-desktop__meter-label">
            <span>饱食度</span><span>{{ store.pet.satiety }}</span>
          </div>
          <div
            class="pet-desktop__meter is-satiety"
            role="progressbar"
            aria-label="饱食度"
            :aria-valuenow="store.pet.satiety"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <i :style="{ width: `${store.pet.satiety}%` }" />
          </div>
          <div class="pet-desktop__foods">
            <button
              v-for="food in store.foods"
              :key="food.code"
              type="button"
              :disabled="!store.canAfford(food) || interactionBusy"
              @click="onFeed(food)"
            >
              <span
                class="pet-desktop__food-icon"
                aria-hidden="true"
              >
                <img
                  v-if="food.imageUrl"
                  :src="food.imageUrl"
                  :alt="food.name"
                  loading="lazy"
                />
                <template v-else>{{ food.code === 'nutrition_meal' ? '🍱' : '🥣' }}</template>
              </span>
              <strong>{{ food.name }}</strong
              ><span>{{ Number(food.pointCost) }} 积分</span>
            </button>
          </div>
          <label class="pet-size">
            <span>宠物大小</span>
            <input
              type="range"
              aria-label="宠物大小"
              min="100"
              :max="maxScalePercent"
              step="1"
              :value="scalePercent"
              :aria-valuetext="`${scalePercent}%`"
              @pointerdown="pinSizePanel"
              @input="onScaleInput"
              @keydown="onScaleKeydown"
            />
            <output aria-label="当前宠物大小">{{ scalePercent }}%</output>
          </label>
          <p
            class="pet-desktop__hint"
            aria-live="polite"
          >
            {{
              interactionBusy
                ? '正在享用，稍等一下…'
                : store.pet.satiety < 30
                ? '有点饿啦，喂它一口吧'
                : '一起看直播，慢慢长大'
            }}
          </p>
        </section>
      </transition>
      <div
        v-if="rewardText || dogFeeding"
        class="pet-desktop__reward"
        :class="{ 'is-feeding': dogFeeding }"
        :style="store.pet.species === 'dog' ? feedbackStyle : undefined"
        aria-live="polite"
      >
        {{ dogFeeding ? '正在吃饭…' : rewardText }}
      </div>
    </div>
    <pet-picker
      v-if="pickerOpen && store.pet"
      :pet="store.pet"
      @close="pickerOpen = false"
    />
    <div
      v-if="store.toast || store.loginError"
      class="pet-desktop__toast"
      :class="{ 'is-error': store.loginError || store.toastType === 'error' }"
      role="status"
      aria-live="polite"
    >
      {{ store.loginError || store.toast }}
    </div>
  </div>
</template>

<script setup lang="ts">
import CommentRewardHint from './comment-reward-hint.vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import PetCanvas from './pet-canvas.vue';
import PetPicker from './pet-picker.vue';
import { PetDirector } from './pet-animation';
import { clearPreparedPetImage, hasPetAtlas, preparePetStage } from './pet-assets';
import type { PetScene } from './pet-animation';
import type { FoodInfo } from './pet-api';
import {
  clampPetPosition,
  findPetDock,
  getPetSize,
  lookDirection,
  normalizePetScale,
  placePetBubble,
  resizePetPosition,
  safeWalkTarget,
} from './pet-motion';
import type { PetPoint, PetRect, PetViewport } from './pet-motion';
import { fullPetHitArea } from './pet-hit-area';
import type { PetHitArea } from './pet-hit-area';
import { usePetStore } from './use-pet-store';

const store = usePetStore();
const rootRef = ref<HTMLElement>();
const bubbleRef = ref<HTMLElement>();
const bubbleHeight = ref(340);
const pinnedBubble = ref<PetPoint | null>(null);
const hitArea = ref<PetHitArea>(fullPetHitArea);
const scaleStorageKey = 'polyv-pet:scale:v2';
const requestedScale = ref(readPetScale());
const bubbleOpen = ref(false);
const pickerOpen = ref(false);
const dragging = ref(false);
const collapsed = ref(false);
const fullscreen = ref(false);
const hidden = ref(document.hidden);
const reducedMotion = ref(false);
const rewardText = ref('');
const viewport = reactive<PetViewport>({
  width: window.innerWidth,
  height: window.innerHeight,
  petWidth: 136,
  petHeight: 119,
});
const pos = reactive<PetPoint>({ x: 16, y: 16 });
const petSize = computed(() => getPetSize(viewport.width, viewport.height, requestedScale.value));
const scalePercent = computed(() => Math.round(petSize.value.scale * 100));
const maxScalePercent = computed(() => Math.max(100, Math.floor(petSize.value.maxScale * 100)));
const scene = ref<PetScene>({
  stage: store.pet?.stage || 'egg',
  action: 'idle',
  token: 0,
  lookIndex: 0,
  busy: false,
});
const director = new PetDirector(scene.value.stage, next => {
  scene.value = next;
});
const interactionBusy = computed(() => store.feeding || store.switching || scene.value.busy);
const dogFeeding = computed(() => store.pet?.species === 'dog' && scene.value.action === 'eat');
const paused = computed(
  () => hidden.value || collapsed.value || fullscreen.value || pickerOpen.value,
);
const stageName = computed(() =>
  store.pet?.species === 'dog'
    ? { egg: '幼犬', juvenile: '少年犬', adult: '成犬' }[store.pet.stage]
    : store.pet?.stageName || '',
);
const shortBalance = computed(() =>
  Number(store.balance).toLocaleString('zh-CN', { maximumFractionDigits: 2 }),
);
const progress = computed(() => Math.round((store.pet?.stageProgress ?? 1) * 100));
const deskStyle = computed(() => ({
  transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
  width: `${viewport.petWidth}px`,
  height: `${viewport.petHeight}px`,
  '--pet-scale': String(petSize.value.scale),
}));
const hitRect = computed(() => {
  const width = Math.min(viewport.petWidth, Math.max(44, viewport.petWidth * hitArea.value.width));
  const height = Math.min(
    viewport.petHeight,
    Math.max(44, viewport.petHeight * hitArea.value.height),
  );
  return {
    x: Math.min(
      viewport.petWidth - width,
      Math.max(
        0,
        viewport.petWidth * hitArea.value.x - (width - viewport.petWidth * hitArea.value.width) / 2,
      ),
    ),
    y: Math.min(
      viewport.petHeight - height,
      Math.max(
        0,
        viewport.petHeight * hitArea.value.y -
          (height - viewport.petHeight * hitArea.value.height) / 2,
      ),
    ),
    width,
    height,
  };
});
const hitStyle = computed(() => ({
  left: `${hitRect.value.x}px`,
  top: `${hitRect.value.y}px`,
  width: `${hitRect.value.width}px`,
  height: `${hitRect.value.height}px`,
}));
const hideStyle = computed(() => ({
  left: `${Math.min(viewport.petWidth - 28, hitRect.value.x + hitRect.value.width - 10)}px`,
  top: `${Math.min(viewport.petHeight - 28, hitRect.value.y)}px`,
}));
const feedbackStyle = computed(() => ({
  left: `${hitRect.value.x + hitRect.value.width / 2}px`,
  top: `${Math.max(0, hitRect.value.y - 30)}px`,
}));
const bubbleStyle = computed(() => {
  const width = Math.min(252, viewport.width - 24);
  const height = Math.min(bubbleHeight.value, viewport.height - 24);
  const anchor = pinnedBubble.value || placePetBubble(pos, viewport, width, height);
  const left = Math.max(12, Math.min(anchor.x, viewport.width - width - 12));
  const top = Math.max(12, Math.min(anchor.y, viewport.height - height - 12));
  return { width: `${width}px`, left: `${left - pos.x}px`, top: `${top - pos.y}px` };
});

let obstacles: PetRect[] = [];
let controls: PetRect[] = [];
let manuallyPlaced = requestedScale.value !== 1;
let clock = 0;
let layoutFrame = 0;
let lastFrame = 0;
let lastInteraction = performance.now();
let nextWander = performance.now() + 12000;
let walkGoal: number | null = null;
let pointerLook: number | null = null;
let pointerAt = 0;
let suppressClick = false;
let disposed = false;
let rewardTimer = 0;
let resizeObserver: ResizeObserver | null = null;
let bubbleObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let motionPreference: MediaQueryList | null = null;
let longPressTimer = 0;
let dragStart: {
  id: number;
  x: number;
  y: number;
  origin: PetPoint;
  moved: boolean;
  longPressed: boolean;
  target: HTMLElement;
} | null = null;

function touch() {
  lastInteraction = performance.now();
  nextWander = lastInteraction + 12000;
  walkGoal = null;
}

/** 拖动滑杆期间固定喂养面板，避免宠物变大后面板换边，滑杆从指针下移走。 */
function pinSizePanel() {
  const rect = bubbleRef.value?.getBoundingClientRect();
  if (rect) pinnedBubble.value = { x: rect.left, y: rect.top };
}
function releaseSizePanel() {
  pinnedBubble.value = null;
}
function onScaleInput(event: Event) {
  setPetScale(Number((event.target as HTMLInputElement).value));
}
function onScaleKeydown(event: KeyboardEvent) {
  // 保留原生滑杆的键盘操作，阻止观看页同时响应音量、快进等快捷键。
  if (
    [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ].includes(event.key)
  )
    event.stopPropagation();
}

function readPetScale(): number {
  try {
    return normalizePetScale(Number(localStorage.getItem(scaleStorageKey)));
  } catch {
    return 1;
  }
}

function applyPetSize() {
  const next = petSize.value;
  if (next.petWidth === viewport.petWidth && next.petHeight === viewport.petHeight) return;
  Object.assign(pos, resizePetPosition(pos, viewport, { ...viewport, ...next }));
  viewport.petWidth = next.petWidth;
  viewport.petHeight = next.petHeight;
}

/** 大小调整属于主动摆放，不重新执行自动避障，也不打断正在播放的进食和成长。 */
function setPetScale(percent: number) {
  requestedScale.value = normalizePetScale(percent / 100);
  manuallyPlaced = true;
  touch();
  applyPetSize();
  try {
    localStorage.setItem(scaleStorageKey, String(requestedScale.value));
  } catch {
    /* 存储不可用时，本次大小调整仍可继续。 */
  }
}
/** 闲逛避开业务区域；首屏无空白时仍显示宠物，停靠优先避开输入区和弹窗。 */
function updateLayout() {
  layoutFrame = 0;
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  applyPetSize();
  fullscreen.value =
    !!document.fullscreenElement ||
    !!document.querySelector(
      '.g-page-player-system-fullscreen, .c-pc-watch-layout__main__fullscreen-wrap--page-fullscreened',
    );
  const controlSelector =
    '[data-pet-avoid], .c-mobile-chat-message-input, .c-pc-chat-message-input, .c-portrait-chat-message-input, [role="dialog"], .pws-dialog';
  const selector = `${controlSelector}, .c-pc-watch-layout__main__fullscreen-wrap, .c-pc-watch-layout__main__right, .c-mobile-watch-layout__player`;
  resizeObserver?.disconnect();
  resizeObserver?.observe(document.documentElement);
  const regions = Array.from(document.querySelectorAll<HTMLElement>(selector))
    .filter(element => !element.closest('.pet-companion'))
    .map(element => {
      resizeObserver?.observe(element);
      const rect = element.getBoundingClientRect();
      return {
        rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
        control: element.matches(controlSelector),
      };
    })
    .filter(
      ({ rect }) =>
        rect.right > rect.left &&
        rect.bottom > rect.top &&
        rect.bottom > 0 &&
        rect.top < viewport.height,
    );
  obstacles = regions.map(region => region.rect);
  controls = regions.filter(region => region.control).map(region => region.rect);
  // 自动停靠仍避开业务区域；手动摆放优先，聊天更新、滚动或缩放不再把它推回底部。
  const dock = manuallyPlaced
    ? clampPetPosition(pos, viewport)
    : findPetDock(viewport, obstacles, controls, pos);
  if (!dragging.value) Object.assign(pos, dock);
  if (fullscreen.value) {
    releaseSizePanel();
    director.interrupt();
    bubbleOpen.value = false;
  }
  walkGoal = null;
}
function scheduleLayout() {
  if (!layoutFrame && !disposed) layoutFrame = window.requestAnimationFrame(updateLayout);
}

function updateWalk(delta: number): boolean {
  if (walkGoal === null) return false;
  const distance = walkGoal - pos.x;
  pos.x += Math.min(Math.abs(distance), delta * 34 * petSize.value.scale) * Math.sign(distance);
  director.ambient(distance < 0 ? 'walk-left' : 'walk-right');
  if (Math.abs(distance) < 1) walkGoal = null;
  return true;
}
function updateMood(now: number) {
  if (['greet', 'happy'].includes(scene.value.action)) return;
  if (pointerLook !== null && now - pointerAt < 1800) director.ambient('look', pointerLook);
  else if (now - lastInteraction > 60000) director.ambient('sleep');
  else if ((store.pet?.satiety ?? 100) < 30) director.ambient('hungry');
  else director.ambient('idle');
  if (now <= nextWander || viewport.width < 600 || reducedMotion.value) return;
  nextWander = now + 14000 + Math.random() * 9000;
  const target = safeWalkTarget(pos, (Math.random() < 0.5 ? -1 : 1) * 120, viewport, obstacles);
  if (Math.abs(target - pos.x) > 16) walkGoal = target;
}
function tick(now: number) {
  clock = 0;
  const delta = lastFrame ? Math.min(now - lastFrame, 50) / 1000 : 0;
  lastFrame = now;
  const idle =
    !paused.value && store.pet && !dragging.value && !interactionBusy.value && !bubbleOpen.value;
  if (idle && !updateWalk(delta)) updateMood(now);
  if (!disposed && !hidden.value) clock = window.requestAnimationFrame(tick);
}

async function onFeed(food: FoodInfo) {
  if (interactionBusy.value) return;
  touch();
  const sequence = director.beginFeed();
  const result = await store.feed(food);
  if (!result) {
    director.failFeed(sequence);
    return;
  }
  if (disposed || paused.value || dragging.value) {
    director.sync(result.pet.stage);
    director.interrupt(dragging.value ? 'dragged' : 'idle');
    return;
  }
  const prepared =
    hasPetAtlas(result.pet.species) && result.evolved && !result.idempotent
      ? preparePetStage(result.pet.stage, result.pet.species)
      : undefined;
  const playback = director.finishFeed(result, sequence, prepared);
  // 仅狗使用新的喂食面板和反馈；其他物种保留原有交互。
  if (result.pet.species === 'dog' && scene.value.action === 'eat' && scene.value.busy) {
    bubbleOpen.value = false;
    rewardText.value = '';
    window.clearTimeout(rewardTimer);
  }
  const played = await playback;
  if (played && !disposed) {
    if (result.pet.species === 'dog') touch();
    rewardText.value = `+${result.expGain} 经验${result.evolved ? ' · 长大啦！' : ''}`;
    window.clearTimeout(rewardTimer);
    rewardTimer = window.setTimeout(() => {
      rewardText.value = '';
    }, 2200);
  }
}

/** 选择弹层暂停桌宠，保存后仍以服务端的物种和成长状态为准。 */
function openPicker() {
  if (interactionBusy.value) return;
  touch();
  director.interrupt();
  bubbleOpen.value = false;
  pickerOpen.value = true;
}

function greetPet(event: MouseEvent) {
  if (event.button !== 0 || event.ctrlKey) return;
  if (suppressClick && event.detail !== 0) {
    suppressClick = false;
    return;
  }
  if (interactionBusy.value || paused.value) return;
  touch();
  director.interrupt('greet');
}
function openFeeding() {
  if (
    dragging.value ||
    paused.value ||
    disposed ||
    !store.pet ||
    (store.pet.species === 'dog' && interactionBusy.value)
  )
    return;
  touch();
  const wasOpen = bubbleOpen.value;
  bubbleOpen.value = true;
  if (!interactionBusy.value) {
    director.ambient('idle');
    if (!wasOpen) store.refreshState();
  }
}
function onPetKeydown(event: KeyboardEvent) {
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
    event.preventDefault();
    event.stopPropagation();
    openFeeding();
  }
}
function collapsePet() {
  releasePointer();
  collapsed.value = true;
  bubbleOpen.value = false;
  director.interrupt();
  try {
    localStorage.setItem('polyv-pet:collapsed:v2', '1');
  } catch {
    /* 私密浏览可禁用存储。 */
  }
}
function restorePet() {
  collapsed.value = false;
  manuallyPlaced = true;
  try {
    localStorage.removeItem('polyv-pet:collapsed:v2');
  } catch {
    /* 存储失败不影响本次唤回。 */
  }
  updateLayout();
  Object.assign(pos, findPetDock(viewport, obstacles, controls));
  director.interrupt('greet');
  touch();
}
function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || !event.isPrimary) return;
  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);
  dragStart = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    origin: { ...pos },
    moved: false,
    longPressed: false,
    target,
  };
  suppressClick = false;
  touch();
  if (event.pointerType === 'touch') {
    longPressTimer = window.setTimeout(() => {
      longPressTimer = 0;
      if (!dragStart || dragStart.id !== event.pointerId || dragStart.moved || paused.value) return;
      dragStart.longPressed = true;
      suppressClick = true;
      openFeeding();
    }, 600);
  }
}
function onPointerMove(event: PointerEvent) {
  if (!dragStart || event.pointerId !== dragStart.id || dragStart.longPressed) return;
  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  if (!dragStart.moved && Math.hypot(dx, dy) > 6) {
    window.clearTimeout(longPressTimer);
    longPressTimer = 0;
    dragStart.moved = true;
    manuallyPlaced = true;
    dragging.value = true;
    bubbleOpen.value = false;
    director.interrupt('dragged');
  }
  if (dragStart.moved) {
    Object.assign(
      pos,
      clampPetPosition({ x: dragStart.origin.x + dx, y: dragStart.origin.y + dy }, viewport),
    );
  }
}
function releasePointer() {
  window.clearTimeout(longPressTimer);
  longPressTimer = 0;
  const pointer = dragStart;
  dragStart = null;
  dragging.value = false;
  if (pointer?.target.hasPointerCapture(pointer.id))
    pointer.target.releasePointerCapture(pointer.id);
}
function onPointerUp(event: PointerEvent) {
  if (!dragStart || dragStart.id !== event.pointerId) return;
  const moved = dragStart.moved;
  releasePointer();
  if (moved) {
    suppressClick = true;
    updateLayout();
    director.ambient('greet');
    touch();
  }
}
function onPointerCancel() {
  if (!dragStart) return;
  suppressClick = true;
  releasePointer();
  director.interrupt();
  updateLayout();
}
function onDocumentPointer(event: PointerEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    bubbleOpen.value = false;
  }
}
function onPointerLook(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || reducedMotion.value || dragging.value || paused.value)
    return;
  pointerLook = lookDirection(
    event.clientX - pos.x - viewport.petWidth / 2,
    event.clientY - pos.y - viewport.petHeight * 0.35,
    pointerLook,
  );
  pointerAt = performance.now();
}
function onVisibility() {
  hidden.value = document.hidden;
  releaseSizePanel();
  director.interrupt();
  window.cancelAnimationFrame(clock);
  lastFrame = 0;
  if (!hidden.value) {
    touch();
    scheduleLayout();
    clock = window.requestAnimationFrame(tick);
  }
}
function onMotionPreference() {
  reducedMotion.value = motionPreference?.matches || false;
  walkGoal = null;
}

watch(bubbleRef, element => {
  bubbleObserver?.disconnect();
  bubbleObserver = null;
  if (!element) return;
  const measure = () => {
    bubbleHeight.value = element.getBoundingClientRect().height;
  };
  bubbleObserver = new ResizeObserver(measure);
  bubbleObserver.observe(element);
  measure();
});
watch(bubbleOpen, open => {
  if (!open) releaseSizePanel();
});

watch(
  () => store.pet?.stage,
  stage => {
    if (stage) director.sync(stage);
    else director.interrupt();
  },
);
watch(
  () => store.pet?.species,
  () => {
    // 防止旧物种的动作和预加载资源影响更换后的形象。
    clearPreparedPetImage();
    director.interrupt();
    rewardText.value = '';
  },
);
onMounted(() => {
  try {
    collapsed.value = localStorage.getItem('polyv-pet:collapsed:v2') === '1';
  } catch {
    /* 使用默认展开偏好。 */
  }
  pos.x = viewport.width - viewport.petWidth - 24;
  pos.y = viewport.height - viewport.petHeight - 24;
  resizeObserver = new ResizeObserver(scheduleLayout);
  mutationObserver = new MutationObserver(records => {
    if (records.some(record => !(record.target as Element).closest?.('.pet-companion')))
      scheduleLayout();
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', onMotionPreference);
  document.addEventListener('pointerdown', onDocumentPointer, true);
  document.addEventListener('pointermove', onPointerLook, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('fullscreenchange', scheduleLayout);
  window.addEventListener('resize', scheduleLayout);
  window.addEventListener('scroll', scheduleLayout, true);
  window.addEventListener('blur', onPointerCancel);
  window.addEventListener('blur', releaseSizePanel);
  window.addEventListener('pointerup', releaseSizePanel);
  window.addEventListener('pointercancel', releaseSizePanel);
  onMotionPreference();
  updateLayout();
  clock = window.requestAnimationFrame(tick);
});
onBeforeUnmount(() => {
  disposed = true;
  clearPreparedPetImage();
  director.interrupt();
  releasePointer();
  window.cancelAnimationFrame(clock);
  window.cancelAnimationFrame(layoutFrame);
  window.clearTimeout(rewardTimer);
  resizeObserver?.disconnect();
  bubbleObserver?.disconnect();
  mutationObserver?.disconnect();
  motionPreference?.removeEventListener('change', onMotionPreference);
  document.removeEventListener('pointerdown', onDocumentPointer, true);
  document.removeEventListener('pointermove', onPointerLook);
  document.removeEventListener('visibilitychange', onVisibility);
  document.removeEventListener('fullscreenchange', scheduleLayout);
  window.removeEventListener('resize', scheduleLayout);
  window.removeEventListener('scroll', scheduleLayout, true);
  window.removeEventListener('blur', onPointerCancel);
  window.removeEventListener('blur', releaseSizePanel);
  window.removeEventListener('pointerup', releaseSizePanel);
  window.removeEventListener('pointercancel', releaseSizePanel);
});
</script>

<style lang="scss">
.pet-desktop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 390;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #57412f;
  pointer-events: none;
}
.pet-desktop__visual {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.pet-desktop__pet {
  position: absolute;
  display: block;
  padding: 0;
  overflow: hidden;
  pointer-events: auto;
  touch-action: none;
  cursor: grab;
  user-select: none;
  background: none;
  border: 0;
  border-radius: 24px;
}
.pet-desktop__pet.is-dragging {
  cursor: grabbing;
}
.pet-desktop__pet:focus-visible,
.pet-desktop button:focus-visible,
.pet-size input:focus-visible,
.pet-recall:focus-visible {
  outline: 2px solid #c58445;
  outline-offset: 3px;
}
.pet-desktop__hide {
  position: absolute;
  z-index: 1;
  width: 28px;
  height: 28px;
  color: #84694f;
  pointer-events: none;
  cursor: pointer;
  background: #fffaf2;
  border: 1px solid #eadccc;
  border-radius: 50%;
  opacity: 0;
}
.pet-desktop:hover .pet-desktop__hide,
.pet-desktop:focus-within .pet-desktop__hide {
  pointer-events: auto;
  opacity: 1;
}
@media (hover: none), (pointer: coarse) {
  .pet-desktop__hide {
    pointer-events: auto;
    opacity: 1;
  }
}
.pet-desktop__bubble {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  max-height: calc(100vh - 24px);
  /* stylelint-disable-next-line unit-no-unknown -- 跟随手机浏览器动态视口 */
  max-height: calc(100dvh - 24px);
  padding: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  background: #fffdf8;
  border: 1px solid #e9dfd1;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(65, 42, 20, 0.16);
}
.pet-desktop__heading {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
}
.pet-desktop__heading > span {
  padding: 3px 7px;
  font-size: 11px;
  color: #94734e;
  background: #f5ead9;
  border-radius: 8px;
}
.pet-desktop__heading > strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pet-desktop__heading > span {
  flex-shrink: 0;
  white-space: nowrap;
}
.pet-desktop__heading > button {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  margin-left: auto;
  color: #94734e;
  cursor: pointer;
  background: none;
  border: 0;
}
.pet-desktop__heading > .pet-desktop__switch {
  width: auto;
  padding: 3px 6px;
  font-size: 11px;
  white-space: nowrap;
  background: #f5ead9;
  border-radius: 8px;
}
.pet-size {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  margin-top: 10px;
  font-size: 11px;
  color: #8b7560;
  border-top: 1px solid #eee4d7;
}
.pet-size > span {
  flex-shrink: 0;
}
.pet-size input {
  flex: 1;
  width: 0;
  min-width: 0;
  height: 28px;
  padding: 0;
  margin: 0;
  touch-action: pan-y;
  cursor: ew-resize;
  accent-color: #bd8d56;
}
.pet-size output {
  flex-shrink: 0;
  width: 34px;
  font-variant-numeric: tabular-nums;
  color: #795633;
  text-align: right;
}
.pet-desktop__switch:disabled {
  opacity: 0.45;
}
.pet-desktop__wallet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 12px;
  color: #8b7560;
}
.pet-desktop__wallet strong {
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #624528;
}
.pet-desktop__meter-label {
  display: flex;
  justify-content: space-between;
  margin: 9px 0 5px;
  font-size: 11px;
  color: #8b7560;
}
.pet-desktop__meter {
  height: 5px;
  overflow: hidden;
  background: #f0e9de;
  border-radius: 5px;
}
.pet-desktop__meter i {
  display: block;
  height: 100%;
  background: #dbad69;
  border-radius: inherit;
  transition: width 300ms;
}
.pet-desktop__meter.is-satiety i {
  background: #91aa80;
}
.pet-desktop__foods {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.pet-desktop__foods > button {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  padding: 9px 5px;
  color: #664a30;
  cursor: pointer;
  background: #faf3e8;
  border: 1px solid #ede0cb;
  border-radius: 12px;
}
.pet-desktop__foods > button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.pet-desktop__foods strong {
  font-size: 12px;
  font-weight: 500;
}
.pet-desktop__foods button > span:last-child {
  font-size: 11px;
  color: #9b7f60;
}
.pet-desktop__food-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 22px;
  line-height: 1;
}
.pet-desktop__food-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}
.pet-desktop__hint {
  margin: 11px 0 0;
  font-size: 11px;
  line-height: 16px;
  color: #9c856d;
  text-align: center;
}
.pet-desktop .pet-sprite__bowl:not(.pet-sprite__bowl--dog) {
  right: 0;
  font-size: calc(25px * var(--pet-scale, 1));
}
.pet-desktop .pet-sprite__heart {
  font-size: calc(24px * var(--pet-scale, 1));
}
.pet-desktop__reward {
  position: absolute;
  top: -34px;
  left: 50%;
  padding: 7px 11px;
  font-size: 12px;
  color: #83602f;
  white-space: nowrap;
  background: #fff4d9;
  border-radius: 16px;
  transform: translateX(-50%);
}
.pet-desktop__reward.is-feeding {
  padding: 5px 9px;
  font-size: 11px;
  color: #947451;
  background: #fffaf1;
}
.pet-desktop__toast {
  position: fixed;
  top: 24px;
  left: 50%;
  z-index: 10000;
  box-sizing: border-box;
  max-width: calc(100vw - 32px);
  padding: 11px 18px;
  font-size: 13px;
  line-height: 1.5;
  color: #fff;
  background: #66513d;
  border-radius: 16px;
  transform: translateX(-50%);
}
.pet-desktop__toast.is-error {
  background: #a85d49;
}
.pet-recall {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 390;
  min-height: 40px;
  padding: 8px 14px;
  font-size: 12px;
  color: #735535;
  cursor: pointer;
  background: #fffaf0;
  border: 1px solid #eadccc;
  border-radius: 24px;
}
.pet-bubble-enter-active,
.pet-bubble-leave-active {
  transition: opacity 140ms, transform 140ms;
}
.pet-bubble-enter,
.pet-bubble-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
@media (pointer: coarse) {
  .pet-desktop__hide {
    width: 36px;
    height: 36px;
  }
  .pet-desktop__heading > button {
    width: 36px;
    height: 36px;
  }
  .pet-desktop__foods > button {
    min-height: 70px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pet-bubble-enter-active,
  .pet-bubble-leave-active,
  .pet-desktop__meter i {
    transition: none;
  }
}
</style>
