<template>
  <div class="c-mobile-invite-popup-title">
    {{ title }}

    <span></span>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';

defineProps({
  title: PropUtils.string,
});
</script>

<style lang="scss">
@font-face {
  font-family: DIN-improve;
  src: url('https://s4.videocc.net/font/DIN-improve.ttf');
}

.c-mobile-invite-popup-title {
  position: relative;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 11px;
  font-family: DIN-improve;
  font-size: 28px;
  line-height: 34px;
  color: #fff;

  &::before,
  &::after {
    width: 14px;
    height: 26px;
    content: '';
    background-size: 100%;
  }

  &::before {
    background-image: url(./imgs/title-right.png);
  }
  &::after {
    background-image: url(./imgs/title-left.png);
  }

  span {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 100px;
    height: 9px;
    background-image: url(./imgs/title-bottom.png);
    background-size: 100% 100%;
    transform: translateX(-50%);
  }
}
</style>
