<!-- @file 移动端端观看条件：白名单观看 -->
<template>
  <mobile-popup
    class="c-mobile-auth-phone"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
  >
    <div class="c-mobile-auth-phone__main">
      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitAuth"
      >
        <form-item
          ref="formItemRef"
          form-field="phone"
        >
          <form-input
            v-model.trim="formData.phone"
            :placeholder="inputPlaceholder"
          />
        </form-item>
        <form-item
          v-if="protocolContent"
          form-field="checkProtocol"
          style="margin-bottom: 12px"
        >
          <mobile-form-protocol
            v-model="formData.checkProtocol"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-mobile-auth-phone__main__submit">
          <form-submit-button
            :text="$lang('auth.enter')"
            block
            :size="ButtonSize.Medium"
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

import { useAuthPhone } from './use-auth-phone';

const {
  dialogVisible,
  dialogTitle,
  protocolContent,
  formData,
  inputPlaceholder,
  formRules,
  submitAuth,
  formItemRef,
} = useAuthPhone();
</script>

<style lang="scss">
.c-mobile-auth-phone__main {
  padding: 24px;
  @include iphone-x-pb(24px);
}
</style>
