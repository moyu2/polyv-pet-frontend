<!-- @file PC 端直播短信预约表单弹层 -->
<template>
  <pc-dialog
    :visible.sync="bookingFormVisible"
    :title="$lang('liveBooking.writeForm')"
  >
    <div class="c-pc-live-booking-form">
      <form-wrap
        :form-data="bookingFormData"
        :form-rules="bookingFormRules"
        :content-width="264"
        :submit-action="submitLiveBookingForm"
      >
        <form-item
          form-field="phoneNumber"
          :label="$lang('form.name.phoneNumber')"
          :tips="$lang('liveBooking.tips.phoneNumber')"
        >
          <pc-form-phone-input
            v-model="bookingFormData.phoneNumber"
            :area-code.sync="bookingFormData.areaCode"
          />
        </form-item>

        <form-item
          v-show="smsEnabled"
          form-field="verifyCode"
          :label="$lang('form.name.verifyCode')"
        >
          <pc-form-sms-verify-input
            v-model="bookingFormData.verifyCode"
            :area-code="bookingFormData.areaCode"
            :phone-number="bookingFormData.phoneNumber"
            :sms-scene="SmsScene.LiveBooking"
            :valid-type="SmsValidType.Slider"
          />
        </form-item>

        <div class="c-pc-live-booking-form__submit">
          <form-submit-button
            ref="formSubmitRef"
            :size="ButtonSize.Small"
            :text="$lang('liveBooking.confirm')"
          />
        </div>
      </form-wrap>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import PcFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/pc-form-sms-verify-input.vue';

import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';
import { useLiveBookingForm } from './hooks/use-live-booking-form';
import { PropUtils } from '@polyv/vue-components';

const props = defineProps({
  /** 其他频道预约的 channelId */
  channelId: PropUtils.string.def(''),
  /** 场次 id */
  sessionId: PropUtils.string.def(''),
  /** 短信预约状态变化回调 */
  smsBookingChangeHandler: PropUtils.func<(isBooked: boolean) => void>(),
});

const {
  formSubmitRef,
  smsEnabled,
  bookingFormData,
  bookingFormRules,
  bookingFormVisible,
  submitLiveBookingForm,
  liveBookingFormInstance,
} = useLiveBookingForm({
  otherChannelId: props.channelId,
  sessionId: props.sessionId,
  smsBookingChangeHandler: props.smsBookingChangeHandler,
});

defineExpose(liveBookingFormInstance);
</script>

<style lang="scss">
.c-pc-live-booking-form {
  box-sizing: border-box;
  height: 320px;
  padding: 76px 10px 0 10px;
}

.c-pc-live-booking-form__submit {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}
</style>
