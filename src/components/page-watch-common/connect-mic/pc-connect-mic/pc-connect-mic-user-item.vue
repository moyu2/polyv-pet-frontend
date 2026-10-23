<!-- @file PC 端连麦用户节点 -->
<template>
  <div class="c-pc-connect-mic-user-item">
    <background-section
      :background-type="themeSetting.playerBackgroundType"
      :custom-url="playerBgUrl"
    />

    <div
      ref="wrapRef"
      class="c-pc-connect-mic-user-item__wrap"
      :class="{
        'c-pc-connect-mic-user-item__wrap--no-mirror': isLocal && !mirrorEnabled,
      }"
    ></div>

    <!-- 占位图 -->
    <player-video-placeholder
      v-if="isVideoMuted"
      :is-sip-user="isSipUser"
    />

    <!-- 音频直播下第一画面位置的占位图 -->
    <player-audio-live-placeholder
      v-if="isMaster && isCustomLiveAudioMode"
      :use-splash-img="isCustomLiveAudioMode"
    />

    <!-- 右上角网络状态 -->
    <connect-mic-network
      v-if="micInfoVisible && isLocal"
      class="c-pc-connect-mic-user-item__network"
      :network-status="networkInfo.uplinkNetworkStatus"
    />

    <!-- 右上角共享画笔 -->
    <div
      v-if="showShareIcon && micInfoVisible"
      class="c-pc-connect-mic-user-item__share"
    >
      <span>共</span>
    </div>

    <!-- 底部信息 -->
    <connect-mic-info
      v-if="micInfoVisible"
      :nickname="micNickname"
      :is-audio-muted="isAudioMuted"
      :current-volume="currentVolume"
    />

    <!-- 连麦控制 -->
    <connect-mic-user-item-control
      v-if="micInfoVisible && isLocal"
      :connect-mic-type="currentConnectMicType"
      :is-audio-muted="isAudioMuted"
      :is-video-muted="isVideoMuted"
      :mirror-enabled="mirrorEnabled"
      @enabled-video="enabledVideo"
      @disabled-video="disabledVideo"
      @enabled-audio="enabledAudio"
      @disabled-audio="disabledAudio"
      @toggle-mirror="() => toggleMirror()"
    />

    <!-- 当前正在屏幕共享时的遮罩层 -->
    <screen-share-mask
      v-if="
        isLocal &&
        isMaster &&
        screenShareInfo.isScreenSharing &&
        mainScreen === MainScreenContent.Player
      "
    />
  </div>
</template>

<script setup lang="ts">
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';
import PlayerVideoPlaceholder from '@/components/common-business/player/player-video-placeholder.vue';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import ConnectMicInfo from '../common/connect-mic-info.vue';
import ConnectMicNetwork from '../common/connect-mic-network.vue';
import ConnectMicUserItemControl from './pc-connect-mic-user-item-control.vue';
import ScreenShareMask from './pc-connect-mic-user-item-screenshare-mask.vue';

import { useConnectMicControl } from '../hooks/use-connect-mic';
import { connectMicItemProps, useConnectMicItem } from '../hooks/use-connect-mic-item';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useThemeStore } from '@/store/use-theme-store';

const props = defineProps(connectMicItemProps());

const {
  wrapRef,
  micInfoVisible,
  micNickname,
  isAudioMuted,
  currentVolume,
  isVideoMuted,
  isSipUser,
  isLocal,
  isMaster,
  currentConnectMicType,
  showShareIcon,
  mirrorEnabled,
} = useConnectMicItem({
  props,
});

const { enabledVideo, disabledVideo, enabledAudio, disabledAudio, toggleMirror } =
  useConnectMicControl();

const { screenShareInfo, networkInfo } = storeDefinitionToRefs(useConnectMicStore);

const { mainScreen } = storeDefinitionToRefs(useLayoutStore);

const { isCustomLiveAudioMode } = storeDefinitionToRefs(useChannelStore);

const { playerBgUrl, themeSetting } = storeDefinitionToRefs(useThemeStore);
</script>

<style lang="scss">
.c-pc-connect-mic-user-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-pc-connect-mic-user-item__network {
  position: absolute;
  top: 0;
  right: 0;
}

.c-pc-connect-mic-user-item__wrap {
  width: 100%;
  height: 100%;

  .pv-rtc-player-video {
    background: none !important;

    & > div {
      background-color: transparent !important;
    }
  }

  video {
    background: transparent !important;
    transform: none !important;
  }
}

.c-pc-connect-mic-user-item__wrap--no-mirror {
  video {
    transform: scaleX(-1) !important;
  }
}

.c-pc-connect-mic-user-item__share {
  position: absolute;
  top: 24px;
  right: 5px;
  width: 20px;
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  background-color: #3082fe;
  border-radius: 50%;
}
</style>
