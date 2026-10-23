<!-- @file PC 端观看条件：验证码观看 -->
<template>
  <pc-dialog
    class="c-pc-auth-code"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
  >
    <div class="c-pc-auth-code__main">
      <div
        v-if="qrcodeImg"
        class="c-pc-auth-code__main__qrcode-wrap"
      >
        <img
          :src="qrcodeImg"
          class="c-pc-auth-code__main__qrcode"
        />
      </div>
      <div
        v-if="qrcodeTips"
        class="c-pc-auth-code__main__tips"
      >
        {{ qrcodeTips }}
      </div>

      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :theme="FormTheme.Gray"
        :content-width="320"
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
        >
          <pc-form-protocol
            v-model="formData.checkProtocol"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-pc-auth-code__main__submit">
          <form-submit-button
            :size="ButtonSize.Small"
            :text="$lang('auth.enter')"
          />
          <normal-button
            :size="ButtonSize.Small"
            :type="ButtonType.Info"
            :text="$lang('base.cancel')"
            @click="onClickCancel"
          />
        </div>
      </form-wrap>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';

import { FormTheme } from '@/components/common-base/form/types/enums';
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
  onClickCancel,
  submitAuth,
  formItemRef,
  imageVerifyFormItemRef,
  imageVerifyRef,
} = useAuthCode();
</script>

<style lang="scss">
.c-pc-auth-code__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.c-pc-auth-code__main__qrcode-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 8px;
  overflow: hidden;
}
.c-pc-auth-code__main__qrcode {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  transform: translate(-50%, -50%);
}

.c-pc-auth-code__main__tips {
  margin-bottom: 20px;
  font-size: 16px;
  color: $--font-color-primary;
}

.c-pc-auth-code__main__submit {
  display: flex;
  justify-content: center;

  .c-normal-button {
    margin: 0 8px;
  }
}
</style>
