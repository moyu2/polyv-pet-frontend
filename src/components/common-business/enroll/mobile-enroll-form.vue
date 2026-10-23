<!-- @file 移动端报名观看表单 -->
<template>
  <div class="c-mobile-enroll-form">
    <div class="c-mobile-enroll-form__body">
      <div class="c-mobile-enroll-form__body__content">
        <!-- 头部图 -->
        <img
          v-if="enrollBanner"
          class="c-mobile-enroll-form__banner"
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
                  :placeholder="item.tips"
                  :maxlength="20"
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
                <mobile-form-select
                  v-model="formData[item.fieldId]"
                  :title="formatSpecialName(item)"
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
                <mobile-form-select
                  multiple
                  v-model="formData[item.fieldId]"
                  :title="formatSpecialName(item)"
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
                <mobile-form-phone-input
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
                <mobile-form-sms-verify-input
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
                <mobile-form-upload-image
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
                <mobile-form-area-picker
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
                <mobile-form-protocol
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
                <span class="c-mobile-enroll-form__item__field-tips-content">
                  {{ item.name }}
                </span>
              </form-item>
            </template>
          </template>

          <div
            class="c-mobile-enroll-form__body__submit"
            :class="{
              'c-mobile-enroll-form__body__submit--near-bottom': isNearBottom,
            }"
          >
            <form-submit-button
              class="c-mobile-enroll-form__body__submit__button"
              :size="ButtonSize.Medium"
              block
              :text="needEnrollByEnter ? $lang('base.enterLive') : $lang('base.submit')"
              allow-disabled-click
              debounce-submit
            />
          </div>
        </form-wrap>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ButtonSize } from '@/components/common-base/normal-button/types';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import MobileFormSelect from '@/components/common-base/form/form-select/mobile-form-select.vue';
import MobileFormPhoneInput from '@/components/common-base/form/form-phone-input/mobile-form-phone-input.vue';
import FormImageVerifyInput from '@/components/common-base/form/form-image-verify-input/form-image-verify-input.vue';
import MobileFormSmsVerifyInput from '@/components/common-base/form/form-sms-verify-input/mobile-form-sms-verify-input.vue';
import MobileFormProtocol from '@/components/common-base/form/form-protocol/mobile-form-protocol.vue';
import MobileFormUploadImage from '@/components/common-base/form/form-upload-image/form-upload-image.vue';
import MobileFormAreaPicker from '@/components/common-base/form/form-area-picker/mobile-form-area-picker.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import { formatSimpleSelectOptions } from '@/components/common-base/form/utils/utils';

import { SmsScene, EnrollFieldType, EnrollAuthType } from '@polyv/live-watch-sdk';
import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import {
  enrollFormMobileProps,
  enrollFormEmits,
  useEnrollForm,
  useEnrollCheckMobile,
} from './hooks/use-enroll-form';

defineProps(enrollFormMobileProps());
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
  imageVerifyInputRef,
  smsValidType,
  imageVerifyInputEnabled,
  formData,
  formRules,
  onPhoneNumberChange,
  onEmailChange,
  formatSpecialName,
  submitForm,
} = useEnrollForm({
  emit,
});

const { blurToCheckStatus } = useEnrollCheckMobile({
  getAreaCode: () => formData.areaCode,
});
</script>

<style lang="scss">
.c-mobile-enroll-form__body {
  padding: 0 16px;
}
.c-mobile-enroll-form__body__content {
  padding: 24px 0 0;
}

.c-mobile-enroll-form__entrance {
  margin: 0 auto 20px;
  font-size: 14px;
  color: $--color-primary;
  text-align: center;
  cursor: pointer;
}

.c-mobile-enroll-form__banner {
  display: block;
  width: 100%;
  margin: 0 auto 24px;
  border-radius: 8px;
  object-fit: cover;
}

.c-mobile-enroll-form__item__field-tips-content {
  font-size: 14px;
  line-height: 1.5;
  color: #757575;
  word-break: break-word;
}

.c-mobile-enroll-form__body__submit {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  background: $--color-white;

  &::before {
    position: absolute;
    bottom: 100%;
    left: 50%;
    width: 106%;
    height: 40px;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgba(#fff, 0) 0%, #ffffff 100%);
    transform: translateX(-50%);
  }
}

.c-mobile-enroll-form__body__submit--near-bottom {
  &::before {
    opacity: 0;
  }
}
</style>
