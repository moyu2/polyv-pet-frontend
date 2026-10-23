<!-- @file 移动端登记观看登录 -->
<template>
  <div class="c-mobile-auth-info-login">
    <form-wrap
      class="c-mobile-auth-info-login__form"
      label-model="header"
      :form-data="formData"
      :form-rules="formRules"
      :submit-action="submitAuthLogin"
    >
      <template v-for="(item, index) in authInfoFields">
        <!-- 手机号码 -->
        <template v-if="item.type === AuthInfoType.Mobile">
          <!-- 手机号码 -->
          <form-item
            :label="item.name"
            :key="`phone-${index}`"
            form-field="phoneNumber"
            required
          >
            <mobile-form-phone-input
              v-model="formData.phoneNumber"
              :placeholder="item.placeholder"
              :area-code.sync="formData.areaCode"
            />
          </form-item>
        </template>
      </template>

      <div class="c-mobile-auth-info-login__submit">
        <form-submit-button
          :size="ButtonSize.Medium"
          :text="$lang('auth.enter')"
          block
        />
      </div>
    </form-wrap>
  </div>
</template>

<script setup lang="ts">
import FormItem from '@/components/common-base/form/form-item.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { useAuthStore } from '@/store/use-auth-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { authInfoLoginEmits, useAuthInfoLogin } from './hooks/use-auth-info-login';

const { authInfoFields } = storeDefinitionToRefs(useAuthStore);

const emit = defineEmits(authInfoLoginEmits());

const { AuthInfoType, formData, formRules, submitAuthLogin } = useAuthInfoLogin({
  emit,
});
</script>

<style lang="scss">
.c-mobile-auth-info-login {
  padding: 24px 24px 0;
}

.c-mobile-auth-info-login__submit {
  position: sticky;
  bottom: 0;
  padding: 24px 0;
  background: #fff;
  @include iphone-x-pb(24px);
}
</style>
