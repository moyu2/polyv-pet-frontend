<!-- @file 移动端实名认证弹层 -->
<template>
  <mobile-popup
    :visible.sync="visible"
    class="c-mobile-real-name-popup"
    :title="$lang('base.warmTips')"
  >
    <div class="c-mobile-real-name-popup__content">
      <div class="c-mobile-real-name-popup__tips">{{ $lang('realName.desc') }}</div>

      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitRealNameData"
      >
        <form-item form-field="phoneNumber">
          <mobile-form-phone-input
            v-model="formData.phoneNumber"
            :area-code.sync="formData.areaCode"
          />
        </form-item>

        <form-item form-field="smsCode">
          <mobile-form-sms-verify-input
            v-model="formData.smsCode"
            :phone-number="formData.phoneNumber"
            :area-code="formData.areaCode"
            :sms-scene="SmsScene.RealName"
            :valid-type="SmsValidType.None"
          />
        </form-item>

        <form-item form-field="checkProtocol">
          <mobile-form-protocol
            v-model="formData.checkProtocol"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-mobile-real-name-popup__submit">
          <form-submit-button
            block
            :text="$lang('base.submit')"
          />
        </div>
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { useRealNameAuth } from './use-real-name-auth';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import MobileFormProtocol from '@/components/common-base/form/form-protocol/mobile-form-protocol.vue';
import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';

const { visible, formData, formRules, protocolContent, submitRealNameData } = useRealNameAuth();
</script>

<style lang="scss">
.c-mobile-real-name-popup__content {
  padding: 24px;
}
.c-mobile-real-name-popup__tips {
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
  color: $--font-color-primary;
}
</style>
