<!-- @file 移动端直播短信预约表单弹层 -->
<template>
  <mobile-popup
    :visible.sync="bookingFormVisible"
    :title="$lang('liveBooking.writeForm')"
  >
    <div class="c-mobile-live-booking-form">
      <form-wrap
        :form-data="bookingFormData"
        :form-rules="bookingFormRules"
        :submit-action="submitLiveBookingForm"
        label-model="header"
      >
        <form-item
          form-field="phoneNumber"
          :tips="$lang('liveBooking.tips.phoneNumber')"
        >
          <mobile-form-phone-input
            v-model="bookingFormData.phoneNumber"
            :area-code.sync="bookingFormData.areaCode"
          />
        </form-item>

        <form-item
          v-show="smsEnabled"
          form-field="verifyCode"
        >
          <mobile-form-sms-verify-input
            v-model="bookingFormData.verifyCode"
            :area-code="bookingFormData.areaCode"
            :phone-number="bookingFormData.phoneNumber"
            :sms-scene="SmsScene.LiveBooking"
            :valid-type="SmsValidType.Slider"
          />
        </form-item>

        <div class="c-mobile-live-booking-form__submit">
          <form-submit-button
            ref="formSubmitRef"
            :text="$lang('liveBooking.confirm')"
            :size="ButtonSize.Medium"
            block
          />
        </div>
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { SmsScene, SmsValidType } from '@polyv/live-watch-sdk';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
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
  openBookingForm,
  submitLiveBookingForm,
  cancelLiveBooking,
} = useLiveBookingForm({
  otherChannelId: props.channelId,
  sessionId: props.sessionId,
  smsBookingChangeHandler: props.smsBookingChangeHandler,
});

defineExpose({
  openBookingForm,
  cancelLiveBooking,
});
</script>

<style lang="scss">
.c-mobile-live-booking-form {
  padding: 24px 24px 34px;
}
.c-mobile-live-booking-form__submit {
  margin-top: 24px;
}
</style>
