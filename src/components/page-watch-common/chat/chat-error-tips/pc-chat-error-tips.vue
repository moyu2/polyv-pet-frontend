<!-- @file PC 端聊天区域异常提示组件 -->
<template>
  <div
    v-if="showTips"
    class="c-pc-chat-error-tips"
  >
    <pc-icon-warning-round-fill class="c-pc-chat-error-tips__icon" />

    <div class="c-pc-chat-error-tips__content">
      <span>{{ content }}</span>
    </div>

    <pc-icon-close
      v-if="closable"
      class="c-pc-chat-error-tips__close"
      @click="onClickClose"
    />
  </div>
</template>

<script setup lang="ts">
import { useProps } from '@polyv/vue-components';
import { PcIconClose, PcIconWarningRoundFill } from '@/components/component-icons/pc/map';
import { chatErrorTipsProps, useChatErrorTips } from './use-chat-error-tips';

const props = defineProps(chatErrorTipsProps());

const { content, closable } = useProps(props);

const { showTips, onClickClose } = useChatErrorTips();
</script>

<style lang="scss">
.c-pc-chat-error-tips {
  box-sizing: border-box;
  display: flex;
  padding: 8px 12px;
  color: #ffffff;
  background: #ff6767;
  border-radius: 4px;
}

.c-pc-chat-error-tips__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
}

.c-pc-chat-error-tips__content {
  flex: 1;
  font-size: 12px;
  line-height: 16px;
}

.c-pc-chat-error-tips__close {
  display: flex;
  margin-left: 8px;
  font-size: 16px !important;
  cursor: pointer;
}
</style>
