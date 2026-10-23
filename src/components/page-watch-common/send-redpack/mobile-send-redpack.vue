<!-- @file 移动端-横屏-发红包 -->
<template>
  <mobile-popup
    class="c-mobile-send-redpack-popup"
    :visible.sync="popupVisible"
    :title="$lang('redpack.send.title')"
  >
    <div class="c-mobile-send-redpack__content">
      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitForm"
      >
        <form-item form-field="amount">
          <form-number-input
            v-model="formData.amount"
            :input-title="$lang('redpack.send.sum')"
            :input-title-width="68"
            :clearabled="false"
            :placeholder="$lang('redpack.send.sum.placeholder')"
            :suffix-text="$lang('redpack.send.sum.unit')"
          />
        </form-item>

        <form-item form-field="count">
          <form-number-input
            v-model="formData.count"
            :input-title="$lang('redpack.send.num')"
            :input-title-width="68"
            :clearabled="false"
            :placeholder="$lang('redpack.send.num.placeholder')"
            :suffix-text="$lang('redpack.send.num.unit')"
          />
        </form-item>

        <form-item>
          <form-input
            v-model="formData.greeting"
            :placeholder="$lang('redpack.blessing.placeholder')"
            :maxlength="20"
            :clearabled="false"
            show-word-limit
          />
        </form-item>

        <p class="c-mobile-send-redpack__tips">{{ $lang('redpack.desc') }}</p>
        <p class="c-mobile-send-redpack__amount-bold">
          ￥<span>{{ formData.amount || '0.00' }}</span>
        </p>

        <form-submit-button
          :type="ButtonType.Aggravate"
          :size="ButtonSize.Medium"
          block
          :text="$lang('redpack.send.btn.text')"
        />
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import FormNumberInput from '@/components/common-base/form/form-number-input/form-number-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSendRedpackHook } from './_hooks/use-send-redpack';

const {
  formData,
  formRules,

  submitForm,
  initSendRedpackData,
} = useSendRedpackHook({
  successCallback: () => {
    handleSendRedpackPopupVisible(false);
  },
});

const popupVisible = ref(false);

useEventBusListener(appEvents.interaction.OpenSendRedpack, handleSendRedpackPopupVisible);

function handleSendRedpackPopupVisible(visible: boolean) {
  if (visible) {
    initSendRedpackData();
  }
  popupVisible.value = visible;
}
</script>

<style lang="scss">
.c-mobile-send-redpack__content {
  padding: 16px 24px 24px;
  @include iphone-x-pb(24px);
}

.c-mobile-send-redpack__tips {
  position: relative;
  margin-top: -8px;
  font-size: 12px;
  color: #aaa;
}

.c-mobile-send-redpack__amount-bold {
  padding: 0 24px;
  margin: 16px auto;
  color: #333;
  text-align: center;
  @include alibaba-font(30px, bold);

  span {
    margin-top: 16px;
    font-size: 40px;
    line-height: 1;
  }
}
</style>
