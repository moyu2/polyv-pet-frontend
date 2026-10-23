<!-- @file PC 端弹窗 -->
<template>
  <div
    class="c-pc-dialog"
    :class="dialogThemeClass"
    ref="dialogRef"
  >
    <transition
      name="fade"
      v-if="mask"
    >
      <div
        v-show="visible"
        class="c-pc-dialog__mask"
        :style="{
          'z-index': zIndex,
        }"
        @click="handleClickMask"
      ></div>
    </transition>

    <transition
      name="fade"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
    >
      <div
        v-show="visible"
        ref="dialogContentRef"
        class="c-pc-dialog__content"
        :class="{
          'c-pc-dialog__content--drag': draggable,
        }"
        :style="dialogStyle"
        @click.stop
      >
        <div
          ref="dialogContentHeaderRef"
          class="c-pc-dialog__header"
          :class="{
            'c-pc-dialog__header--hide-border': hideHeaderBorder,
          }"
        >
          <h1 class="g-singleline">{{ title }}</h1>
          <pc-icon-close
            v-if="closable"
            class="c-pc-dialog__header__close"
            @click.stop="closeDialog"
          />
        </div>

        <transition name="fade">
          <div
            v-show="dialogTips"
            class="c-pc-dialog__tips"
          >
            {{ dialogTips }}
          </div>
        </transition>

        <div class="c-pc-dialog__body">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { useDialogTips } from '../use-dialog-tips';
import { PcIconClose } from '@/components/component-icons/pc/map';
import { CSSProperties } from 'vue/types/jsx';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { DialogInstance } from '@/components/common-base/dialog/pc-dialog/types';

import { dialogPcProps, dialogEmits } from '../use-dialog';
import { usePageTheme } from '@/themes/use-page-theme';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

const { getAppRootElement, getAppBodyElement, getAppElement } = useMultiPolyvWatchApp();

const { getThemeClassName } = usePageTheme();

const dialogThemeClass = computed(() => {
  const themeClassName = getThemeClassName();
  if (themeClassName) {
    return {
      [themeClassName]: true,
    };
  }

  return {};
});

const props = defineProps(dialogPcProps());

const emits = defineEmits(dialogEmits());

const { dialogTips } = useDialogTips();

const dialogRef = ref<HTMLDivElement>();
const dialogContentRef = ref<HTMLDivElement>();
const dialogContentHeaderRef = ref<HTMLDivElement>();

/** 窗口是否处于关闭状态 */
const closed = ref(true);
// 弹窗定位坐标
const top = ref(0);
const left = ref(0);

/** 是否正在拖拽中 */
const isDragging = ref(false);
/** 是否发生过拖拽 */
const happenDragged = ref(false);

// 记录上一刻拖拽的位置
const dragPointX = ref();
const dragPointY = ref();

const zIndex = ref(3000);

const dialogStyle = computed(() => {
  const style: CSSProperties = {
    width: `${props.width}px`,
    top: `${unref(top)}px`,
    left: `${unref(left)}px`,
    zIndex: zIndex.value,
  };
  if (props.height) {
    style.height = `${props.height}px`;
  }
  if (props.round) {
    style.borderRadius = '16px';
  }
  return style;
});

/** 判断是否需要锁定 body 的滚动条 */
const needBodyLocked = computed(() => {
  if (typeof props.bodyLocked === 'boolean') {
    return props.bodyLocked;
  }
  // 在不显示蒙层挡板下不锁滚动条
  if (!props.mask) {
    return false;
  }
  return true;
});

watch(
  () => props.visible,
  newValue => {
    if (newValue) {
      openDialog();
    } else {
      closeDialog();
    }
  },
);

watch(
  () => props.mountEl,
  newValue => {
    if (!newValue) {
      getAppBodyElement().appendChild(dialogRef.value!);
    }
  },
);

function openDialog() {
  if (!unref(closed)) {
    return;
  }

  closed.value = false;
  emits('open');
  setMountEl();

  // 禁止滚动穿透
  if (needBodyLocked.value) {
    document.body.classList.add('g-body-locked');
  }

  listenDocumentEvent();

  nextTick(() => {
    PlvPopperManager.openPopper(dialogRef.value!);
    zIndex.value = PlvPopperManager.zIndex;

    if (!unref(happenDragged)) {
      resetPosition();
    }
    checkPosition();
  });
}

function closeDialog() {
  if (unref(closed)) {
    return;
  }

  emits('update:visible', false);
  emits('close');
  closed.value = true;

  // 移除滚动禁用穿透
  if (needBodyLocked.value) {
    document.body.classList.remove('g-body-locked');
  }

  unlistenDocumentEvent();
}

// 处理点击蒙层
function handleClickMask() {
  if (!props.closeOnClickMask) {
    return;
  }
  closeDialog();
}

function afterEnter() {
  emits('opened');
}

function afterLeave() {
  emits('closed');
}

function setMountEl() {
  if (props.mountEl) {
    const mountElNode = getAppRootElement().querySelector(props.mountEl);
    mountElNode && mountElNode.appendChild(dialogRef.value!);
  } else if (props.appendToBody) {
    getAppBodyElement().appendChild(dialogRef.value!);
  }
}

/** 监听页面事件 */
function listenDocumentEvent() {
  window.addEventListener('resize', handleDocumentEventToReset);
  document.addEventListener('scroll', handleDocumentEventToReset);

  if (props.draggable) {
    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  }
}

/** 移除页面监听事件 */
function unlistenDocumentEvent() {
  window.removeEventListener('resize', handleDocumentEventToReset);
  document.removeEventListener('scroll', handleDocumentEventToReset);
  document.removeEventListener('mousedown', handleDocumentMouseDown);
  document.removeEventListener('mousemove', handleDocumentMouseMove);
  document.removeEventListener('mouseup', handleDocumentMouseUp);
}

onMounted(() => {
  setMountEl();
  if (props.visible) {
    openDialog();
  }
});

onBeforeUnmount(() => {
  unlistenDocumentEvent();

  if (props.appendToBody && dialogRef.value && dialogRef.value.parentNode) {
    dialogRef.value.parentNode.removeChild(dialogRef.value);
  }

  if (needBodyLocked.value) {
    document.body.classList.remove('g-body-locked');
  }
});

// 处理页面滚动
function handleDocumentEventToReset() {
  // 在没发生过拖拽下才复位
  if (!unref(happenDragged)) {
    resetPosition();
  }
  checkPosition();
}

// 处理页面鼠标按下事件
function handleDocumentMouseDown(e: MouseEvent) {
  if (!dialogContentHeaderRef.value) {
    return;
  }

  if (!dialogContentHeaderRef.value.contains(e.target as Node)) {
    return;
  }
  isDragging.value = true;

  dragPointX.value = e.pageX;
  dragPointY.value = e.pageY;
}

// 处理页面鼠标移动事件
function handleDocumentMouseMove(e: MouseEvent) {
  if (
    !isDragging.value ||
    typeof dragPointX.value === 'undefined' ||
    typeof dragPointY.value === 'undefined'
  ) {
    return;
  }
  happenDragged.value = true;

  const diffY = e.pageY - dragPointY.value;
  const diffX = e.pageX - dragPointX.value;

  top.value += diffY;
  left.value += diffX;

  dragPointX.value = e.pageX;
  dragPointY.value = e.pageY;

  checkPosition();
}

// 处理页面鼠标抬起事件
function handleDocumentMouseUp() {
  isDragging.value = false;
  dragPointX.value = undefined;
  dragPointY.value = undefined;
}

// 计算定位位置，将弹窗复位
function resetPosition() {
  const $dialogContent = dialogContentRef.value;
  if (!$dialogContent) return;

  let $wrapElem = getAppRootElement() as Element;

  // 窗口滚动数据
  const scrollTop = getAppRootElement().scrollTop;
  const scrollLeft = getAppRootElement().scrollLeft;

  // 如果有传入位置计算元素则使用对应的节点作为外层计算
  if (props.positionComputedElem) {
    const elem = getAppRootElement().querySelector(props.positionComputedElem);
    if (elem) {
      $wrapElem = elem;
    }
  }

  const isDocumentElement = $wrapElem === getAppRootElement();
  const bound = $wrapElem.getBoundingClientRect();
  const boundY = bound.y || bound.top;
  const boundX = bound.x || bound.left;

  // 外层尺寸
  const wrapWidth = $wrapElem.clientWidth;
  const wrapHeight = $wrapElem.clientHeight;
  // 外层位置
  const wrapTop = isDocumentElement ? 0 : boundY;
  const wrapLeft = isDocumentElement ? 0 : boundX;
  // 弹层尺寸
  const contentWidth = $dialogContent.clientWidth;
  const contentHeight = $dialogContent.clientHeight;
  // 计算弹层在窗口的居中
  const diffWidth = (wrapWidth - contentWidth) / 2;
  const diffHeight = (wrapHeight - contentHeight) / 2;

  left.value = wrapLeft + diffWidth + scrollLeft;
  top.value = wrapTop + diffHeight + scrollTop;
}

// 检查弹层位置，禁止在页面之外
function checkPosition() {
  const $appElem = getAppElement();
  if (!$appElem) return;

  const $dialogContent = dialogContentRef.value;
  if (!$dialogContent) return;

  const wrapWidth = $appElem.clientWidth;
  const wrapHeight = $appElem.clientHeight;

  if (wrapWidth === 0 || wrapHeight === 0) {
    return;
  }

  const minTop = 0;
  const maxTop = wrapHeight - $dialogContent.offsetHeight;
  if (top.value < minTop) {
    top.value = minTop;
  }
  if (top.value > maxTop) {
    top.value = maxTop;
  }

  const minLeft = 0;
  const maxLeft = wrapWidth - $dialogContent.offsetWidth;
  if (left.value < minLeft) {
    left.value = minLeft;
  }
  if (left.value > maxLeft) {
    left.value = maxLeft;
  }
}

defineExpose<DialogInstance>({
  resetPosition,
  setMountEl,
  handleDocumentEventToReset,
});
</script>

<style lang="scss">
.c-pc-dialog__mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
}

.c-pc-dialog__content {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 560px;
  max-height: 90%;
  font-size: 16px;
  color: $--font-color-primary;
  pointer-events: initial;
  background-color: $--color-white;
  border: 1px solid $--border-color-primary;
  border-radius: 2px;
  box-shadow: $--shadow-dialog;
}

.c-pc-dialog__header {
  z-index: 20;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 100%;
  height: 48px;
  padding-right: 48px;
  padding-left: 16px;
  font-size: 14px;
  line-height: 48px;
  color: $--font-color-primary;
  border-bottom: 1px solid $--border-color-primary;
  border-radius: 4px 4px 0 0;

  &.c-pc-dialog__header--hide-border {
    border-bottom: none;
  }
}

.c-pc-dialog__header__close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 20px !important;
  color: $--font-color-info;
  cursor: pointer;
}

.c-pc-dialog__tips {
  height: 24px;
  font-size: 13px;
  line-height: 24px;
  color: $--color-white;
  text-align: center;
  background: rgba(255, 0, 0, 0.68);
}

.c-pc-dialog__body {
  position: relative;
  z-index: 10;
  flex: 1 1 auto; // IE 不能直接缩写成 flex: 1
  overflow-y: auto;
}

.c-pc-dialog__content--drag {
  .c-pc-dialog__header {
    cursor: move;
    user-select: none;
  }
}
</style>
