<!-- @file PC 端登记观看表单 -->
<template>
  <div class="c-pc-auth-info-form">
    <div
      v-if="showLoginEnter"
      class="c-pc-auth-info-form__registered-entrance"
      @click="onClickLogined"
    >
      {{ $lang('auth.info.registered.entrance') }}
    </div>

    <div
      v-if="infoDesc"
      class="c-pc-auth-info-form__desc"
    >
      {{ infoDesc }}
    </div>

    <form-wrap
      class="c-pc-auth-info-form__form"
      :content-width="286"
      :form-data="formData"
      :form-rules="formRules"
      :theme="FormTheme.Gray"
      :submit-action="submitAuth"
    >
      <template v-for="(item, index) in authInfoFields">
        <!-- 姓名 -->
        <template v-if="item.type === AuthInfoType.Name">
          <form-item
            :label="item.name"
            :key="`name-${index}`"
            :required="item.required === YN.Y"
            :form-field="generateFormField(index)"
          >
            <form-input
              v-model.trim="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
            />
          </form-item>
        </template>

        <!-- 文本 -->
        <template v-if="item.type === AuthInfoType.Text">
          <form-item
            :label="item.name"
            :key="`text-${index}`"
            :required="item.required === YN.Y"
            :form-field="generateFormField(index)"
          >
            <form-input
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
            />
          </form-item>
        </template>

        <!-- 数值 -->
        <template v-if="item.type === AuthInfoType.Number">
          <form-item
            :label="item.name"
            :key="`number-${index}`"
            :required="item.required === YN.Y"
            :form-field="generateFormField(index)"
          >
            <form-number-input
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
            />
          </form-item>
        </template>

        <!-- 下拉选项 -->
        <template v-if="item.type === AuthInfoType.Option">
          <form-item
            :label="item.name"
            :key="`option-${index}`"
            :required="item.required === YN.Y"
            :form-field="generateFormField(index)"
          >
            <pc-form-select
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
              :options="formatSelectOptions(item.options)"
              search
            />
          </form-item>
        </template>

        <!-- 手机号码 -->
        <template v-if="item.type === AuthInfoType.Mobile">
          <!-- 手机号码 -->
          <form-item
            :label="item.name"
            :key="`phone-${index}`"
            :required="item.required === YN.Y"
            :form-field="generateFormField(index)"
            :tips="$lang('auth.info.tips.phoneNumber')"
          >
            <pc-form-phone-input
              v-model="formData[generateFormField(index)]"
              :placeholder="item.placeholder"
              :area-code.sync="formData.areaCode"
              @input="onPhoneNumberChange"
            />
          </form-item>
          <!-- 图片验证码 -->
          <form-item
            v-if="imageVerifyInputEnabled"
            :key="`image-code-${index}`"
            label=" "
          >
            <form-image-verify-input
              ref="imageVerifyInputRef"
              v-model="formData.imageCaptcha"
              :image-id.sync="formData.imageId"
            />
          </form-item>
          <!-- 短信验证码 -->
          <form-item
            v-if="smsVerifyEnabled"
            form-field="smsCode"
            label=" "
            :key="`sms-code-${index}`"
          >
            <pc-form-sms-verify-input
              v-model="formData.smsCode"
              :area-code="formData.areaCode"
              :phone-number="formData[generateFormField(index)]"
              :sms-scene="SmsScene.AuthInfo"
              :valid-type="smsValidType"
              :image-id="formData.imageId"
              :image-captcha="formData.imageCaptcha"
              :image-verify-input-ref="imageVerifyInputRef"
            />
          </form-item>
        </template>
      </template>

      <!-- 隐私协议 -->
      <form-item
        v-if="protocolContent"
        label=" "
        form-field="checkProtocol"
      >
        <pc-form-protocol
          v-model="formData.checkProtocol"
          :content="protocolContent"
        />
      </form-item>

      <div class="c-pc-auth-info-form__submit">
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
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormNumberInput from '@/components/common-base/form/form-number-input/form-number-input.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';
import PcFormSelect from '@/components/common-base/form/form-select/pc-form-select.vue';
import PcFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/pc-form-sms-verify-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import { FormTheme } from '@/components/common-base/form/types/enums';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { SmsScene, YN } from '@polyv/live-watch-sdk';
import { authInfoFormEmits, useAuthInfoForm } from './hooks/use-auth-info-form';

const emit = defineEmits(authInfoFormEmits());

const {
  infoDesc,
  authInfoFields,
  AuthInfoType,
  formData,
  formRules,
  protocolContent,
  smsVerifyEnabled,
  authFormInstance,
  showLoginEnter,
  imageVerifyInputRef,
  imageVerifyInputEnabled,
  smsValidType,

  onPhoneNumberChange,
  formatSelectOptions,
  onClickCancel,
  submitAuth,
  onClickLogined,
  generateFormField,
} = useAuthInfoForm({
  emit,
});

defineExpose(authFormInstance);
</script>

<style lang="scss">
.c-pc-auth-info-form {
  padding: 20px 10px 40px;
}

.c-pc-auth-info-form__desc {
  padding-left: 160px;
  margin-top: 10px;
  font-size: 14px;
  color: #999;
}

.c-pc-auth-info-form__registered-entrance {
  width: 344px;
  margin: 0 auto;
  font-size: 14px;
  color: #2196f3;
  text-align: right;
  letter-spacing: 0;
  cursor: pointer;
}

.c-pc-auth-info-form__form {
  margin-top: 20px;
}

.c-pc-auth-info-form__submit {
  display: flex;
  justify-content: center;

  .c-normal-button {
    margin: 0 8px;
  }
}
</style>
