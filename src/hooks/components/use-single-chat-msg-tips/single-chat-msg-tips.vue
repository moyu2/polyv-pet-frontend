<!-- @file 单例气泡 -->
<template>
  <transition name="fade">
    <div
      class="c-mobile-single-msg-tips"
      :class="{
        'c-mobile-single-msg-tips-placement--top': !isPlacementBottom,
        'c-mobile-single-msg-tips-placement--bottom': isPlacementBottom,
      }"
      ref="singleChatMsgTipsRef"
      :style="singleChatMsgTipsStyle"
      v-show="isMsgTipsPopperVisible"
    >
      <div class="c-mobile-single-msg-tips-main">
        <div
          v-for="tipsItem in displaySingleTipsData"
          :key="tipsItem.content"
          class="c-mobile-single-msg-tips__item"
          @click="onTipsItemClick(tipsItem)"
        >
          <span v-html="tipsItem.content"></span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import {
  SingleChatMsgTipsData,
  singleChatMsgTipsInstance,
  SingleChatMsgTipsOptions,
  SingleTipsPosition,
} from './_types/index';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { storeToRefs } from 'pinia';

const chatMsgStore = useChatMsgStore();
const { isMsgTipsPopperVisible } = storeToRefs(chatMsgStore);

/** 气泡实例 */
const singleChatMsgTipsRef = ref<HTMLDivElement>();
/** 气泡内容 */
const singleTipsData = ref<SingleChatMsgTipsData[]>([]);

/** 聊天内容框实例 */
let referenceTarget: HTMLDivElement;

/** 过滤可显示的气泡内容 */
const displaySingleTipsData = computed(() => {
  return singleTipsData.value.filter(item => !item.hidden);
});

useAppendTo(singleChatMsgTipsRef);

useClickOutside([singleChatMsgTipsRef], () => {
  $hideTips();
});

/** 点击气泡内选项 */
function onTipsItemClick(tipsItem: SingleChatMsgTipsData) {
  tipsItem.onClick(tipsItem);
  nextTick(() => {
    $hideTips();
  });
}

/** 聊天消息顶部超出列表区域, 气泡显示在消息底部 */
let singleTipsMountEl: string;

function getMountElRect() {
  const ele = document.querySelector(`.${singleTipsMountEl}`) || document.body;
  return ele.getBoundingClientRect();
}

/** 定位气泡位置 */
const isPlacementBottom = ref(false);

const singleTipsPosition = ref<SingleTipsPosition>({
  x: 0,
  y: 0,
});

const singleChatMsgTipsStyle = computed<CSSProperties>(() => {
  const { offsetX = 0, offsetY = 0 } = singleTipsPosition.value;

  return {
    top: `${singleTipsPosition.value.y + offsetY}px`,
    left: `${singleTipsPosition.value.x + offsetX}px`,
    zIndex: PlvPopperManager.zIndex + 1,
  };
});

function updatePopperLocation() {
  const { x, y, height } = referenceTarget.getBoundingClientRect();
  const { y: _mEY, height: _mEHeight } = getMountElRect();

  // 聊天内容顶部位置 > 聊天可视区域顶部位置
  if (y < _mEY) {
    isPlacementBottom.value = true;
    let _y = y + height;
    let _x = x;
    const _mEMaxY = _mEY + _mEHeight;

    // 聊天内容底部位置 > 聊天可视区域底部位置
    if (_y > _mEMaxY) {
      _y = _mEY + _mEHeight / 2;
      _x = x;
    }
    singleTipsPosition.value = {
      x: _x,
      y: _y,
    };
  } else {
    isPlacementBottom.value = false;
    singleTipsPosition.value = {
      x,
      y,
    };
  }
}

/** 更新气泡聊天消息内容 */
function $updateItemData(options: SingleChatMsgTipsOptions) {
  setTimeout(() => {
    const { target, itemData, mountEl } = options;
    singleTipsData.value = itemData;
    referenceTarget = target;
    singleTipsMountEl = mountEl;

    chatMsgStore.$patch({
      isMsgTipsPopperVisible: true,
    });

    updatePopperLocation();
  }, 100);
}

/** 隐藏气泡 */
function $hideTips() {
  chatMsgStore.$patch({
    isMsgTipsPopperVisible: false,
  });
}

defineExpose<singleChatMsgTipsInstance>({
  $hideTips,
  $updateItemData,
});
</script>

<style lang="scss">
.c-mobile-single-msg-tips {
  position: absolute;
}

.c-mobile-single-msg-tips-placement--top {
  transform: translateY(-90%);

  &::after {
    position: relative;
    top: 6px;
    left: 10px;
    width: 0;
    height: 0;
    content: '';
    border-color: #000 transparent transparent;
    border-style: solid;
    border-width: 6px 6px 0;
    opacity: 0.9;
  }
}

.c-mobile-single-msg-tips-placement--bottom {
  transform: translateY(-6px);

  &::before {
    position: relative;
    top: -6px;
    left: 10px;
    width: 0;
    height: 0;
    content: '';
    border-color: transparent transparent #000 transparent;
    border-style: solid;
    border-width: 6px;
    opacity: 0.9;
  }
}

.c-mobile-single-msg-tips-main {
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-mobile-single-msg-tips-arrow {
  position: relative;
  top: -1px;
  left: 10px;
  width: 0;
  height: 0;
  border-color: #000 transparent transparent;
  border-style: solid;
  border-width: 6px 6px 0;
  opacity: 0.9;
}

.c-mobile-single-msg-tips__item {
  padding: 12px 16px;
  color: #ffffff;
  background-color: rgba($color: #000000, $alpha: 0.9);

  &:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  &:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:not(:first-child) {
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>
