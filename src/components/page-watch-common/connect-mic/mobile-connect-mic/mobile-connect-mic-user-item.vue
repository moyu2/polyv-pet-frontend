<!-- @file 移动端连麦用户节点 -->
<template>
  <div class="c-mobile-connect-mic-user-item">
    <background-section
      :background-type="themeSetting.playerBackgroundType"
      :custom-url="playerBgUrl"
    />

    <div
      ref="wrapRef"
      class="c-mobile-connect-mic-user-item__wrap"
      :class="{
        'c-mobile-connect-mic-user-item__wrap--no-mirror': isLocal && !mirrorEnabled,
      }"
    ></div>

    <!-- 关闭摄像头 -->
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
      v-if="isLocal"
      class="c-mobile-connect-mic-user-item__network"
      :network-status="networkInfo.uplinkNetworkStatus"
    />

    <!-- 右上角共享画笔 -->
    <div
      v-if="showShareIcon && micInfoVisible"
      class="c-mobile-connect-mic-user-item__share"
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
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';
import PlayerVideoPlaceholder from '@/components/common-business/player/player-video-placeholder.vue';
import ConnectMicInfo from '../common/connect-mic-info.vue';
import ConnectMicNetwork from '../common/connect-mic-network.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { connectMicItemProps, useConnectMicItem } from '../hooks/use-connect-mic-item';
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
  showShareIcon,
  isPause,
  mirrorEnabled,
  checkMediaPaused,
} = useConnectMicItem({
  props,
});

const { networkInfo } = storeDefinitionToRefs(useConnectMicStore);
const { setIsConnectMicPaused } = useConnectMicStore();

const { isCustomLiveAudioMode } = storeDefinitionToRefs(useChannelStore);

const { themeSetting, playerBgUrl } = storeDefinitionToRefs(useThemeStore);

watch(
  () => isPause.value,
  (val: boolean) => {
    // 部分机型（安卓微信）可能会有错误的事件触发，二次检查是否是真的被暂停了
    if ((val && checkMediaPaused()) || !val) {
      setIsConnectMicPaused(val);
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-mobile-connect-mic-user-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-mobile-connect-mic-user-item__network {
  position: absolute;
  top: 0;
  right: 0;
}

.c-mobile-connect-mic-user-item__wrap {
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

.c-mobile-connect-mic-user-item__wrap--no-mirror {
  video {
    transform: scaleX(-1) !important;
  }
}

.c-mobile-connect-mic-user-item__share {
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
