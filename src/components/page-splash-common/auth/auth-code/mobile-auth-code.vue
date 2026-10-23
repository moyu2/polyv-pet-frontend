<!-- @file 移动端观看条件：验证码观看 -->
<template>
  <mobile-popup
    class="c-mobile-auth-code"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
  >
    <div class="c-mobile-auth-code__main">
      <div
        v-if="qrcodeImg"
        class="c-mobile-auth-code__main__qrcode-wrap"
      >
        <img
          :src="qrcodeImg"
          class="c-mobile-auth-code__main__qrcode"
        />
      </div>
      <div
        v-if="qrcodeTips"
        class="c-mobile-auth-code__main__tips"
      >
        {{ qrcodeTips }}
      </div>

      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitAuth"
      >
        <form-item
          ref="formItemRef"
          form-field="code"
        >
          <form-input
            v-model.trim="formData.code"
            :placeholder="$lang('auth.code.placeholder')"
          />
        </form-item>

        <form-item
          v-if="needImageVerify"
          ref="imageVerifyFormItemRef"
          form-field="captcha"
        >
          <form-image-verify-input
            v-model="formData.captcha"
            ref="imageVerifyRef"
            :image-id.sync="formData.imageId"
          />
        </form-item>

        <form-item
          v-if="protocolContent"
          form-field="checkProtocol"
          style="margin-bottom: 6px"
        >
          <mobile-form-protocol
            v-model="formData.checkProtocol"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-mobile-auth-code__main__submit">
          <form-submit-button
            :size="ButtonSize.Medium"
            :text="$lang('auth.enter')"
            block
          />
        </div>
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import MobileFormProtocol from '@/components/common-base/form/form-protocol/mobile-form-protocol.vue';
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';

import { useAuthCode } from './use-auth-code';

const {
  dialogVisible,
  dialogTitle,
  qrcodeImg,
  qrcodeTips,
  protocolContent,
  formData,
  formRules,
  needImageVerify,
  submitAuth,
  formItemRef,
  imageVerifyFormItemRef,
  imageVerifyRef,
} = useAuthCode();
</script>

<style lang="scss">
.c-mobile-auth-code__main {
  padding: 24px;
  @include iphone-x-pb(24px);
}

.c-mobile-auth-code__main__qrcode-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 5px;
  overflow: hidden;
}
.c-mobile-auth-code__main__qrcode {
  width: 100%;
  height: 100%;
}

.c-mobile-auth-code__main__tips {
  margin-bottom: 20px;
  font-size: 16px;
  color: $--font-color-primary;
  text-align: center;
}
</style>
