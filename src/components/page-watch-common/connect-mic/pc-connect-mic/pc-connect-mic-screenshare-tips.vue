<!-- @file PC 端屏幕共享提示 -->
<template>
  <pc-dialog
    class="c-pc-connect-mic-screenshare-tips"
    :visible.sync="visible"
    :title="$lang('base.tips')"
    :width="400"
  >
    <div class="c-pc-connect-mic-screenshare-tips__content">
      <p>1. {{ $lang('connectMic.screenshare.tips2') }}</p>
      <p>2. {{ $lang('connectMic.screenshare.tips3') }}</p>
      <p>3. {{ $lang('connectMic.screenshare.tips4') }}</p>

      <div class="c-pc-connect-mic-screenshare-tips__link">
        <a
          href="https://www.google.cn/chrome/"
          target="_blank"
          rel="noopener"
        >
          {{ $lang('connectMic.download') }}
        </a>
      </div>

      <div class="c-pc-connect-mic-screenshare-tips__checkbox">
        <pc-form-checkbox :checked.sync="notVisible">
          {{ $lang('base.notVisibleDialog') }}
        </pc-form-checkbox>
      </div>

      <div class="c-pc-connect-mic-screenshare-tips__button">
        <normal-button
          :text="$lang('base.confirm')"
          :size="ButtonSize.Small"
          @click="onClickConfirm"
        />
      </div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import PcFormCheckbox from '@/components/common-base/form/form-checkbox/pc-form-checkbox.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { ref } from 'vue';
import { setTipsOnce } from '../hooks/use-connect-mic-screen-share';
import { useGlobalInject } from '@/app/use-global-inject';

const { visible, show: showTips, close: closeTips } = useSimpleVisible(false);

useEventBusListener(appEvents.connectMic.OpenScreenShareTips, showTips);

const { getEmitter } = useGlobalInject();

const notVisible = ref(false);

function onClickConfirm() {
  if (notVisible.value) {
    setTipsOnce();
  }

  closeTips();

  getEmitter().emit(appEvents.connectMic.TriggerStartScreenShare);
}
</script>

<style lang="scss">
.c-pc-connect-mic-screenshare-tips__content {
  padding: 24px;

  .c-pc-connect-mic-screenshare-tips__link,
  p {
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 24px;
  }

  .c-pc-connect-mic-screenshare-tips__link a {
    color: #2196f3;
    text-decoration: none;
  }
}

.c-pc-connect-mic-screenshare-tips__button {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
