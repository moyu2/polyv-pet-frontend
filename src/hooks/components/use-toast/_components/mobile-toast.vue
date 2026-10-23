<template>
  <transition
    name="fade"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
  >
    <div
      v-show="toastVisible"
      ref="toastRef"
      class="c-mobile-toast"
      :class="toastClasses"
    >
      <div class="c-mobile-toast__text">{{ msg }}</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { toastProps, toastEmits, useToastComp } from '../_hooks/use-toast-comp';
const props = defineProps(toastProps());

const emit = defineEmits(toastEmits());

const { toastRef, toastVisible, toastClasses, toastInstance, onAfterEnter, onAfterLeave } =
  useToastComp({
    props,
    emit,
    prefixCls: 'c-mobile-toast',
  });

defineExpose(toastInstance);
</script>

<style lang="scss">
.c-mobile-toast {
  position: absolute;
  top: 50%;
  right: 22px;
  left: 22px;
  text-align: center;
  transform: translateY(-50%);
}

.c-mobile-toast__text {
  box-sizing: border-box;
  display: inline-block;
  max-width: 100%;
  padding: 10px 23px;
  font-size: 16px;
  line-height: 22px;
  color: #fff;
  // 使提示内容中的\n换行符生效
  white-space: pre-line;
  vertical-align: top;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.15);
}
</style>
