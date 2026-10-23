<!-- @file PC 端报名观看表单 -->
<template>
  <div class="c-pc-enroll-form">
    <div class="c-pc-enroll-form__body">
      <div class="c-pc-enroll-form__body__content">
        <!-- 头部图 -->
        <img
          v-if="enrollBanner"
          class="c-pc-enroll-form__banner"
          :src="enrollBanner"
        />

        <!-- 表单 -->
        <form-wrap
          label-model="header"
          :form-data="formData"
          :form-rules="formRules"
          :submit-action="submitForm"
        >
          <template v-for="(item, index) in enrollFields">
            <!-- 姓名 -->
            <template v-if="item.type === EnrollFieldType.Name">
              <form-item
                :label="item.name"
                :key="`name-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <form-input
                  v-model="formData[item.fieldId]"
                  :maxlength="20"
                  :placeholder="item.tips"
                />
              </form-item>
            </template>

            <!-- 邮箱 -->
            <template v-if="item.type === EnrollFieldType.Email">
              <form-item
                :label="item.name"
                :key="`email-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <form-input
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :maxlength="50"
                />
              </form-item>
            </template>

            <!-- 填空 -->
            <template v-if="item.type === EnrollFieldType.Text">
              <form-item
                :label="item.name"
                :key="`text-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <form-input
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :maxlength="100"
                />
              </form-item>
            </template>

            <!-- 单选 -->
            <template v-if="item.type === EnrollFieldType.Radio">
              <form-item
                :label="formatSpecialName(item)"
                :key="`radio-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <pc-form-select
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :options="formatSimpleSelectOptions(item.radioOptions)"
                  search
                />
              </form-item>
            </template>

            <!-- 多选 -->
            <template v-if="item.type === EnrollFieldType.Checkbox">
              <form-item
                :label="formatSpecialName(item)"
                :key="`checkbox-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <pc-form-select
                  multiple
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :options="formatSimpleSelectOptions(item.checkboxOptions)"
                  search
                />
              </form-item>
            </template>

            <!-- 手机号码 & 手机号验证 -->
            <template
              v-if="
                item.type === EnrollFieldType.Mobile && enrollAuthType === EnrollAuthType.Mobile
              "
            >
              <!-- 手机号码 -->
              <form-item
                :label="item.name"
                :key="`phone-auth-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
                :tips="$lang('enroll.tips.phoneNumber')"
              >
                <pc-form-phone-input
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  :need-area-code="smsVerifyEnabled || areaCodeEnabled"
                  :area-code.sync="formData.areaCode"
                  @input="onPhoneNumberChange"
                  @blur="blurToCheckStatus"
                />
              </form-item>
              <!-- 图片验证码 -->
              <form-item
                v-if="imageVerifyInputEnabled"
                :key="`image-code-${index}`"
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
                :key="`sms-code-${index}`"
              >
                <pc-form-sms-verify-input
                  v-model="formData.smsCode"
                  :area-code="formData.areaCode"
                  :phone-number="formData[item.fieldId]"
                  :valid-type="smsValidType"
                  :sms-scene="SmsScene.Enroll"
                  :image-id="formData.imageId"
                  :image-captcha="formData.imageCaptcha"
                  :image-verify-input-ref="imageVerifyInputRef"
                />
              </form-item>
            </template>

            <!-- 手机号码 & 邮箱验证 -->
            <template
              v-if="item.type === EnrollFieldType.Mobile && enrollAuthType === EnrollAuthType.Email"
            >
              <form-item
                :label="item.name"
                :key="`email-auth-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <form-input
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                  @input="onEmailChange"
                />
              </form-item>
            </template>

            <!-- 上传图片 -->
            <template v-if="item.type === EnrollFieldType.Upload">
              <form-item
                :label="item.name"
                :key="`upload-image-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <pc-form-upload-image
                  v-model="formData[item.fieldId]"
                  :max-count="item.uploadCount"
                />
              </form-item>
            </template>

            <!-- 地区选择 -->
            <template v-if="item.type === EnrollFieldType.Area">
              <form-item
                :label="item.name"
                :key="`area-${index}`"
                :required="item.isRequired"
                :form-field="item.fieldId"
              >
                <pc-form-area-picker
                  v-model="formData[item.fieldId]"
                  :placeholder="item.tips"
                />
              </form-item>
            </template>

            <!-- 隐私协议 -->
            <template v-if="item.type === EnrollFieldType.Privacy">
              <form-item
                :key="`privacy-${index}`"
                :form-field="item.fieldId"
              >
                <pc-form-protocol
                  v-model="formData[item.fieldId]"
                  :content="item.tips"
                />
              </form-item>
            </template>

            <!-- 文本 -->
            <template v-if="item.type === EnrollFieldType.Tips">
              <form-item
                :key="`tips-${index}`"
                :form-field="item.fieldId"
              >
                <span class="c-pc-enroll-form__item__field-tips-content">
                  {{ item.name }}
                </span>
              </form-item>
            </template>
          </template>

          <div class="c-pc-enroll-form__body__submit">
            <normal-button
              v-if="needEnrollByEnter"
              class="c-pc-enroll-form__body__submit__button"
              :size="ButtonSize.Small"
              :type="ButtonType.Info"
              :text="$lang('base.back')"
              @click="onClickCancel"
            />
            <form-submit-button
              class="c-pc-enroll-form__body__submit__button"
              :size="ButtonSize.Small"
              :text="needEnrollByEnter ? $lang('base.enterLive') : $lang('base.submit')"
              debounce-submit
            />
          </div>
        </form-wrap>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import PcFormSelect from '@/components/common-base/form/form-select/pc-form-select.vue';
import PcFormPhoneInput from '@/components/common-base/form/form-phone-input/pc-form-phone-input.vue';
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';
import PcFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/pc-form-sms-verify-input.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';
import PcFormUploadImage from '@/components/common-base/form/form-upload-image/form-upload-image.vue';
import PcFormAreaPicker from '@/components/common-base/form/form-area-picker/pc-form-area-picker.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { formatSimpleSelectOptions } from '@/components/common-base/form/utils/utils';

import { SmsScene, EnrollFieldType, EnrollAuthType } from '@polyv/live-watch-sdk';
import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { enrollFormEmits, useEnrollForm, useEnrollCheckMobile } from './hooks/use-enroll-form';

const emit = defineEmits(enrollFormEmits());

const {
  needEnrollByEnter,
  enrollBanner,
  smsVerifyEnabled,
  areaCodeEnabled,
  enrollAuthType,
  enrollFields,
} = storeDefinitionToRefs(useEnrollStore);

const {
  imageVerifyInputEnabled,
  imageVerifyInputRef,
  smsValidType,
  formData,
  formRules,
  onPhoneNumberChange,
  onEmailChange,
  formatSpecialName,
  submitForm,
  onClickCancel,
} = useEnrollForm({
  emit,
});

const { blurToCheckStatus } = useEnrollCheckMobile({
  getAreaCode: () => formData.areaCode,
});
</script>

<style lang="scss">
.c-pc-enroll-form__body {
  position: relative;
  max-height: 600px;
  overflow-y: auto;

  .c-form-item {
    width: 344px;
    margin: 0 auto 24px;
  }
}

.c-pc-enroll-form__body__content {
  padding: 24px 0 0;
}

.c-pc-enroll-form__banner {
  display: block;
  width: 344px;
  height: 115px;
  margin: 0 auto 24px;
  border-radius: 8px;
  object-fit: cover;
}

.c-pc-enroll-form__item__field-tips-content {
  font-size: 14px;
  line-height: 1.5;
  color: #757575;
  word-break: break-word;
}

.c-pc-enroll-form__body__submit {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: $--color-white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  &::before {
    position: absolute;
    bottom: 81px;
    left: 0;
    width: 100%;
    height: 20px;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgba(#fff, 0) 0%, #ffffff 100%);
  }
}

.c-pc-enroll-form__body__submit__button {
  margin: 0 8px;
}
</style>
