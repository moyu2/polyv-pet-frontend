<!-- @file PC 端观看条件：付费观看 -->
<template>
  <div class="c-pc-auth-pay">
    <div class="c-pc-auth-pay__click-tips">
      {{ $lang('auth.pay.audience') }}
      <span @click="openPayCheckDialog">{{ $lang('auth.pay.clickHere') }}</span>
    </div>

    <pc-dialog
      class="c-pc-auth-pay-dialog"
      :visible.sync="dialogVisible"
      :title="dialogTitle"
    >
      <!-- 扫码支付 -->
      <div
        v-if="dialogType === 'pay'"
        class="c-pc-auth-pay__main"
      >
        <div class="c-pc-auth-pay__tips">
          {{ $lang('auth.pay.tips') }}
          <span>
            <span class="c-pc-auth-pay__tips__unit">￥</span>
            {{ payPrice }}
          </span>
        </div>

        <div class="c-pc-auth-pay__qrcode">
          <img
            v-if="payQrcodeUrl"
            :src="payQrcodeUrl"
          />
        </div>

        <div class="c-pc-auth-pay__scan-pay">
          <div class="c-pc-auth-pay__scan-pay__icon g-img-cover"></div>
          <span>{{ $lang('auth.pay.scan') }}</span>
        </div>

        <div
          class="c-pc-auth-pay__hasPay"
          @click="openPayCheckDialog"
        >
          {{ $lang('auth.pay.hasPay') }}
        </div>
      </div>

      <!-- 微信扫码进入 -->
      <div
        v-if="dialogType === 'payCheck'"
        class="c-pc-auth-pay__main"
      >
        <div class="c-pc-auth-pay__wechat__tips">
          {{ $lang('auth.pay.wechatPrefix') }}
          <span class="c-pc-auth-pay__wechat__tips__icon g-img-cover"></span>
          {{ $lang('auth.pay.wechatSuffix') }}
        </div>

        <div class="c-pc-auth-pay__qrcode">
          <img
            v-if="wechatQrcodeUrl"
            :src="wechatQrcodeUrl"
          />
        </div>

        <div
          class="c-pc-auth-pay__hasPay"
          @click="openPayDialog"
        >
          {{ $lang('auth.pay.clickPay') }}
        </div>
      </div>
    </pc-dialog>
  </div>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';

import { useAuthPayPc } from './use-auth-pay';

const {
  dialogVisible,
  dialogTitle,
  dialogType,
  payPrice,
  payQrcodeUrl,
  wechatQrcodeUrl,
  openPayDialog,
  openPayCheckDialog,
} = useAuthPayPc();
</script>

<style lang="scss">
.c-pc-auth-pay__click-tips {
  width: 100%;
  margin-top: 8px;
  font-size: 14px;
  color: $--color-white;
  text-align: center;

  span {
    text-decoration: underline;
    cursor: pointer;
  }
}

.c-pc-auth-pay__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.c-pc-auth-pay__tips {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 24px;
  font-size: 14px;

  span {
    font-size: 24px;
    color: #f06e6e;
  }

  .c-pc-auth-pay__tips__unit {
    margin-left: 4px;
    font-size: 16px;
  }
}

.c-pc-auth-pay__wechat__tips {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  font-size: 14px;
}
.c-pc-auth-pay__wechat__tips__icon {
  width: 18px;
  height: 18px;
  margin: 0 4px;
  background-image: url(../imgs/icon-auth-pay-wechat-logo.png);
}

.c-pc-auth-pay__qrcode {
  position: relative;
  display: inline-block;
  width: 232px;
  height: 232px;
  margin-bottom: 12px;
  overflow: hidden;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 282px;
    height: 282px;
    transform: translate(-50%, -50%);
  }
}

.c-pc-auth-pay__scan-pay {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 14px;
}

.c-pc-auth-pay__scan-pay__icon {
  width: 32px;
  height: 27px;
  margin-right: 8px;
  background-image: url(../imgs/icon-auth-pay-wechat-green.png);
}

.c-pc-auth-pay__hasPay {
  font-size: 14px;
  color: #3082fe;
  cursor: pointer;
}
</style>
