<!-- @file PC 端屏幕共享按钮 -->
<template>
  <div class="c-pc-connect-mic-sceneshare-button">
    <!-- 开始共享按钮 -->
    <normal-button
      v-if="!screenShareInfo.isScreenSharing"
      class="c-pc-connect-mic-sceneshare-button__content"
      :type="ButtonType.AsideMenu"
      :size="ButtonSize.Small"
      block
      @click="onClickStartScreenShare"
    >
      <pc-icon-screenshare-start class="c-pc-connect-mic-sceneshare-button__prefix-icon" />

      <span class="c-pc-connect-mic-sceneshare-button__text g-singleline">
        {{ $lang('connectMic.screenshare.start') }}
      </span>

      <pc-icon-screenshare-setting
        class="c-pc-connect-mic-sceneshare-button__suffix-icon"
        @click.stop="onClickSetting"
      />
    </normal-button>

    <!-- 结束共享按钮 -->
    <normal-button
      v-if="screenShareInfo.isScreenSharing"
      :type="ButtonType.AsideMenu"
      :size="ButtonSize.Small"
      block
      :icon="PcIconScreenshareStop"
      :text="$lang('connectMic.screenshare.stop')"
      @click="stopScreenShare"
    />

    <!-- 屏幕共享设置 -->
    <pc-screen-share-setting />

    <!-- 屏幕共享开启提示 -->
    <pc-screen-share-tips />
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import {
  PcIconScreenshareStart,
  PcIconScreenshareStop,
  PcIconScreenshareSetting,
} from '@/components/component-icons/pc/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import PcScreenShareSetting from './pc-connect-mic-sceenshare-setting.vue';
import PcScreenShareTips from './pc-connect-mic-screenshare-tips.vue';
import { useConnectMicScreenShare } from '../hooks/use-connect-mic-screen-share';
import { useGlobalInject } from '@/app/use-global-inject';

const { screenShareInfo } = storeDefinitionToRefs(useConnectMicStore);

const { onClickStartScreenShare, stopScreenShare } = useConnectMicScreenShare();

const { getEmitter } = useGlobalInject();

/** 点击设置 */
function onClickSetting() {
  getEmitter().emit(appEvents.connectMic.OpenScreenShareSetting, true);
}
</script>

<style lang="scss">
.c-pc-connect-mic-sceneshare-button__content {
  padding: 0 8px 0 12px;
}
.c-pc-connect-mic-sceneshare-button__prefix-icon {
  display: flex;
  margin-right: 4px;
  font-size: 16px;
}
.c-pc-connect-mic-sceneshare-button__suffix-icon {
  display: flex;
  padding-left: 4px;
  margin-left: 4px;
  font-size: 16px;
  border-left: 1px solid #d8d8d8;
}
.c-pc-connect-mic-sceneshare-button__text {
  flex: 1;
}
</style>
