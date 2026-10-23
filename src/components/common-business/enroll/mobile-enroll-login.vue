<!-- @file 移动端报名观看登录入口 -->
<template>
  <div class="c-mobile-enroll-login">
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
          <mobile-form-phone-input
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
          <mobile-form-sms-verify-input
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
        class="c-mobile-enroll-login__entrance"
        @click="redirectToEnroll"
      >
        {{ $lang('enroll.entrance') }}
      </div>

      <div class="c-mobile-enroll-login__submit">
        <form-submit-button
          ref="formSubmitRef"
          class="c-mobile-enroll-login__submit__button"
          :size="ButtonSize.Medium"
          block
          :text="$lang('base.enterLive')"
          debounce-submit
          allow-disabled-click
        />
      </div>
    </form-wrap>
  </div>
</template>

<script setup lang="ts">
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useEnrollStore } from '@/store/use-enroll-store';
import { EnrollAuthType, SmsScene } from '@polyv/live-watch-sdk';

import { FormSubmitButtonInstance } from '@/components/common-base/form/hooks/use-form-submit-button';
import { ref } from 'vue';
import { enrollLoginEmits, useEnrollInfoCheck, useEnrollLogin } from './hooks/use-enroll-login';

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
.c-mobile-enroll-login {
  padding: 16px 16px 0;
}

.c-mobile-enroll-login__entrance {
  margin: 32px auto 20px;
  font-size: 14px;
  color: $--color-primary;
  text-align: center;
  cursor: pointer;
}

.c-mobile-enroll-login__submit {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}
</style>
