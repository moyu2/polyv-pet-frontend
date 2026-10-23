<template>
  <div
    class="pet-picker"
    @pointerdown.stop
    @click.self="close"
  >
    <section
      ref="dialogRef"
      class="pet-picker__page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pet-picker-title"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <header class="pet-picker__header">
        <div>
          <span class="pet-picker__eyebrow">宠物小屋</span>
          <h2 id="pet-picker-title">换个小伙伴</h2>
          <p>选一位喜欢的伙伴，继续一起长大</p>
        </div>
        <button
          type="button"
          class="pet-picker__close"
          aria-label="关闭宠物选择"
          :disabled="store.switching"
          @click="close"
        >
          ×
        </button>
      </header>

      <div
        class="pet-picker__content"
        :aria-busy="loading"
      >
        <p
          v-if="loading"
          class="pet-picker__message"
          role="status"
        >
          正在找小伙伴…
        </p>
        <div
          v-else-if="loadError"
          class="pet-picker__message"
        >
          <p role="alert">{{ loadError }}</p>
          <button
            type="button"
            class="pet-picker__retry"
            @click="loadSpecies"
          >
            重新加载
          </button>
        </div>
        <p
          v-else-if="!options.length"
          class="pet-picker__message"
        >
          还没有可更换的宠物，稍后再来看看吧
        </p>
        <template v-else>
          <div
            class="pet-picker__carousel"
            :class="{ 'is-dragging': dragging }"
            role="region"
            aria-label="可选择的宠物，左右滑动切换"
            aria-roledescription="轮播"
            tabindex="0"
            @pointerdown="onSwipeStart"
            @pointermove="onSwipeMove"
            @pointerup="onSwipeEnd"
            @pointercancel="cancelSwipe"
            @lostpointercapture="cancelSwipe"
          >
            <div
              class="pet-picker__track"
              :style="{ transform: `translateX(calc(-${selectedIndex * 100}% + ${dragOffset}px))` }"
            >
              <div
                v-for="(option, index) in options"
                :key="option.code"
                class="pet-picker__slide"
                role="group"
                aria-roledescription="宠物"
                :aria-label="`${index + 1} / ${options.length}：${option.name}`"
                :aria-hidden="index !== selectedIndex"
              >
                <div class="pet-picker__option">
                  <pet-sprite
                    stage="adult"
                    :species="option.code"
                  />
                  <strong>{{ option.name }}</strong>
                  <span class="pet-picker__badge">{{
                    pet.species === option.code ? '当前陪伴' : '可更换'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="options.length > 1"
            class="pet-picker__navigation"
          >
            <button
              type="button"
              class="pet-picker__arrow"
              aria-label="上一个宠物"
              :disabled="selectedIndex === 0 || store.switching"
              @click="step(-1)"
            >
              ‹
            </button>
            <div class="pet-picker__position">
              <span
                role="status"
                aria-live="polite"
                :aria-label="`${selectedOption?.name}，第 ${selectedIndex + 1} 个，共 ${
                  options.length
                } 个宠物`"
                >{{ selectedIndex + 1 }} / {{ options.length }}</span
              >
              <span>左右滑动，挑选小伙伴</span>
            </div>
            <button
              type="button"
              class="pet-picker__arrow"
              aria-label="下一个宠物"
              :disabled="selectedIndex === options.length - 1 || store.switching"
              @click="step(1)"
            >
              ›
            </button>
          </div>

          <div
            v-if="selectedOption"
            class="pet-picker__growth"
          >
            <h3>{{ selectedOption.name }}的成长模样</h3>
            <div class="pet-picker__stages">
              <div
                v-for="stage in stages"
                :key="stage.code"
                class="pet-picker__stage"
              >
                <pet-sprite
                  :stage="stage.code"
                  :species="selected"
                />
                <span>{{ stage.name }}</span>
              </div>
            </div>
          </div>
        </template>
        <p
          v-if="saveError"
          class="pet-picker__error"
          role="alert"
        >
          {{ saveError }}
        </p>
      </div>

      <footer class="pet-picker__footer">
        <p>每种宠物独立保存昵称、经验和饱食度，切回即可继续养成；积分余额共用</p>
        <button
          type="button"
          class="pet-picker__confirm"
          :disabled="loading || !selectedOption || selected === pet.species || store.switching"
          @click="save"
        >
          {{
            store.switching
              ? '更换中…'
              : selected === pet.species
              ? '正在陪伴你'
              : `换成${selectedOption?.name || '新伙伴'}`
          }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { PetInfo, PetSpecies, petApi } from './pet-api';
import PetSprite from './pet-sprite.vue';
import { usePetStore } from './use-pet-store';

const props = defineProps<{ pet: PetInfo }>();
const emit = defineEmits<{ (event: 'close'): void }>();
const store = usePetStore();
const dialogRef = ref<HTMLElement>();
const options = ref<PetSpecies[]>([]);
const selected = ref(props.pet.species);
const loading = ref(true);
const loadError = ref('');
const saveError = ref('');
const selectedIndex = computed(() =>
  Math.max(
    0,
    options.value.findIndex(option => option.code === selected.value),
  ),
);
const selectedOption = computed(() => options.value.find(option => option.code === selected.value));
const dragging = ref(false);
const dragOffset = ref(0);
let swipe: { pointerId: number; x: number; y: number } | null = null;
const stages: { code: PetInfo['stage']; name: string }[] = [
  { code: 'egg', name: '初始伙伴' },
  { code: 'juvenile', name: '幼宠' },
  { code: 'adult', name: '成宠' },
];

async function loadSpecies() {
  loading.value = true;
  loadError.value = '';
  try {
    // 可选项完全由接口决定，不在前端预置列表。
    const result = await petApi.species();
    options.value = result.species;
    if (!options.value.some(option => option.code === selected.value)) {
      selected.value = options.value[0]?.code || '';
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '暂时找不到小伙伴，请重试';
  } finally {
    loading.value = false;
  }
}

function step(direction: number) {
  if (store.switching) {
    return;
  }
  const option = options.value[selectedIndex.value + direction];
  if (!option) {
    return;
  }
  selected.value = option.code;
  saveError.value = '';
}

function onSwipeStart(event: PointerEvent) {
  if (store.switching || options.value.length < 2 || !event.isPrimary || event.button !== 0) {
    return;
  }
  swipe = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onSwipeMove(event: PointerEvent) {
  if (!swipe || swipe.pointerId !== event.pointerId) {
    return;
  }
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  // 纵向手势仍用于页面滚动，只有明确横滑才拖动卡片。
  if (!dragging.value && (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy))) {
    return;
  }
  dragging.value = true;
  const atEdge =
    (selectedIndex.value === 0 && dx > 0) ||
    (selectedIndex.value === options.value.length - 1 && dx < 0);
  dragOffset.value = atEdge ? dx * 0.2 : dx;
}

function cancelSwipe() {
  swipe = null;
  dragging.value = false;
  dragOffset.value = 0;
}

function onSwipeEnd(event: PointerEvent) {
  if (!swipe || swipe.pointerId !== event.pointerId) {
    return;
  }
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  if (dragging.value && Math.abs(dx) >= 35 && Math.abs(dx) > Math.abs(dy)) {
    step(dx < 0 ? 1 : -1);
  }
  cancelSwipe();
}

function close() {
  if (!store.switching) {
    emit('close');
  }
}

async function save() {
  if (!selectedOption.value || selected.value === props.pet.species || store.switching) {
    return;
  }
  saveError.value = '';
  const name = selectedOption.value.name;
  try {
    if (await store.switchSpecies(selected.value)) {
      store.showToast(`已换成${name}，继续一起长大吧`, 'success');
      emit('close');
    }
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : '更换失败，请稍后重试';
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    event.stopPropagation();
    step(event.key === 'ArrowLeft' ? -1 : 1);
    return;
  }
  if (event.key === 'Escape') {
    event.stopPropagation();
    close();
  }
  if (event.key !== 'Tab') {
    return;
  }
  const buttons = dialogRef.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
  if (!buttons?.length) {
    event.preventDefault();
    return;
  }
  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === dialogRef.value)
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === dialogRef.value)
  ) {
    event.preventDefault();
    first.focus();
  }
}

const previousFocus = document.activeElement;
const previousOverflow = document.body.style.overflow;
onMounted(async () => {
  document.body.style.overflow = 'hidden';
  await nextTick();
  dialogRef.value?.focus();
  loadSpecies();
});
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow;
  if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
    previousFocus.focus();
  }
});
</script>

<style lang="scss" scoped>
.pet-picker {
  position: fixed;
  inset: 0;
  z-index: 9200;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #4a3b28;
  touch-action: pan-y;
  background: rgba(52, 39, 24, 0.35);
  backdrop-filter: blur(5px);

  button {
    font: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 3px solid #e88a40;
      outline-offset: 3px;
    }

    &:disabled {
      cursor: default;
    }
  }
}

.pet-picker__page {
  display: flex;
  flex-direction: column;
  width: 440px;
  max-width: 100%;
  max-height: calc(100vh - 32px);
  /* stylelint-disable-next-line unit-no-unknown -- 兼容手机浏览器动态视口 */
  max-height: calc(100dvh - 32px);
  overflow: hidden;
  background: #fffdf9;
  border: 1px solid #fff2de;
  border-radius: 24px;
  outline: none;
  box-shadow: 0 24px 80px rgba(62, 38, 16, 0.25);
}

.pet-picker__header {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 24px 24px 18px;

  h2 {
    margin: 5px 0 7px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.3;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #9b8872;
  }
}

.pet-picker__eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: #d9823c;
  letter-spacing: 2px;
}

.pet-picker__close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 24px !important;
  line-height: 1;
  color: #a18d75;
  background: #f5efe5;
  border: 0;
  border-radius: 50%;
}

.pet-picker__content {
  min-height: 0;
  padding: 0 24px;
  overflow: auto;
  overscroll-behavior: contain;
}

.pet-picker__message {
  padding: 40px 0;
  font-size: 13px;
  color: #9b8872;
  text-align: center;
}

.pet-picker__retry {
  padding: 8px 16px;
  color: #ba6929;
  background: #fff1de;
  border: 1px solid #efd6b3;
  border-radius: 8px;
}

.pet-picker__carousel {
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
  border-radius: 18px;

  &:focus-visible {
    outline: 3px solid #e88a40;
    outline-offset: 3px;
  }

  &.is-dragging {
    cursor: grabbing;
  }
}

.pet-picker__track {
  display: flex;
  transition: transform 0.25s ease;

  .is-dragging & {
    transition: none;
  }
}

.pet-picker__slide {
  box-sizing: border-box;
  flex: 0 0 100%;
  min-width: 0;
  padding: 0 2px;
}

.pet-picker__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px 16px;
  color: #6b563c;
  background: #fff0dc;
  border: 2px solid #f7a051;
  border-radius: 18px;

  > .pet-sprite {
    width: 120px;
    height: 120px;
    margin: 0 0 6px;
    pointer-events: none;
  }

  strong {
    max-width: 100%;
    overflow: hidden;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pet-picker__navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.pet-picker__position {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  font-size: 11px;
  color: #a08768;

  [role='status'] {
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: #775e40;
  }
}

.pet-picker__arrow {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 26px !important;
  line-height: 1;
  color: #bb732f;
  background: #fff0dc;
  border: 1px solid #f3d9b6;
  border-radius: 50%;

  &:disabled {
    opacity: 0.35;
  }
}

.pet-picker__badge {
  margin-top: 5px;
  font-size: 11px;
  color: #a08768;
}

.pet-picker__growth {
  padding: 17px 0 4px;

  h3 {
    margin: 0 0 12px;
    font-size: 12px;
    font-weight: 500;
    color: #a08768;
  }
}

.pet-picker__stages {
  display: flex;
  gap: 12px;
}

.pet-picker__stage {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  font-size: 11px;
  color: #95816b;
  background: #f7f3ec;
  border-radius: 12px;

  > .pet-sprite {
    width: 52px;
    height: 52px;
    margin-bottom: 6px;
  }
}

.pet-picker__error {
  padding: 10px 12px;
  font-size: 12px;
  color: #bd5a36;
  background: #fff0e9;
  border-radius: 10px;
}

.pet-picker__footer {
  flex-shrink: 0;
  padding: 14px 24px 24px;

  p {
    margin: 0 0 12px;
    font-size: 11px;
    line-height: 1.6;
    color: #a08768;
    text-align: center;
  }
}

.pet-picker__confirm {
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  font-weight: 600 !important;
  color: #fff;
  background: linear-gradient(110deg, #ffad55, #ff8f4d);
  border: 0;
  border-radius: 12px;

  &:disabled {
    color: #af9678;
    background: #eee3d3;
  }
}

@media (max-width: 480px) {
  .pet-picker {
    padding: 12px;
  }

  .pet-picker__page {
    max-height: calc(100vh - 24px);
    /* stylelint-disable-next-line unit-no-unknown -- 兼容手机浏览器动态视口 */
    max-height: calc(100dvh - 24px);
    border-radius: 20px;
  }

  .pet-picker__header {
    padding: 20px 18px 16px;
  }

  .pet-picker__content {
    padding: 0 18px;
  }

  .pet-picker__footer {
    padding: 12px 18px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pet-picker__track {
    transition: none;
  }
}
</style>
