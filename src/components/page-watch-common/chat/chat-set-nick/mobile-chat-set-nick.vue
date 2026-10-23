<!-- @file 移动端设置昵称 -->
<template>
  <mobile-popup
    class="c-mobile-chat-set-nick"
    :visible.sync="dialogVisible"
    :title="$lang('chat.setNick.title')"
  >
    <div
      class="c-mobile-chat-set-nick__content"
      data-testid="mobile-chat-set-nick-content"
    >
      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitSetNick"
      >
        <form-item form-field="nickname">
          <form-input
            data-testid="mobile-chat-set-nick-input"
            v-model="formData.nickname"
            :maxlength="nickMaxLength"
            :placeholder="$lang('chat.setNick.placeholder')"
          />
        </form-item>
        <div class="c-mobile-chat-set-nick__content__buttons">
          <form-submit-button
            data-testid="mobile-chat-set-nick-submit-btn"
            :text="$lang('base.confirm')"
            :size="ButtonSize.Medium"
            block
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
import { useChatSetNick } from './use-chat-set-nick';

const {
  dialogVisible,

  formData,
  formRules,
  submitSetNick,

  nickMaxLength,
} = useChatSetNick();
</script>

<style lang="scss">
.c-mobile-chat-set-nick__content {
  padding: 24px;
  @include iphone-x-pb(24px);
}
</style>
