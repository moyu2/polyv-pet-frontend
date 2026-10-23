<!-- @file 移动端-微信强制授权页 -->

<template>
  <div class="c-mobile-force-wx-auth">
    <!-- 微信下打开 -->
    <template v-if="isWeixin">
      <div
        class="c-mobile-force-wx-auth__cover g-img-cover"
        :style="{
          backgroundImage: `url(${imageUrl})`,
        }"
      ></div>
      <div class="c-mobile-force-wx-auth__title g-multiline">{{ titleText }}</div>

      <normal-button
        class="c-mobile-force-wx-auth__btn"
        :type="ButtonType.Custom"
        :size="ButtonSize.Medium"
        :text="$lang('wxAuth.btn.text')"
        @click="onClickAuthBtn"
      />

      <mobile-form-protocol
        v-if="channelAgreementConfig"
        ref="protocolRef"
        class="c-mobile-force-wx-auth__protocol"
        circle
        v-model="protocolChecked"
        :content="protocolContent"
      >
        <div
          v-if="protocolTipsVisible"
          slot="checkbox-label"
          class="c-mobile-force-wx-auth__protocol-tips"
          :data-text="$lang('wxAuth.protocol.tips')"
        ></div>
      </mobile-form-protocol>

      <mobile-message-box
        v-if="channelAgreementConfig"
        ref="protocolConfirmRef"
        class="c-mobile-force-wx-auth__confirm"
        :title="protocolConfirmInfo.title"
        :content="protocolConfirmInfo.content"
        :confirm-button-text="$lang('base.agree')"
        :cancel-button-text="$lang('base.disagree')"
        @click-link="onClickProtocolConfirmLink"
      />
    </template>
    <!-- 非微信 -->
    <template v-else>
      <div class="c-mobile-force-wx-auth__qrcode-tips">{{ $lang('wxAuth.qrcode.tips') }}</div>
      <div
        class="c-mobile-force-wx-auth__qrcode"
        :style="{
          backgroundImage: `url(${qrcodeUrl})`,
        }"
      ></div>
      <normal-button
        class="c-mobile-force-wx-auth__btn"
        :type="ButtonType.Custom"
        :size="ButtonSize.Medium"
        :text="$lang('wxAuth.copy')"
        @click="copyContent"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import MobileFormProtocol from '@/components/common-base/form/form-protocol/mobile-form-protocol.vue';
import { MobileMessageBox } from '@/components/common-base/message-box';
import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';

import { isWeixin } from '@/assets/utils/browser';
import { useForceWxAuthHook } from './use-force-wx-auth-hook';

const {
  channelAgreementConfig,

  qrcodeUrl,
  onClickAuthBtn,
  copyContent,

  imageUrl,
  titleText,

  protocolRef,
  protocolChecked,
  protocolContent,
  protocolTipsVisible,
  protocolConfirmInfo,

  protocolConfirmRef,
  onClickProtocolConfirmLink,
} = useForceWxAuthHook();
</script>

<style lang="scss">
.c-mobile-force-wx-auth {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f9fbff;
  background-image: url(./imgs/mobile-bg.png);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100%;
}

.c-mobile-force-wx-auth__cover {
  width: 90px;
  height: 90px;
  border-radius: 8px;
}

.c-mobile-force-wx-auth__title {
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px;
  margin-top: 24px;
  margin-bottom: 118px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
  color: #3d3d3d;
  text-align: center;
}

.c-mobile-force-wx-auth__btn {
  width: 264px;
  height: 44px;
  font-size: 14px;
  line-height: 44px;
  color: $--color-white;
  background-color: $--color-primary;
}

.c-mobile-force-wx-auth__protocol {
  // max-width: calc(100vw - 42px);
  max-width: 80%;
  margin-top: 20px;
  line-height: 16px;
  .c-mobile-form-protocol__content {
    font-size: 12px !important;
  }
}

@keyframes protocol-tips-anima {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
  }
}

.c-mobile-force-wx-auth__protocol-tips {
  position: absolute;
  top: 21px;
  left: 8px;
  z-index: -1;
  width: 1px;
  height: 1px;
  transform: translateX(-50%);
  animation: protocol-tips-anima 1s linear infinite;
  &::before {
    position: absolute;
    top: -14px;
    left: -11px;
    height: 0;
    content: '';
    border-color: transparent transparent rgba(48, 130, 254, 0.1) transparent;
    border-style: solid;
    border-width: 11px;
  }
  &::after {
    position: absolute;
    top: 8px;
    left: -31px;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
    content: attr(data-text);
    background: rgba(48, 130, 254, 0.1);
    border-radius: 8px;
  }
}

.c-mobile-force-wx-auth__qrcode-tips {
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: bold;
  color: #3d3d3d;
}

.c-mobile-force-wx-auth__qrcode {
  box-sizing: border-box;
  width: 194px;
  height: 194px;
  margin-bottom: 44px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  border: 1px solid #ccc;
}
</style>
