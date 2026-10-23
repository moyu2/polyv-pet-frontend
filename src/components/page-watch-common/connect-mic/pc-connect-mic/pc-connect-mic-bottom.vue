<!-- @file PC 端连麦底部按钮 -->
<template>
  <div
    v-if="supportConnectMic"
    class="c-pc-connect-mic-bottom"
  >
    <!-- 屏幕共享按钮 -->
    <div
      v-if="currentIsSpeaker"
      class="c-pc-connect-mic-bottom__item"
    >
      <pc-connect-mic-sceenshare-button />
    </div>

    <!-- 设备检测按钮 -->
    <div class="c-pc-connect-mic-bottom__item">
      <normal-button
        :type="ButtonType.AsideMenu"
        :size="ButtonSize.Small"
        :text="$lang('connectMic.deviceCheck')"
        block
        :icon="PcIconDeviceSetting"
        @click="onClickDeviceSetting"
      />
    </div>

    <!-- 连麦按钮 -->
    <div class="c-pc-connect-mic-bottom__item">
      <pc-connect-mic-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import PcConnectMicButton from './pc-connect-mic-button.vue';
import PcConnectMicSceenshareButton from './pc-connect-mic-sceenshare-button.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { PcIconDeviceSetting } from '@/components/component-icons/pc/map';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

const { supportConnectMic, currentIsSpeaker } = storeDefinitionToRefs(useConnectMicStore);

function onClickDeviceSetting() {
  getEmitter().emit(appEvents.connectMic.TriggerOpenDeviceSetting);
}
</script>

<style lang="scss">
.c-pc-connect-mic-bottom {
  display: flex;
  padding: 0 4px 16px;
}

.c-pc-connect-mic-bottom__item {
  box-sizing: border-box;
  flex: 1;
  padding-right: 4px;
  padding-left: 4px;
}

@media screen and (max-width: 1800px) {
  .c-pc-connect-mic-bottom {
    flex-wrap: wrap;
  }
  .c-pc-connect-mic-bottom__item {
    flex: unset;
  }
  .c-pc-connect-mic-bottom__item:nth-child(-n + 2) {
    width: 50%;
  }
  .c-pc-connect-mic-bottom__item:nth-child(3) {
    width: 100%;
    padding-top: 8px;
  }
}
</style>
