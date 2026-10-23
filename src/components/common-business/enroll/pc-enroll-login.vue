<!-- @file PC 端报名观看登录入口 -->
<template>
  <div class="c-pc-enroll-login">
    <form-wrap
      label-model="header"
      :form-data="formData"
      :form-rules="formRules"
      :submit-action="submitLoginForm"
    >
      <!-- 手机号验证 -->
      <template v-if="enrollAuthType === EnrollAuthType.Mobile">
        <!-- 手机号输入 -->
        <form-item
          :label="enrollAuthName"
          required
          form-field="phoneNumber"
        >
          <pc-form-phone-input
            v-model="formData.phoneNumber"
            :need-area-code="smsVerifyEnabled || areaCodeEnabled"
            :placeholder="enrollAuthTips"
            :area-code.sync="formData.areaCode"
            @blur="blurToCheckStatus"
          />
        </form-item>
        <!-- 图片验证码 -->
        <form-item v-if="imageVerifyInputEnabled && checkedNeedSmsVerify">
          <form-image-verify-input
            ref="imageVerifyInputRef"
            v-model="formData.imageCaptcha"
            :image-id.sync="formData.imageId"
          />
        </form-item>
        <!-- 短信验证码 -->
        <form-item
          v-if="smsVerifyEnabled && checkedNeedSmsVerify"
          form-field="smsCode"
        >
          <pc-form-sms-verify-input
            v-model="formData.smsCode"
            :area-code="formData.areaCode"
            :phone-number="formData.phoneNumber"
            :valid-type="smsValidType"
            :sms-scene="SmsScene.Enroll"
            :image-id="formData.imageId"
            :image-captcha="formData.imageCaptcha"
            :image-verify-input-ref="imageVerifyInputRef"
          />
        </form-item>
      </template>

      <!-- 邮箱验证 -->
      <template v-if="enrollAuthType === EnrollAuthType.Email">
        <form-item
          :label="enrollAuthName"
          required
          form-field="email"
        >
          <form-input
            v-model="formData.email"
            :placeholder="enrollAuthTips"
          />
        </form-item>
      </template>

      <!-- 未报名入口 -->
      <div
        v-if="needEnrollByEnter"
        class="c-pc-enroll-login__entrance"
        @click="redirectToEnroll"
      >
        {{ $lang('enroll.entrance') }}
      </div>

      <div class="c-pc-enroll-login__submit">
        <normal-button
          class="c-pc-enroll-login__submit__button"
          :size="ButtonSize.Small"
          :type="ButtonType.Info"
          :text="$lang('base.cancel')"
          @click="onClickCancel"
        />
        <form-submit-button
          ref="formSubmitRef"
          class="c-pc-enroll-login__submit__button"
          :size="ButtonSize.Small"
          :text="$lang('base.enterLive')"
          debounce-submit
        />
      </div>
    </form-wrap>
  </div>
</template>

<script setup lang="ts">
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';
import PcFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/pc-form-sms-verify-input.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';

import { SmsScene, EnrollAuthType } from '@polyv/live-watch-sdk';
import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { enrollLoginEmits, useEnrollInfoCheck, useEnrollLogin } from './hooks/use-enroll-login';
import { ref } from 'vue';
import { FormSubmitButtonInstance } from '@/components/common-base/form/hooks/use-form-submit-button';

const emit = defineEmits(enrollLoginEmits());

const {
  needEnrollByEnter,
  enrollAuthType,
  smsVerifyEnabled,
  areaCodeEnabled,
  enrollAuthName,
  enrollAuthTips,
} = storeDefinitionToRefs(useEnrollStore);

const {
  imageVerifyInputRef,
  imageVerifyInputEnabled,
  smsValidType,

  formData,
  formRules,
  submitLoginForm,
  onClickCancel,
  redirectToEnroll,
  emitResize,
} = useEnrollLogin({
  emit,
});

const formSubmitRef = ref<FormSubmitButtonInstance>();

const { blurToCheckStatus, checkedNeedSmsVerify } = useEnrollInfoCheck({
  getAreaCode: () => formData.areaCode,
  getPhoneNumber: () => formData.phoneNumber,
  cb: () => emitResize(),
  formSubmitRef,
});
</script>

<style lang="scss">
.c-pc-enroll-login {
  padding: 24px 0;
  .c-form-item {
    width: 344px;
    margin: 0 auto 24px;
  }
}

.c-pc-enroll-login__entrance {
  width: 344px;
  margin: 32px auto 20px;
  font-size: 14px;
  color: $--color-primary;
  text-align: center;
  cursor: pointer;
}

.c-pc-enroll-login__submit {
  display: flex;
  justify-content: center;
  padding-top: 8px;

  .c-pc-enroll-login__submit__button {
    margin: 0 8px;
  }
}
</style>
