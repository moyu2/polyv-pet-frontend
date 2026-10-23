<template>
  <div
    v-show="visible"
    ref="dialogRef"
    class="c-mobile-dialog"
  >
    <transition
      name="fade"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-show="innerVisible"
        class="c-mobile-dialog__content-wrapper"
      >
        <!-- 蒙层 -->
        <div
          v-show="innerVisible"
          class="c-mobile-dialog__mask"
          :style="dialogMaskStyle"
          @click="onClickMask"
        ></div>
        <!-- 弹窗内容区 -->
        <div
          class="c-mobile-dialog__content"
          :style="contentStyle"
        >
          <!-- 头部 -->
          <div
            v-if="showHeader"
            class="c-mobile-dialog__content-header"
          >
            <!-- 标题 -->
            <span class="c-mobile-dialog__content-header__title">
              <slot name="title">{{ title }}</slot>
            </span>
          </div>
          <!-- 主体插槽 -->
          <slot></slot>
          <!-- 底部 -->
          <div
            v-if="showFooter"
            class="c-mobile-dialog__content-footer"
          >
            <slot name="footer"></slot>
          </div>
        </div>
        <transition name="fade">
          <div
            v-show="closable"
            class="c-mobile-dialog__close-btn"
            @click="closeDialog"
          ></div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';

import { useAppendTo } from '@/hooks/behaviors/use-append-to';

import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { dialogMobileProps, dialogEmits } from '../use-dialog';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

const props = defineProps(dialogMobileProps());

const emit = defineEmits(dialogEmits());

/** 当前组件 DOM 节点 */
const dialogRef = ref<HTMLDivElement>();
/** 内部可见标识位 */
const innerVisible = ref(false);

/** 蒙层样式 */
const dialogMaskStyle = computed(() => {
  return {
    background: `rgba(0, 0, 0, ${props.maskOpacity})`,
  };
});

const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

watch(
  () => props.visible,
  () => {
    if (props.visible) {
      openDialog();
    } else {
      closeDialog();
    }
  },
  {
    immediate: true,
  },
);

/** 打开弹窗 */
function openDialog() {
  toLockFeedDrag('mobile-dialog');

  innerVisible.value = true;
  emit('open');

  // 禁止滚动穿透
  if (props.visible && props.bodyLocked) {
    document.body.classList.add('g-body-locked');
  }

  if (dialogRef.value) {
    PlvPopperManager.openPopper(dialogRef.value);
  }
}

/** 关闭弹窗 */
function closeDialog() {
  if (props.customClose) {
    props.customClose();
    return;
  }

  toUnlockFeedDrag();

  innerVisible.value = false;
  emit('update:visible', false);
  emit('close');

  if (props.bodyLocked) {
    document.body.classList.remove('g-body-locked');
  }
}

/** 监听蒙层点击 */
function onClickMask() {
  if (props.closeOnClickMask) {
    closeDialog();
  }
}

function onAfterEnter() {
  emit('opened');
}
function onAfterLeave() {
  emit('closed');
}

// 挂载节点
if (props.appendToBody) {
  useAppendTo(dialogRef);
}
</script>

<style lang="scss">
.c-mobile-dialog {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $--zIndex-top;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.c-mobile-dialog__content-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.c-mobile-dialog__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.c-mobile-dialog__content {
  z-index: 1;
  box-sizing: border-box;
  width: 92%;
  height: auto;
  overflow-x: hidden;
  overflow-y: auto;

  font-size: 16px;

  color: #263238;
  background-color: $--color-white;

  border-radius: 8px;
}

.c-mobile-dialog__content-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 24px 24px 0 24px;
}

.c-mobile-dialog__content-footer {
  padding: 0 24px 24px 24px;
}

.c-mobile-dialog__content-header__title {
  overflow: hidden;
  font-family: PingFangSC-Medium;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-mobile-dialog__close-btn {
  z-index: 1;
  // z-index: -1;
  box-sizing: border-box;

  width: 32px;
  height: 32px;
  margin-top: 32px;

  cursor: pointer;
  background-image: url('./imgs/icon_close.png');

  background-position: center;
  background-size: 32px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.c-mobile-dialog__close-btn::before {
  position: relative;
  top: -18px;
  display: block;
  height: 1px;
  content: '';
  background-color: rgba(255, 255, 255, 0.5);
  transform: rotate(90deg);
}
</style>
