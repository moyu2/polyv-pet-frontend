<!-- @file PC 端实名认证弹层 -->
<template>
  <pc-dialog
    :visible.sync="visible"
    class="c-pc-real-name-dialog"
    :title="$lang('base.warmTips')"
    :width="400"
  >
    <div class="c-pc-real-name-dialog__content">
      <div class="c-pc-real-name-dialog__tips">{{ $lang('realName.desc') }}</div>

      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitRealNameData"
      >
        <form-item form-field="phoneNumber">
          <pc-form-phone-input
            v-model="formData.phoneNumber"
            :area-code.sync="formData.areaCode"
          />
        </form-item>

        <form-item form-field="smsCode">
          <pc-form-sms-verify-input
            v-model="formData.smsCode"
            :phone-number="formData.phoneNumber"
            :area-code="formData.areaCode"
            :sms-scene="SmsScene.RealName"
            :valid-type="SmsValidType.None"
          />
        </form-item>

        <form-item form-field="checkProtocol">
          <pc-form-protocol
            v-model="formData.checkProtocol"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-pc-real-name-auth__submit">
          <form-submit-button
            :size="ButtonSize.Small"
            :text="$lang('base.submit')"
          />
        </div>
      </form-wrap>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { useRealNameAuth } from './use-real-name-auth';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import PcFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/pc-form-sms-verify-input.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';
import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';
import { ButtonSize } from '@/components/common-base/normal-button';

const { visible, formData, formRules, protocolContent, submitRealNameData } = useRealNameAuth();
</script>

<style lang="scss">
.c-pc-real-name-dialog__content {
  padding: 24px 32px;
}
.c-pc-real-name-dialog__tips {
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
  color: $--font-color-primary;
}

.c-pc-real-name-auth__submit {
  display: flex;
  justify-content: center;
}
</style>
