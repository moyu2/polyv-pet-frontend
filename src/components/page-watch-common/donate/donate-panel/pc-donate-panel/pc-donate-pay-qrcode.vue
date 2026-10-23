<!-- @file PC 端打赏支付二维码面板 -->
<template>
  <transition name="fade">
    <div
      v-if="waitPayDonateData"
      class="c-pc-donate-pay-qrcode"
    >
      <div class="c-pc-donate-pay-qrcode__content">
        <pc-icon-close
          class="c-pc-donate-pay-qrcode__content__close"
          @click="onClickClose"
        />
        <div class="c-pc-donate-pay-qrcode__content__img__wrap">
          <img
            :src="qrImgUrl"
            class="c-pc-donate-pay-qrcode__content__img"
          />
        </div>
        <p class="c-pc-donate-pay-qrcode__content__tips">{{ $lang('weixin.scanToPay') }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';
import { computed, unref } from 'vue';
import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { waitPayDonateData } = storeDefinitionToRefs(useDonateStore);

const qrImgUrl = computed(() => {
  const data = unref(waitPayDonateData);
  if (!data || !data.qrCodeUrl) {
    return '';
  }

  return data.qrCodeUrl;
});

function onClickClose() {
  waitPayDonateData.value = undefined;
}
</script>

<style lang="scss">
.c-pc-donate-pay-qrcode {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.c-pc-donate-pay-qrcode__content__close {
  $btnWidth: 30px;
  position: absolute;
  top: -$btnWidth;
  right: -$btnWidth;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $btnWidth;
  height: $btnWidth;
  font-size: 20px !important;
  line-height: $btnWidth;
  color: #d1d1d1;
  text-align: center;
  cursor: pointer;
}

.c-pc-donate-pay-qrcode__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.c-pc-donate-pay-qrcode__content__img__wrap {
  position: relative;
  width: 160px;
  height: 160px;
  overflow: hidden;
}

.c-pc-donate-pay-qrcode__content__img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 190px;
  height: 190px;
  transform: translate(-50%, -50%);
}

.c-pc-donate-pay-qrcode__content__tips {
  margin-top: 24px;
  font-size: 16px;
  color: $--color-white;
  text-align: center;
}
</style>
