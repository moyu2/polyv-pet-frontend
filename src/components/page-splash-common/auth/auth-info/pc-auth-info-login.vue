<!-- @file PC 端登记观看登录 -->
<template>
  <div class="c-pc-auth-info-login">
    <form-wrap
      class="c-pc-auth-info-login__form"
      :content-width="286"
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
          >
            <pc-form-phone-input
              v-model="formData.phoneNumber"
              :placeholder="item.placeholder"
              :area-code.sync="formData.areaCode"
            />
          </form-item>
        </template>
      </template>

      <div class="c-pc-auth-info-login__submit">
        <form-submit-button
          :size="ButtonSize.Small"
          :text="$lang('auth.enter')"
        />
        <normal-button
          :size="ButtonSize.Small"
          :type="ButtonType.Info"
          :text="$lang('base.cancel')"
          @click="onClickCancel"
        />
      </div>
    </form-wrap>
  </div>
</template>

<script setup lang="ts">
import FormItem from '@/components/common-base/form/form-item.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { useAuthStore } from '@/store/use-auth-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { authInfoLoginEmits, useAuthInfoLogin } from './hooks/use-auth-info-login';

const { authInfoFields } = storeDefinitionToRefs(useAuthStore);

const emit = defineEmits(authInfoLoginEmits());

const { formData, formRules, AuthInfoType, onClickCancel, submitAuthLogin } = useAuthInfoLogin({
  emit,
});
</script>

<style lang="scss">
.c-pc-auth-info-login {
  padding: 20px 10px 40px;
}

.c-pc-auth-info-login__form {
  margin-top: 20px;
}

.c-pc-auth-info-login__submit {
  display: flex;
  justify-content: center;
  margin-top: 36px;

  .c-normal-button {
    margin: 0 8px;
  }
}
</style>
