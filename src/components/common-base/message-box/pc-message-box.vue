<!-- @file PC端-消息弹窗 -->

<template>
  <pc-dialog
    ref="dialogRef"
    v-bind="pcDialogProps"
    :visible.sync="innerVisible"
    :mount-el="dialogMountEl"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
    @closed="onCancel"
  >
    <div
      class="c-pc-message-box"
      ref="messageBoxRef"
    >
      <div class="c-pc-message-box__body">
        <p
          v-if="props.content"
          v-html="props.content"
          ref="messageBoxContentRef"
          class="c-pc-message-box__content"
          :class="{
            'c-pc-message-box__content--center': contentCenter,
          }"
        ></p>
      </div>
      <div class="c-pc-message-box__footer">
        <normal-button
          class="c-pc-message-box__footer-button"
          :type="ButtonType.Cancel"
          :size="ButtonSize.Small"
          :text="props.cancelButtonText"
          @click="onCancel"
        />
        <normal-button
          class="c-pc-message-box__footer-button"
          :type="ButtonType.Primary"
          :size="ButtonSize.Small"
          @click="onConfirm"
        >
          <div
            v-if="isWeixin && confirmButtonWeixinId"
            class="c-pc-message-box__footer__btn__weixin-btn"
            :id="confirmButtonWeixinId"
          ></div>
          {{ confirmButtonText }}
        </normal-button>
      </div>
    </div>
  </pc-dialog>
</template>

<script lang="ts" setup>
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';
import { computed } from 'vue';

import { messageBoxPcProps, messageBoxEmits, useMessageBox } from './use-message-box';
import { useComputePcDialogForPlayer } from '@/hooks/business/use-compute-pc-dialog-for-player/use-compute-pc-dialog-for-player';
import { isWeixin } from '@/assets/utils/browser';

const props = defineProps(messageBoxPcProps());
const emit = defineEmits(messageBoxEmits());

const pcDialogProps = computed(() => {
  return {
    ...props,
    type: undefined,
    content: undefined,
    cancelButtonText: undefined,
    confirmButtonText: undefined,
  };
});

const {
  innerVisible,
  messageBoxRef,
  messageBoxInstance,
  messageBoxContentRef,

  onAfterEnter,
  onAfterLeave,
  onCancel,
  onConfirm,
} = useMessageBox({ props, emit });

const { dialogRef, dialogMountEl } = useComputePcDialogForPlayer();

defineExpose(messageBoxInstance);
</script>

<style lang="scss">
.c-pc-message-box__body {
  padding: 0 16px;
  margin: 24px auto;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #3e424e;
}

.c-pc-message-box__content {
  a {
    color: #3082fe;
    text-decoration: none;
  }
  p + p {
    margin-top: 8px;
  }

  &.c-pc-message-box__content--center {
    text-align: center;
  }
}
.c-pc-message-box__footer {
  padding-bottom: 24px;
  text-align: center;
}
.c-pc-message-box__footer-button {
  position: relative;
  &:first-child {
    margin-right: 16px;
  }
}

.c-pc-message-box__footer__btn__weixin-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  height: 100%;
}
</style>
