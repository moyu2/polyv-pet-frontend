<!-- @file PC 端挂断连麦二次确认 -->
<template>
  <div
    v-show="confirmVisible"
    class="c-pc-connect-mic-confirm"
  >
    <div class="c-pc-connect-mic-confirm__inner">
      <p class="c-pc-connect-mic-confirm__text">
        {{ $lang('connectMic.confirm3') }}
      </p>
      <div class="c-pc-connect-mic-confirm__buttons">
        <div
          class="c-pc-connect-mic-confirm__button"
          @click="onClickCancel"
        >
          {{ $lang('base.cancel') }}
        </div>
        <div
          class="c-pc-connect-mic-confirm__button c-pc-connect-mic-confirm__button--confirm"
          @click="onClickConfirm"
        >
          {{ $lang('base.confirm') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

const { visible: confirmVisible, show: showConfirm, close: closeConfirm } = useSimpleVisible(false);

useEventBusListener(appEvents.connectMic.TriggerEndConnectConfirm, showConfirm);

const { getEmitter } = useGlobalInject();

function onClickConfirm() {
  getEmitter().emit(appEvents.connectMic.TriggerEndConnectMic);
  closeConfirm();
}

function onClickCancel() {
  closeConfirm();
}
</script>

<style lang="scss">
.c-pc-connect-mic-confirm {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba($color: #000000, $alpha: 0.8);
}

.c-pc-connect-mic-confirm__inner {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  font-size: 14px;
  line-height: 30px;
  color: #e4e4e4;
  text-align: center;
  transform: translateY(-50%);
}

.c-pc-connect-mic-confirm__buttons {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.c-pc-connect-mic-confirm__button {
  width: 86px;
  height: 30px;
  margin: 0 4px;
  font-size: 14px;
  line-height: 30px;
  color: $--color-white;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}

.c-pc-connect-mic-confirm__button--confirm {
  background: #ff5b5b;
  border-color: #ff5b5b;
}
</style>
