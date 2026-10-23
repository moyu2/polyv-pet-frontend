<!-- @file PC 端聊天室设置昵称 -->
<template>
  <pc-dialog
    class="c-pc-chat-set-nick"
    :visible.sync="dialogVisible"
    :title="$lang('chat.setNick.title')"
    :width="264"
    draggable
    hide-header-border
    :mask="false"
    :position-computed-elem="PC_LAYOUT_ASIDE_WRAP"
  >
    <div class="c-pc-chat-set-nick__content">
      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitSetNick"
      >
        <form-item form-field="nickname">
          <form-input
            v-model="formData.nickname"
            :placeholder="$lang('chat.setNick.placeholder')"
            show-word-limit
            :maxlength="nickMaxLength"
            data-testid="c-pc-chat-set-nick-comp"
          />
        </form-item>
        <div class="c-pc-chat-set-nick__content__buttons">
          <form-submit-button
            :text="$lang('base.confirm')"
            :size="ButtonSize.Small"
            data-testid="c-pc-chat-set-nick__content__buttons_confirm"
          />
          <normal-button
            :text="$lang('base.cancel')"
            :size="ButtonSize.Small"
            :type="ButtonType.Info"
            @click="setDialogVisible(false)"
            data-testid="c-pc-chat-set-nick__content__buttons_cancel"
          />
        </div>
      </form-wrap>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { useChatSetNick } from './use-chat-set-nick';
import { PC_LAYOUT_ASIDE_WRAP } from '@/assets/constants/selector';

const {
  dialogVisible,
  setDialogVisible,

  formData,
  formRules,
  submitSetNick,

  nickMaxLength,
} = useChatSetNick();
</script>

<style lang="scss">
.c-pc-chat-set-nick__content {
  padding: 8px 16px 24px;

  .c-normal-button {
    min-width: 64px;
    margin: 0 8px;
  }
}

.c-pc-chat-set-nick__content__buttons {
  display: flex;
  justify-content: center;
}
</style>
