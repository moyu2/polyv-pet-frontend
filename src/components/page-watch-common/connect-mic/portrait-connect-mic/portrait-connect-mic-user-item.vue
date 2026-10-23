<!-- @file 移动端连麦用户节点 -->
<template>
  <div class="c-portrait-connect-mic-user-item">
    <div
      ref="wrapRef"
      class="c-portrait-connect-mic-user-item__wrap"
      :class="{
        'c-portrait-connect-mic-user-item__wrap--no-mirror': isLocal && !mirrorEnabled,
      }"
    ></div>

    <!-- 竖屏无法点击这个按钮，先注释，没用 -->
    <!-- <div
      v-if="playBtnShow"
      @click="resume"
      class="c-portrait-connect-mic-user-item__fail"
    >
      <img
        src="../imgs/btn-play.png"
        alt="play"
        class="c-portrait-connect-mic-user-item__fail--img"
      />
    </div> -->

    <!-- 关闭摄像头 -->
    <player-video-placeholder
      v-if="isVideoMuted"
      :is-sip-user="isSipUser"
    />

    <!-- 音频直播下主讲位置的占位图 -->
    <player-audio-live-placeholder
      v-if="isMaster && isCustomLiveAudioMode"
      :use-splash-img="isCustomLiveAudioMode"
    />

    <!-- 右上角网络状态 -->
    <connect-mic-network
      v-if="isLocal"
      class="c-portrait-connect-mic-user-item__network"
      :network-status="networkInfo.uplinkNetworkStatus"
    />

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
// import { computed } from 'vue';
import ConnectMicInfo from '../common/connect-mic-info.vue';
import ConnectMicNetwork from '../common/connect-mic-network.vue';
import PlayerVideoPlaceholder from '@/components/common-business/player/player-video-placeholder.vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';

import { connectMicItemProps, useConnectMicItem } from '../hooks/use-connect-mic-item';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';

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
  // isPause,
  mirrorEnabled,
  // isAudience,
} = useConnectMicItem({
  props,
});

const { networkInfo } = storeDefinitionToRefs(useConnectMicStore);

const { isCustomLiveAudioMode } = storeDefinitionToRefs(useChannelStore);

// const playBtnShow = computed(() => {
//   if (isAudience.value) {
//     return false;
//   }

//   return isPause;
// });
</script>

<style lang="scss">
.c-portrait-connect-mic-user-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-portrait-connect-mic-user-item__network {
  position: absolute;
  top: 0;
  right: 0;
}

.c-portrait-connect-mic-user-item__wrap {
  width: 100%;
  height: 100%;

  video {
    transform: none !important;
  }
}

.c-portrait-connect-mic-user-item__wrap--no-mirror {
  video {
    transform: scaleX(-1) !important;
  }
}
.c-portrait-connect-mic-user-item__fail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);

  .c-portrait-connect-mic-user-item__fail--img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 56px;
    height: 56px;
    transform: translate(-50%, -50%);
  }
}
</style>
