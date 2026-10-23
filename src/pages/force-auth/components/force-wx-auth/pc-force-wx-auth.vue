<!-- @file PC 端-微信强制授权页 -->

<template>
  <div class="c-pc-force-wx-auth">
    <pc-dialog
      :visible="true"
      :closable="false"
      :mask="false"
      :title="$lang('wxAuth.dialog.title')"
    >
      <div class="c-pc-force-wx-auth__body">
        <!-- 微信下打开 -->
        <template v-if="isWeixin">
          <div
            class="c-pc-force-wx-auth__cover g-img-cover"
            :style="{
              backgroundImage: `url(${imageUrl})`,
            }"
          ></div>
          <div class="c-pc-force-wx-auth__title g-multiline">{{ titleText }}</div>

          <normal-button
            class="c-pc-force-wx-auth__btn"
            :type="ButtonType.Custom"
            :size="ButtonSize.Medium"
            :text="$lang('wxAuth.btn.text')"
            @click="onClickAuthBtn"
          />

          <pc-form-protocol
            v-if="channelAgreementConfig"
            ref="protocolRef"
            class="c-pc-force-wx-auth__protocol"
            circle
            v-model="protocolChecked"
            :content="protocolContent"
          >
            <div
              v-if="protocolTipsVisible"
              slot="checkbox-label"
              class="c-pc-force-wx-auth__protocol-tips"
              :data-text="$lang('wxAuth.protocol.tips')"
            ></div>
          </pc-form-protocol>

          <pc-message-box
            v-if="channelAgreementConfig"
            ref="protocolConfirmRef"
            class="c-pc-force-wx-auth__confirm"
            :title="protocolConfirmInfo.title"
            :content="protocolConfirmInfo.content"
            :width="360"
            :confirm-button-text="$lang('base.agree')"
            :cancel-button-text="$lang('base.disagree')"
            @click-link="onClickProtocolConfirmLink"
          />
        </template>
        <!-- 非微信 -->
        <template v-else>
          <div class="c-pc-force-wx-auth__qrcode-tips">{{ $lang('wxAuth.qrcode.tips') }}</div>
          <div
            class="c-pc-force-wx-auth__qrcode"
            :style="{
              backgroundImage: `url(${qrcodeUrl})`,
            }"
          ></div>
          <normal-button
            class="c-pc-force-wx-auth__btn"
            :type="ButtonType.Custom"
            :size="ButtonSize.Medium"
            :text="$lang('wxAuth.copy')"
            @click="copyContent"
          />
        </template>
      </div>
    </pc-dialog>
  </div>
</template>

<script lang="ts" setup>
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';
import PcMessageBox from '@/components/common-base/message-box/pc-message-box.vue';
import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';

import { isWeixin } from '@/assets/utils/browser';
import { useForceWxAuthHook } from './use-force-wx-auth-hook';

const {
  channelAgreementConfig,

  qrcodeUrl,
  copyContent,

  protocolRef,
  protocolChecked,
  protocolContent,
  protocolTipsVisible,
  protocolConfirmInfo,
  imageUrl,
  titleText,

  protocolConfirmRef,
  onClickProtocolConfirmLink,

  onClickAuthBtn,
} = useForceWxAuthHook();
</script>

<style lang="scss">
.c-pc-force-wx-auth {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(./imgs/pc-bg.png);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% 100%;
}

.c-pc-force-wx-auth__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 452px;
}

.c-pc-force-wx-auth__cover {
  width: 90px;
  height: 90px;
  border-radius: 8px;
}

.c-pc-force-wx-auth__title {
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px;
  margin-top: 24px;
  margin-bottom: 84px;
  font-size: 16px;
  font-weight: bold;
  color: #3d3d3d;
  text-align: center;
}

.c-pc-force-wx-auth__btn {
  width: 264px;
  height: 44px;
  font-size: 14px;
  line-height: 44px;
  color: $--color-white;
  background-color: $--color-primary;
}

.c-pc-force-wx-auth__protocol {
  max-width: 80%;
  margin-top: 12px;
  line-height: 16px;
  .c-pc-form-protocol__content {
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

.c-pc-force-wx-auth__protocol-tips {
  position: absolute;
  top: 24px;
  left: 8px;
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

.c-pc-force-wx-auth__qrcode-tips {
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: bold;
  color: #3d3d3d;
}

.c-pc-force-wx-auth__qrcode {
  box-sizing: border-box;
  width: 194px;
  height: 194px;
  margin-bottom: 44px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  border: 1px solid #ccc;
}

/** 样式覆盖 @todo 多皮肤处理 */
.c-pc-message-box {
  .c-pc-message-box__footer {
    .c-normal-button--primary {
      background: $--color-primary !important;
    }
  }
}
</style>
