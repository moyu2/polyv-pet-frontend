<!-- @file PC 端连麦用户节点屏幕共享遮罩层 -->
<template>
  <div class="c-pc-connect-mic-user-item-screenshare-mask">
    <img
      class="c-pc-connect-mic-user-item-screenshare-mask__icon"
      src="../imgs/screenshare-mask.png"
    />
    <div class="c-pc-connect-mic-user-item-screenshare-mask__text">
      {{ $lang('connectMic.screenshare.maskTips1') }}
    </div>
    <div class="c-pc-connect-mic-user-item-screenshare-mask__text">
      {{ $lang('connectMic.screenshare.maskTips2') }}
    </div>
    <div class="c-pc-connect-mic-user-item-screenshare-mask__buttons">
      <normal-button
        class="c-pc-connect-mic-user-item-screenshare-mask__button__item"
        :text="$lang('connectMic.screenshare.stop')"
        @click="onClickStop"
      />
      <normal-button
        class="c-pc-connect-mic-user-item-screenshare-mask__button__item"
        :text="screenShareInfo.isPiping ? $lang('base.pip.close') : $lang('base.pip.show')"
        @click="onClickPip"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { appEvents } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

const { toast } = useToastManager();

const { screenShareInfo } = storeDefinitionToRefs(useConnectMicStore);

const { getEmitter, getWatchCore } = useGlobalInject();

function onClickStop() {
  getEmitter().emit(appEvents.connectMic.TriggerStopScreenShare);
}

function onClickPip() {
  if (!screenShareInfo.value.supportPip) {
    toast.error(translate('connectMic.error.pipNotSupport'));
    return;
  }

  const watchCore = getWatchCore();

  if (!screenShareInfo.value.isPiping) {
    watchCore.connectMic.enterPip();
  } else {
    watchCore.connectMic.exitPip();
  }
}
</script>

<style lang="scss">
.c-pc-connect-mic-user-item-screenshare-mask {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #36373f;
}

.c-pc-connect-mic-user-item-screenshare-mask__icon {
  width: 112px;
  height: 102px;
  margin-bottom: 20px;
}

.c-pc-connect-mic-user-item-screenshare-mask__text {
  margin-bottom: 4px;
  font-size: 14px;
  color: #adadc0;
  opacity: 0.6;
}

.c-pc-connect-mic-user-item-screenshare-mask__buttons {
  margin-top: 16px;
}
.c-pc-connect-mic-user-item-screenshare-mask__button__item {
  width: 100px;
  padding: 0;
  margin: 0 8px;
  &:nth-child(2) {
    &,
    &:not(.is-mobile, .is-disabled):hover {
      color: #3082fe;
      background: none !important;
      border: 1px solid #3082fe;
    }
  }
}
</style>
