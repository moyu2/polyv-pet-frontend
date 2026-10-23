<!-- @file PC 端播放器控制栏连麦部分 -->
<template>
  <div class="c-pc-player-control__connect-mic-setting">
    <p class="c-pc-player-control__connect-mic-setting__nickname">
      <span v-if="masterNickname">{{ masterNickname }}</span>
      <span v-if="masterActor">({{ masterActor }})</span>
    </p>

    <div
      v-if="videoVisible"
      class="c-pc-player-control__button"
      :class="{
        'c-pc-player-control__button--video-readonly': !masterIsSelf,
        'c-pc-player-control__button--video-normal': !masterIsVideoMuted,
        'c-pc-player-control__button--video-muted': masterIsVideoMuted,
      }"
      @click="onClickVideo"
    ></div>

    <div
      class="c-pc-player-control__button"
      :class="{
        'c-pc-player-control__button--audio-readonly': !masterIsSelf,
        'c-pc-player-control__button--audio-normal': !masterIsAudioMuted,
        'c-pc-player-control__button--audio-muted': masterIsAudioMuted,
      }"
      @click="onClickAudio"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { ConnectMicType } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { useConnectMicControl } from '@/components/page-watch-common/connect-mic/hooks/use-connect-mic';

const {
  masterActor,
  masterNickname,
  masterIsSelf,
  masterIsVideoMuted,
  masterIsAudioMuted,
  masterConnectMicType,
  supportSetupVideo,
} = storeDefinitionToRefs(useConnectMicStore);

const { toggleVideo, toggleAudio } = useConnectMicControl();

const videoVisible = computed(() => {
  if (masterIsSelf.value && !supportSetupVideo.value) {
    return false;
  }

  return masterConnectMicType.value === ConnectMicType.Video;
});

function onClickVideo() {
  if (unref(masterIsSelf) && unref(supportSetupVideo)) {
    toggleVideo();
  }
}

function onClickAudio() {
  if (unref(masterIsSelf)) {
    toggleAudio();
  }
}
</script>

<style lang="scss">
.c-pc-player-control__connect-mic-setting {
  display: flex;
  align-items: center;
}

.c-pc-player-control__connect-mic-setting__nickname {
  margin-right: 12px;
  color: $--color-white;
}

.c-pc-player-control__button--video-readonly,
.c-pc-player-control__button--audio-readonly {
  cursor: default !important;
}

.c-pc-player-control__button--video-normal {
  background-image: url(./imgs/icon-call-video.png);
  &:not(.c-pc-player-control__button--video-readonly):hover {
    background-image: url(./imgs/icon-call-video-hover.png);
  }
}

.c-pc-player-control__button--video-muted {
  background-image: url(./imgs/icon-call-video-close.png);
  &:not(.c-pc-player-control__button--video-readonly):hover {
    background-image: url(./imgs/icon-call-video-close-hover.png);
  }
}

.c-pc-player-control__button--audio-normal {
  background-image: url(./imgs/icon-call-audio.png);
  &:not(.c-pc-player-control__button--audio-readonly):hover {
    background-image: url(./imgs/icon-call-audio-hover.png);
  }
}

.c-pc-player-control__button--audio-muted {
  background-image: url(./imgs/icon-call-audio-close.png);
  &:not(.c-pc-player-control__button--audio-readonly):hover {
    background-image: url(./imgs/icon-call-audio-close-hover.png);
  }
}
</style>
