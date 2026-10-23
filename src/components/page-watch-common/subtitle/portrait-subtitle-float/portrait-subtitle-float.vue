<!-- @file 竖屏字幕浮窗组件 -->
<template>
  <transition name="fade">
    <div v-show="isVisible">
      <div
        v-show="liveSubtitlesEnable"
        ref="subtitleFloatRef"
        class="c-portrait-subtitle-float"
        :class="{
          'c-portrait-subtitle-float--expanded': isExpanded,
          'c-portrait-subtitle-float--dragging': isDragging,
        }"
        :style="floatStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 拖拽手柄 -->
        <!-- <div class="c-portrait-subtitle-float__handle">
        <div class="c-portrait-subtitle-float__handle-bar"></div>
      </div> -->
        <div
          class="c-portrait-subtitle-float__control-btn c-portrait-subtitle-float__close-btn"
          @click="handleClose"
        >
          <mobile-icon-subtitle-close />
        </div>

        <!-- 字幕内容区域 -->
        <div
          ref="subtitleContentRef"
          class="c-portrait-subtitle-float__content"
        >
          <!-- 显示数量限制提示 -->
          <div
            v-if="subtitleDisplayNumberLimitEnabled && subtitleDisplayNumber > 0"
            class="c-portrait-subtitle-float__limit"
          >
            {{ $lang('subtitle.limit', { limit: String(subtitleDisplayNumber) }) }}
          </div>

          <!-- 字幕列表 -->
          <div class="c-portrait-subtitle-float__list c-subtitle__scroll">
            <!-- 历史字幕 -->
            <div
              v-for="(item, index) in subtitleList"
              :key="index"
              class="c-portrait-subtitle-float__item"
            >
              <!-- 原文 -->
              <div
                v-if="shouldShowOriginal && item[liveSubtitleSourceLanguage]"
                class="c-portrait-subtitle-float__original"
              >
                {{ item[liveSubtitleSourceLanguage] }}
              </div>

              <!-- 翻译 -->
              <div
                v-if="shouldShowTranslate && item[liveSubtitleSourceTranslateLanguage]"
                class="c-portrait-subtitle-float__translate"
              >
                {{ item[liveSubtitleSourceTranslateLanguage] }}
              </div>

              <div
                v-if="
                  (shouldShowOriginal && item[liveSubtitleSourceLanguage]) ||
                  (shouldShowTranslate && item[liveSubtitleSourceTranslateLanguage])
                "
                class="c-portrait-subtitle-float__divider"
              />
            </div>

            <!-- 当前正在说的字幕 -->
            <div
              v-if="currentSubtitle && shouldShowOriginal"
              class="c-portrait-subtitle-float__item c-portrait-subtitle-float__item--current"
            >
              <div class="c-portrait-subtitle-float__original">
                {{ currentSubtitle }}
              </div>
            </div>

            <div
              v-if="!currentSubtitle && !subtitleList.length"
              class="c-portrait-subtitle-float__empty pws-subtitle__empty"
            >
              {{ $lang('subtitle.empty') }}
            </div>
          </div>

          <!-- 底部提示 -->
          <!-- <div class="c-portrait-subtitle-float__footer">
            <span>实时字幕由AI生成，仅供参考</span>
          </div> -->

          <!-- 新消息提示 -->
          <div
            v-show="hasNewMessage"
            class="c-portrait-subtitle-float__new-message"
            @click="scrollToBottom()"
          >
            <span>{{ $lang('subtitle.new') }}</span>
            <mobile-icon-arrow-down />
          </div>
        </div>

        <!-- 放大/缩小按钮 - 右下角 -->
        <div
          class="c-portrait-subtitle-float__control-btn c-portrait-subtitle-float__expand-btn"
          @click="toggleExpand"
        >
          <mobile-icon-subtitle-expand v-if="!isExpanded" />
          <mobile-icon-subtitle-compress v-else />
        </div>

        <portrait-subtitle-float-guide class="c-portrait-subtitle-float__guide" />
      </div>
      <div
        v-show="!liveSubtitlesEnable"
        class="c-portrait-subtitle-float__empty pws-subtitle__empty"
      >
        {{ $lang('subtitle.empty') }}
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, reactive, onMounted } from 'vue';
import {
  MobileIconSubtitleCompress,
  MobileIconSubtitleClose,
  MobileIconSubtitleExpand,
  MobileIconArrowDown,
  // MobileIconEmpty,
} from '@/components/component-icons/mobile/map';
import PortraitSubtitleFloatGuide from './portrait-subtitle-float-guide.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useSubtitle } from '@/components/page-watch-common/subtitle/use-subtitle';

const props = defineProps<{
  /** 是否显示 */
  visible: boolean;
  /** 字幕显示模式：双语、原文、译文 */
  displayMode: 'all' | 'source' | 'translate';
}>();

const emit = defineEmits(['close', 'update:visible']);

const {
  liveSubtitlesEnable,
  subtitleTranslateEnabled,
  liveSubtitleSourceLanguage,
  liveSubtitleSourceTranslateLanguage,
  subtitleDisplayNumberLimitEnabled,
  subtitleDisplayNumber,
} = storeDefinitionToRefs(useSubtitleStore);

const subtitleContentRef = ref<HTMLElement>();
const subtitleFloatRef = ref<HTMLElement>();

const {
  subtitleList,
  currentSubtitle,
  hasNewMessage,
  scrollToBottom: hookScrollToBottom,
  firstToSubtitle,
} = useSubtitle(subtitleContentRef, {
  scrollBottomThreshold: 70,
});

const isVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value);
  },
});

// 是否展开为半屏
const isExpanded = ref(false);

// 拖拽相关状态
const isDragging = ref(false);
const dragState = reactive({
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0,
  currentLeft: 0,
  currentTop: 0,
});

// 浮窗位置状态
const floatPosition = reactive({
  left: 12, // 默认left值（对应CSS中的left: 12px）
  top: -1, // -1表示使用CSS默认的bottom定位
});

// 浮窗位置样式
const floatStyle = computed(() => {
  const baseStyle: any = {};

  if (isDragging.value) {
    baseStyle.left = `${dragState.currentLeft}px`;
    baseStyle.top = `${dragState.currentTop}px`;
    baseStyle.right = 'auto';
    baseStyle.bottom = 'auto';
    baseStyle.transition = 'none';
  } else if (floatPosition.top >= 0) {
    // 如果有保存的位置，使用保存的位置
    baseStyle.left = `${floatPosition.left}px`;
    baseStyle.top = `${floatPosition.top}px`;
    baseStyle.right = 'auto';
    baseStyle.bottom = 'auto';
  }

  return baseStyle;
});

// 计算是否显示原文
const shouldShowOriginal = computed(() => {
  return props.displayMode === 'all' || props.displayMode === 'source';
});

// 计算是否显示翻译
const shouldShowTranslate = computed(() => {
  return (
    (props.displayMode === 'all' || props.displayMode === 'translate') &&
    subtitleTranslateEnabled.value
  );
});

// 滚动到底部 - 直接使用hook的方法
const scrollToBottom = () => {
  hookScrollToBottom(false);
};

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  // 等待过渡动画完成后再调整位置
  setTimeout(() => {
    adjustFloatPosition();
    scrollToBottom();
  }, 300);
};

// 调整浮窗位置，确保在可视范围内
function adjustFloatPosition() {
  if (!subtitleFloatRef.value) return;

  const rect = subtitleFloatRef.value.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let newLeft = floatPosition.left;
  let newTop = floatPosition.top;

  // 如果使用默认位置（top为-1），则不需要调整
  if (floatPosition.top < 0) return;

  const minLeft = 12;
  const maxLeft = Math.max(minLeft, windowWidth - rect.width - 12);
  const minTop = 20;
  const maxTop = Math.max(minTop, windowHeight - rect.height - 20);

  // 限制位置在可视范围内
  newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
  newTop = Math.max(minTop, Math.min(newTop, maxTop));

  // 如果位置有变化，更新位置
  if (newLeft !== floatPosition.left || newTop !== floatPosition.top) {
    floatPosition.left = newLeft;
    floatPosition.top = newTop;
  }
}

// 触摸开始
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  const rect = subtitleFloatRef.value?.getBoundingClientRect();

  if (!rect) return;

  // 检查是否点击在按钮上，如果是则不处理拖拽
  const target = e.target as HTMLElement;
  if (
    target.closest('.c-portrait-subtitle-float__control-btn') ||
    target.closest('.c-portrait-subtitle-float__content') ||
    target.closest('.c-portrait-subtitle-float__guide')
  ) {
    return;
  }

  isDragging.value = true;
  dragState.startX = touch.clientX;
  dragState.startY = touch.clientY;
  dragState.startLeft = rect.left;
  dragState.startTop = rect.top;
  dragState.currentLeft = rect.left;
  dragState.currentTop = rect.top;

  e.preventDefault();
};

// 触摸移动
const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - dragState.startX;
  const deltaY = touch.clientY - dragState.startY;
  const newLeft = dragState.startLeft + deltaX;
  const newTop = dragState.startTop + deltaY;

  // 限制拖拽范围 - 实时获取当前尺寸
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const rect = subtitleFloatRef.value?.getBoundingClientRect();
  const floatWidth = rect?.width || 0;
  const floatHeight = rect?.height || 0;

  const minLeft = 12;
  const maxLeft = Math.max(minLeft, windowWidth - floatWidth - 12);
  const minTop = 20;
  const maxTop = Math.max(minTop, windowHeight - floatHeight - 20);

  dragState.currentLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
  dragState.currentTop = Math.max(minTop, Math.min(newTop, maxTop));

  e.preventDefault();
};

// 触摸结束
const handleTouchEnd = () => {
  if (isDragging.value) {
    // 保存最终位置
    floatPosition.left = dragState.currentLeft;
    floatPosition.top = dragState.currentTop;
    isDragging.value = false;
  }
};

// 关闭浮窗
const handleClose = () => {
  emit('close');
};

// 监听可见性变化，初始化滚动位置
watch(
  () => props.visible,
  visible => {
    if (visible) {
      nextTick(() => {
        // 浮窗显示时，滚动到底部
        scrollToBottom();
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  firstToSubtitle();
});
</script>

<style lang="scss">
.c-portrait-subtitle-float {
  position: fixed;
  right: 12px;
  bottom: 200px;
  left: 12px;
  z-index: 2150;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: calc(100% - 24px);
  height: 120px;
  padding: 20px 28px 12px 12px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(30px);

  &.c-portrait-subtitle-float--expanded {
    width: calc(100% - 24px);
    height: 360px;
  }

  &.c-portrait-subtitle-float--dragging {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
}

.c-portrait-subtitle-float__handle {
  display: flex;
  justify-content: center;
  padding: 6px 0;
  cursor: move;
}

.c-portrait-subtitle-float__handle-bar {
  width: 32px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.c-portrait-subtitle-float__header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.c-portrait-subtitle-float__close-btn-container {
  position: fixed;
  top: 8px;
  right: 12px;
  z-index: 10;
  pointer-events: auto;
}

.c-portrait-subtitle-float__control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.c-portrait-subtitle-float__close-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 24px;
  color: #fff;
}

.c-portrait-subtitle-float__expand-btn {
  position: absolute;
  right: 4px;
  bottom: 4px;
  font-size: 24px;
  color: #fff;
}

.c-portrait-subtitle-float__content {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  pointer-events: auto;
}

.c-portrait-subtitle-float__limit {
  padding: 8px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.c-portrait-subtitle-float__list {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

.c-portrait-subtitle-float__item {
  box-sizing: border-box;
  max-width: 100%;
  margin-bottom: 6px;
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;

  &.c-portrait-subtitle-float__item--current {
    border-radius: 4px;
    animation: pulse 2s infinite;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.c-portrait-subtitle-float__original {
  max-width: 100%;
  margin-bottom: 3px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.95);
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.c-portrait-subtitle-float__divider {
  height: 1px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.1);
}

.c-portrait-subtitle-float__translate {
  max-width: 100%;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.7);
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.c-portrait-subtitle-float__footer {
  flex-shrink: 0;
  padding: 8px 12px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.c-portrait-subtitle-float__new-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  transform: translateX(-50%);

  span {
    font-size: 11px;
    color: rgba(0, 0, 0, 0.8);
  }

  svg {
    width: 10px;
    height: 10px;
    color: rgba(0, 0, 0, 0.8);
  }
}

.c-portrait-subtitle-float__empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  font-size: 12px;

  .polyv-icon-empty {
    font-size: 32px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.c-portrait-subtitle-float__guide {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
