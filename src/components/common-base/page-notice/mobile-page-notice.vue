<template>
  <transition name="fade">
    <div
      v-if="showTips"
      class="c-mobile-page-notice"
    >
      <mobile-icon-warning-round-fill class="c-mobile-page-notice__icon" />
      <div class="c-mobile-page-notice__text">
        <slot>
          {{ tips }}
        </slot>
      </div>
      <mobile-icon-close
        class="c-mobile-page-notice__close"
        @click="onClickClose"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';
import {
  MobileIconClose,
  MobileIconWarningRoundFill,
} from '@/components/component-icons/mobile/map';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

defineProps({
  tips: PropUtils.string,
});

const { visible: showTips, close: onClickClose } = useSimpleVisible(true);
</script>

<style lang="scss">
.c-mobile-page-notice {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 16px;
  color: #fff;
  pointer-events: initial;
  background: rgba(#000000, 0.8);
  border-radius: 8px;
}
.c-mobile-page-notice__icon {
  position: relative;
  display: flex;
  margin-right: 4px;
  font-size: 14px;
  color: #ff9f45;

  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    width: 70%;
    height: 70%;
    content: '';
    background: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  svg {
    position: relative;
    z-index: 2;
  }
}

.c-mobile-page-notice__text {
  flex: 1;
  margin-right: 8px;
  line-height: 20px;
}

.c-mobile-page-notice__close {
  margin-left: auto;
  font-size: 16px;
  cursor: pointer;
}
</style>
