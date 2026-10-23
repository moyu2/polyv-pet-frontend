<!-- @file PC 端连麦控制 -->
<template>
  <div
    class="c-pc-connect-mic-control"
    @mousemove="showControl"
    @mouseenter="showControl"
    @mouseleave="hideControl"
  >
    <transition name="fade">
      <div
        v-show="controlVisible"
        class="c-pc-connect-mic-control__content"
      >
        <!-- 摄像头 -->
        <div
          v-if="supportSetupVideo"
          class="c-pc-connect-mic-control__button g-img-cover"
          :class="{
            'c-pc-connect-mic-control__button--video-normal': !isVideoMuted,
            'c-pc-connect-mic-control__button--video-muted': isVideoMuted,
          }"
          @click="onClickVideo"
        ></div>

        <!-- 麦克风 -->
        <div
          class="c-pc-connect-mic-control__button g-img-cover"
          :class="{
            'c-pc-connect-mic-control__button--audio-normal': !isAudioMuted,
            'c-pc-connect-mic-control__button--audio-muted': isAudioMuted,
          }"
          @click="onClickAudio"
        ></div>

        <!-- 镜像 -->
        <div
          v-if="supportSetupVideo"
          class="c-pc-connect-mic-control__button g-img-cover"
          :class="{
            'c-pc-connect-mic-control__button--mirror-enabled': mirrorEnabled && !isVideoMuted,
            'c-pc-connect-mic-control__button--mirror-disabled': !mirrorEnabled && !isVideoMuted,
            'c-pc-connect-mic-control__button--mirror-video-disabled': isVideoMuted,
          }"
          @click="onClickMirror"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PropUtils, emitFunc } from '@polyv/vue-components';
import { useHoverVisible } from '@/hooks/behaviors/use-hover-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicType } from '@polyv/live-watch-sdk';

const props = defineProps({
  /** 连麦方式 */
  connectMicType: PropUtils.enum<ConnectMicType>().def(ConnectMicType.Video),
  /** 是否关闭摄像头 */
  isVideoMuted: PropUtils.bool.def(false),
  /** 是否关闭麦克风 */
  isAudioMuted: PropUtils.bool.def(false),
  /** 是否开启镜像 */
  mirrorEnabled: PropUtils.bool.def(true),
});

const emit = defineEmits({
  /** 开启摄像头 */
  'enabled-video': emitFunc<void>(),
  /** 关闭摄像头 */
  'disabled-video': emitFunc<void>(),
  /** 开启麦克风 */
  'enabled-audio': emitFunc<void>(),
  // 关闭麦克风
  'disabled-audio': emitFunc<void>(),
  /** 切换镜像 */
  'toggle-mirror': emitFunc<void>(),
});

const { supportSetupVideo } = storeDefinitionToRefs(useConnectMicStore);

function onClickVideo() {
  if (props.isVideoMuted) {
    emit('enabled-video');
  } else {
    emit('disabled-video');
  }
}

function onClickAudio() {
  if (props.isAudioMuted) {
    emit('enabled-audio');
  } else {
    emit('disabled-audio');
  }
}

function onClickMirror() {
  emit('toggle-mirror');
}

const {
  hoverItemVisible: controlVisible,
  showHoverItem: showControl,
  hideHoverItem: hideControl,
} = useHoverVisible();
</script>

<style lang="scss">
.c-pc-connect-mic-control {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.c-pc-connect-mic-control__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.c-pc-connect-mic-control__button {
  width: 40px;
  height: 40px;
  margin: 0 6px;
  cursor: pointer;
}

.c-pc-connect-mic-control__button--video-normal {
  background-image: url(../imgs/item-video-open.png);
  &:hover {
    background-image: url(../imgs/item-video-open-hover.png);
  }
}

.c-pc-connect-mic-control__button--video-muted {
  background-image: url(../imgs/item-video-close.png);
  &:hover {
    background-image: url(../imgs/item-video-close-hover.png);
  }
}

.c-pc-connect-mic-control__button--audio-normal {
  background-image: url(../imgs/item-audio-open.png);
  &:hover {
    background-image: url(../imgs/item-audio-open-hover.png);
  }
}

.c-pc-connect-mic-control__button--audio-muted {
  background-image: url(../imgs/item-audio-close.png);
  &:hover {
    background-image: url(../imgs/item-audio-close-hover.png);
  }
}

.c-pc-connect-mic-control__button--mirror-enabled {
  background-image: url(../imgs/item-mirror-enabled.png);
  &:hover {
    background-image: url(../imgs/item-mirror-enabled-hover.png);
  }
}

.c-pc-connect-mic-control__button--mirror-disabled {
  background-image: url(../imgs/item-mirror-disabled.png);
  &:hover {
    background-image: url(../imgs/item-mirror-disabled-hover.png);
  }
}

.c-pc-connect-mic-control__button--mirror-video-disabled {
  pointer-events: none;
  background-image: url(../imgs/item-mirror-disabled.png);
  opacity: 0.5;
}
</style>
