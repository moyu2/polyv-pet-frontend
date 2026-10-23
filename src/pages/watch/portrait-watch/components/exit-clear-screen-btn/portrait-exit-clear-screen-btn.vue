<!-- @file 竖屏退出清屏按钮 -->
<template>
  <div
    class="c-portrait-exit-clear-screen-btn"
    :class="{
      'c-portrait-exit-clear-screen-btn--collapsed': isTextHidden,
    }"
    @click="handleExitClearScreen"
  >
    <mobile-icon-clear-screen
      class="c-portrait-exit-clear-screen-btn__icon"
      :size="16"
    />
    <span
      class="c-portrait-exit-clear-screen-btn__text"
      :class="{
        'c-portrait-exit-clear-screen-btn__text--hidden': isTextHidden,
      }"
    >
      {{ translate('portrait.exit.clear.screen.btn.text') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { MobileIconClearScreen } from '@/components/component-icons/mobile/map';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { PropUtils } from '@polyv/vue-components';
import { onMounted, onUnmounted, ref } from 'vue';
import { translate } from '@/assets/lang';

const props = defineProps({
  /** 文字隐藏延迟时间（毫秒） */
  textHideDelay: PropUtils.number.def(2000),
});

const portraitLayoutStore = usePortraitLayoutStore();

/** 是否隐藏文字 */
const isTextHidden = ref(false);
/** 定时器 ID */
let hideTextTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 退出清屏模式
 */
function handleExitClearScreen() {
  portraitLayoutStore.switchToMainCarouselScreen();
}

onMounted(() => {
  // 延迟隐藏文字
  hideTextTimer = setTimeout(() => {
    isTextHidden.value = true;
  }, props.textHideDelay);
});

onUnmounted(() => {
  // 清理定时器
  if (hideTextTimer) {
    clearTimeout(hideTextTimer);
    hideTextTimer = null;
  }
});
</script>

<style lang="scss">
.c-portrait-exit-clear-screen-btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  color: $--color-white;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    background-color: rgba(#000, 0.8);
  }

  // 收起状态：仅显示图标
  &--collapsed {
    justify-content: center;
    width: 36px;
    padding: 0;
  }
}

.c-portrait-exit-clear-screen-btn__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.c-portrait-exit-clear-screen-btn__text {
  flex-shrink: 0;
  max-width: 60px;
  margin-left: 6px;
  overflow: hidden;
  font-size: 14px;
  line-height: 18px;
  white-space: nowrap;
  opacity: 1;
  transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out 0.1s;

  // 隐藏状态：宽度收缩 + 透明
  &--hidden {
    display: none;
    max-width: 0;
    opacity: 0;
    transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-in-out;
  }
}
</style>
