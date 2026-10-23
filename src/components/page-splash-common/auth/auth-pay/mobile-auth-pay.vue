<!-- @file 移动端观看条件：付费观看 -->
<template>
  <mobile-popup
    class="c-mobile-auth-pay"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
  >
    <div class="c-mobile-auth-pay__main">
      <div class="c-mobile-auth-pay__main__price">
        <span>￥</span>
        {{ payPrice }}
      </div>

      <div
        class="c-mobile-auth-pay__main__button"
        @click="onClickPay"
      >
        <span class="c-mobile-auth-pay__main__button__logo g-img-cover"></span>
        <span>{{ $lang('auth.pay.wechat') }}</span>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { useAuthPayMobile } from './use-auth-pay';

const { dialogVisible, dialogTitle, payPrice, onClickPay } = useAuthPayMobile();
</script>

<style lang="scss">
.c-mobile-auth-pay__main {
  padding: 32px 24px 24px;
  @include iphone-x-pb(24px);
}

.c-mobile-auth-pay__main__price {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  color: $--font-color-primary;
  text-align: center;

  span {
    margin-right: 1px;
    font-size: 18px;
    transform: translateY(-3px);
  }
}

.c-mobile-auth-pay__main__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 32px;
  line-height: 48px;
  color: #fff;
  text-align: center;
  background: #21ac38;
  border-radius: 25px;
}
.c-mobile-auth-pay__main__button__logo {
  width: 32px;
  height: 27px;
  margin-right: 12px;
  background-image: url(../imgs/icon-auth-pay-wechat.png);
}
</style>
