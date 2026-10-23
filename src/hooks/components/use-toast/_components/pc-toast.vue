<template>
  <transition
    name="toast-fade-move"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
  >
    <div
      v-show="toastVisible"
      ref="toastRef"
      class="c-pc-toast"
      :class="toastClasses"
      :style="toastStyle"
    >
      <span class="c-pc-toast__icon g-img-cover"></span>
      <div class="c-pc-toast__text">{{ msg }}</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { toastProps, toastEmits, useToastComp } from '../_hooks/use-toast-comp';
const props = defineProps(toastProps());

const emit = defineEmits(toastEmits());

const {
  toastRef,
  toastVisible,
  toastClasses,
  toastStyle,
  toastInstance,
  onAfterEnter,
  onAfterLeave,
} = useToastComp({
  props,
  emit,
  prefixCls: 'c-pc-toast',
});

defineExpose(toastInstance);
</script>

<style lang="scss">
$--toast-min-width: 90px !default;
$--toast-height: 48px !default;
$--toast-shadow: 0 6px 30px 5px rgba(0, 0, 0, 0.05) !default;

.c-pc-toast {
  position: absolute;
  left: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: $--toast-min-width;
  height: $--toast-height;
  padding: 0 16px;
  font-size: 14px;
  line-height: 16px;
  color: #757575;
  background-color: $--color-white;
  border: 1px solid #dcdcdc;
  border-radius: 2px;
  box-shadow: $--toast-shadow;
  transition: opacity 0.3s, transform 0.4s, top 0.4s;
  transform: translateX(-50%);
}

.c-pc-toast__icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.c-pc-toast--info .c-pc-toast__icon {
  background-image: url(./imgs/toast-info.svg);
}

.c-pc-toast--success .c-pc-toast__icon {
  background-image: url(./imgs/toast-success.svg);
}

.c-pc-toast--warning .c-pc-toast__icon {
  background-image: url(./imgs/toast-warning.svg);
}

.c-pc-toast--error .c-pc-toast__icon {
  background-image: url(./imgs/toast-error.svg);
}

.c-pc-toast--help .c-pc-toast__icon {
  background-image: url(./imgs/toast-help.svg);
}

.c-pc-toast--loading .c-pc-toast__icon {
  background-image: url(./imgs/toast-loading.svg);
  animation: spin 1s ease infinite;
}

.toast-fade-move-enter {
  opacity: 0;
  transform: translate(-50%, 100%);
}
.toast-fade-move-leave-active {
  opacity: 0;
  transform: translate(-50%, -100%);
}
</style>
