<!-- @file 竖屏回放字幕浮层 -->
<template>
  <transition name="fade">
    <div
      v-show="shouldShow"
      ref="subtitleRef"
      class="c-portrait-replay-subtitle"
      :class="{ 'c-portrait-replay-subtitle--dragging': isDragging }"
      :style="subtitleStyle"
      @touchstart.passive="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <p
        v-if="mainReplaySubtitleShow && mainText"
        class="c-portrait-replay-subtitle__line"
      >
        {{ mainText }}
      </p>
      <p
        v-if="subReplaySubtitleShow && translatedText"
        class="c-portrait-replay-subtitle__line c-portrait-replay-subtitle__line--translate"
      >
        {{ translatedText }}
      </p>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useReplaySubtitle } from '@/components/page-watch-common/subtitle/use-replay-subtitle';

const subtitleRef = ref<HTMLElement>();
const isDragging = ref(false);
const hasDragged = ref(false);

const position = reactive({
  left: 0,
  bottom: 0,
});

const dragState = reactive({
  startX: 0,
  startY: 0,
  startLeft: 0,
  startBottom: 0,
});

const { mainText, translatedText, mainReplaySubtitleShow, subReplaySubtitleShow } =
  useReplaySubtitle();

const { replaySubtitleVisible } = storeDefinitionToRefs(useSubtitleStore);

const subtitleStyle = computed(() => ({
  left: `${position.left}px`,
  bottom: `${position.bottom}px`,
}));

const hasVisibleContent = computed(() => {
  const mainVisible =
    mainReplaySubtitleShow.value && mainText.value && mainText.value.trim().length > 0;
  const translateVisible =
    subReplaySubtitleShow.value && translatedText.value && translatedText.value.trim().length > 0;
  return mainVisible || translateVisible;
});

const shouldShow = computed(() => {
  return replaySubtitleVisible.value && hasVisibleContent.value;
});

const clampPosition = (nextLeft?: number, nextBottom?: number) => {
  const el = subtitleRef.value;
  if (!el) return;

  const elWidth = el.offsetWidth;
  const elHeight = el.offsetHeight;

  const maxLeft = Math.max(12, window.innerWidth - elWidth - 12);
  const maxBottom = Math.max(12, window.innerHeight - elHeight - 12);

  const targetLeft = nextLeft ?? position.left;
  const targetBottom = nextBottom ?? position.bottom;

  position.left = Math.min(Math.max(12, targetLeft), maxLeft);
  position.bottom = Math.min(Math.max(12, targetBottom), maxBottom);
};

const setInitialPosition = () => {
  const el = subtitleRef.value;
  if (!el) return;

  const elWidth = el.offsetWidth;

  const centeredLeft = Math.max(12, (window.innerWidth - elWidth) / 2);
  const defaultBottom = 150;

  clampPosition(centeredLeft, defaultBottom);
};

const handleTouchStart = (event: TouchEvent) => {
  if (!shouldShow.value) return;
  const touch = event.touches[0];
  if (!touch) return;

  isDragging.value = true;
  dragState.startX = touch.clientX;
  dragState.startY = touch.clientY;
  dragState.startLeft = position.left;
  dragState.startBottom = position.bottom;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - dragState.startX;
  const deltaY = touch.clientY - dragState.startY;

  clampPosition(dragState.startLeft + deltaX, dragState.startBottom - deltaY);
};

const handleTouchEnd = () => {
  if (isDragging.value) {
    hasDragged.value = true;
  }
  isDragging.value = false;
};

watch(
  () => shouldShow.value,
  visible => {
    if (!visible) return;

    nextTick(() => {
      if (!subtitleRef.value) return;

      if (!hasDragged.value) {
        setInitialPosition();
      } else {
        clampPosition();
      }
    });
  },
);

watch(
  () => [mainText.value, translatedText.value],
  () => {
    nextTick(() => {
      if (shouldShow.value) {
        clampPosition();
      }
    });
  },
);
</script>

<style lang="scss">
.c-portrait-replay-subtitle {
  position: fixed;
  z-index: 2150;
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  width: 295px;
  max-width: calc(100vw - 32px);
  min-height: 32px;
  padding: 6px 12px;
  line-height: 1.5;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(20px);
  transition: box-shadow 0.2s ease;

  &--dragging {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.36);
  }
}

.c-portrait-replay-subtitle__line {
  font-size: 12px;
  text-align: center;
  word-break: break-word;

  // &--translate {
  //   opacity: 0.82;
  // }
}
</style>
