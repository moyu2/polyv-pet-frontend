<!-- @file 一客一码验证页 -->

<template>
  <div class="c-verify-sale-invite">
    <div class="c-verify-sale-invite__content">
      <div class="c-verify-sale-invite__tips">
        <div class="c-verify-sale-invite__tips__bg1"></div>
        <div class="c-verify-sale-invite__tips__bg2"></div>
        <p class="c-verify-sale-invite__tips--main">
          {{ $lang('saleInvite.tips1') }}
        </p>
        <p class="c-verify-sale-invite__tips--sub">
          {{ $lang('saleInvite.tips2') }}
        </p>
      </div>
      <div class="c-verify-sale-invite-form">
        <div class="c-verify-sale-invite-form__content">
          <form-wrap
            label-model="header"
            :form-data="formData"
            :form-rules="formRules"
            :submit-action="submitForm"
          >
            <form-item form-field="phoneNumber">
              <mobile-form-phone-input
                v-model="formData.phoneNumber"
                :area-code.sync="formData.areaCode"
              />
            </form-item>

            <form-item
              v-if="saleInviteVerifySmsEnabled"
              form-field="smsCode"
            >
              <mobile-form-sms-verify-input
                v-model="formData.smsCode"
                :area-code="formData.areaCode"
                :phone-number="formData.phoneNumber"
                :sms-scene="SmsScene.SaleInvite"
                :valid-type="SmsValidType.Slider"
              />
            </form-item>

            <form-item
              v-for="(item, index) in collectSetting.fieldList"
              :key="index"
              :form-field="item.type"
              :label="getTranslateByType(item.type).label"
              :required="item.required"
            >
              <form-input
                v-model="formData[item.type]"
                :placeholder="getTranslateByType(item.type).placeholder"
              />
            </form-item>

            <div class="c-verify-sale-invite-form__submit">
              <form-submit-button
                :type="ButtonType.Custom"
                :size="ButtonSize.Medium"
                block
                :text="$lang('saleInvite.confirm')"
                debounce-submit
              />
            </div>
          </form-wrap>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button';

import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import { useVerifySaleInvite } from './use-verify-sale-invite';

const {
  saleInviteVerifySmsEnabled,

  formData,
  formRules,
  submitForm,
  getTranslateByType,
  collectSetting,
} = useVerifySaleInvite();
</script>

<style lang="scss">
.c-verify-sale-invite {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
}

.c-verify-sale-invite__content {
  max-width: 600px;
  margin: auto;
}

.c-verify-sale-invite__tips {
  box-sizing: border-box;
  width: 100%;
  min-height: 52px;
  padding: 60px 30px 0 30px;
  font-family: PingFangSC-Medium;

  font-size: 14px;
  line-height: 20px;
  color: #999999;
  &--main {
    position: relative;
    margin-bottom: 12px;
    font-size: 24px;
    font-weight: 500;
    color: #333333;
    &::after {
      position: absolute;
      top: 17px;
      left: 0;
      display: block;
      width: 76px;
      height: 10px;
      content: '';
      background: linear-gradient(90deg, #3f76fc 0%, rgba(63, 118, 252, 0.1) 105%);
      border-radius: 100% 100% 0 0;
    }
  }
}
.c-verify-sale-invite__tips__bg1 {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 96%;
  height: 180px;
  background-color: #d0dffb;
  filter: blur(70px);
  transform: translateY(-60%) translateX(-20%);
}
.c-verify-sale-invite__tips__bg2 {
  position: absolute;
  top: 0;
  right: 0;
  z-index: -1;
  width: 72%;
  height: 160px;
  background-color: #f8e9ef;
  filter: blur(70px);
  transform: translateY(-60%) translateX(50%);
}

.c-verify-sale-invite-form {
  padding: 20px 30px 0;
}
.c-verify-sale-invite-form__submit {
  position: sticky;
  bottom: 0;
  padding-top: 24px;
  padding-bottom: 34px;
  background: #fff;
  .c-normal-button {
    color: #fff;
    background-color: #3082fe;
    &.is-disabled {
      opacity: 0.5;
    }
  }
}
</style>
