<!-- @file PC 端播放器右侧弹出层 -->
<template>
  <div
    v-show="visible"
    ref="wrapRef"
    class="c-pc-side-popup"
    :style="sidePopupStyle"
  >
    <!-- 关闭按钮 -->
    <div
      v-if="!title"
      class="c-pc-side-popup__btn__close"
      @click="closePopup"
    >
      <pc-icon-close />
    </div>

    <div
      v-if="title"
      class="c-pc-side-popup__header"
    >
      <div class="c-pc-side-popup__header__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <pc-icon-close
        class="c-pc-side-popup__header__close"
        @click="closePopup"
      />
    </div>

    <transition
      name="slide"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
    >
      <div class="c-pc-side-popup__body">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';

import { sidePcPopupProps, sidePcPopupEmits, useSidePcPopup } from './use-pc-side-popup';

const props = defineProps(sidePcPopupProps());

const emits = defineEmits(sidePcPopupEmits());

const { wrapRef, sidePopupStyle, afterEnter, afterLeave, closePopup, couponSidePopupInstance } =
  useSidePcPopup({
    props,
    emits,
  });

defineExpose(couponSidePopupInstance);
</script>

<style lang="scss">
.c-pc-side-popup {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}

.c-pc-side-popup__btn__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 16px;
  line-height: 18px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background: rgba(#000, 0.2);
  border-radius: 50%;

  span {
    display: flex;
  }
}

.c-pc-side-popup__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 0 52px;
  background: #fff;
}

.c-pc-side-popup__header__title {
  font-size: 16px;
  color: rgba(#000, 0.8);
}

.c-pc-side-popup__header__close {
  position: absolute;
  top: 50%;
  right: 20px;
  display: flex;
  font-size: 24px;
  color: rgba(#000, 0.6);
  cursor: pointer;
  transform: translateY(-50%);
}

.c-pc-side-popup__body {
  position: relative;
  z-index: 0;
  flex: 1;
  overflow: hidden;
}
</style>
