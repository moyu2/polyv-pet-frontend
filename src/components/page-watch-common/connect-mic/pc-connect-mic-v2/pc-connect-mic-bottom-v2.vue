<!-- @file PC 端连麦中底部固定控制栏 v2 -->
<template>
  <div class="c-pc-connect-mic-bottom-v2">
    <!-- 控制按钮行 -->
    <div class="c-pc-connect-mic-bottom-v2__controls">
      <div
        class="c-pc-connect-mic-bottom-v2__control-btn"
        :class="{ 'c-pc-connect-mic-bottom-v2__control-btn--off': localIsAudioMuted }"
        @click="toggleAudio"
      >
        <div class="c-pc-connect-mic-bottom-v2__control-btn__audio">
          <img
            class="c-pc-connect-mic-bottom-v2__control-icon"
            :src="localIsAudioMuted ? imgMicOff : imgMicOn"
            alt=""
          />
          <span
            class="c-pc-connect-mic-bottom-v2__control-btn__volume"
            :style="{ height: `${Math.min(audioVolume * 10, 10)}px` }"
          ></span>
        </div>
      </div>

      <div
        v-if="connectMicType !== ConnectMicType.Audio"
        class="c-pc-connect-mic-bottom-v2__control-btn"
        :class="{ 'c-pc-connect-mic-bottom-v2__control-btn--off': localIsVideoMuted }"
        @click="toggleVideo"
      >
        <img
          class="c-pc-connect-mic-bottom-v2__control-icon"
          :src="localIsVideoMuted ? imgCamOff : imgCamOn"
          alt=""
        />
      </div>

      <pc-connect-mic-screenshare-button-v2 v-if="audioWithScreenShare" />

      <div
        class="c-pc-connect-mic-bottom-v2__control-btn"
        @click="onClickDeviceSetting"
      >
        <img
          class="c-pc-connect-mic-bottom-v2__control-icon"
          :src="imgSetting"
          alt=""
        />
      </div>
    </div>

    <!-- 操作行：屏幕共享 + 挂断 -->
    <div class="c-pc-connect-mic-bottom-v2__action">
      <pc-connect-mic-screenshare-button-v2 v-if="currentIsSpeaker && !audioWithScreenShare" />

      <div
        class="c-pc-connect-mic-bottom-v2__hangup"
        @click="onClickHangup"
      >
        <icon-phone class="c-pc-connect-mic-bottom-v2__hangup-icon" />
        <span class="c-pc-connect-mic-bottom-v2__hangup-timer">{{ formattedDuration }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConnectMicStatus, ConnectMicType } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useConnectMicControl } from '../hooks/use-connect-mic';

import IconPhone from '../common/icon-phone.vue';
import PcConnectMicScreenshareButtonV2 from './pc-connect-mic-screenshare-button-v2.vue';

import imgMicOn from '../imgs/ic_mob_mic.png';
import imgMicOff from '../imgs/ic_mob_mic_off.png';
import imgCamOn from '../imgs/ic_mob_cam.png';
import imgCamOff from '../imgs/icon_mob_cam_off.png';
import imgSetting from '../imgs/setting.png';

const {
  connectMicStatus,
  connectMicType,
  localIsAudioMuted,
  localIsVideoMuted,
  localMicItem,
  currentIsSpeaker,
} = storeDefinitionToRefs(useConnectMicStore);

const { toggleAudio, toggleVideo } = useConnectMicControl();

const { getEmitter } = useGlobalInject();

/** 音频连麦且具备主讲权限时，屏幕共享按钮上移至控制行（挂断按钮单独占一行） */
const audioWithScreenShare = computed(
  () => unref(connectMicType) === ConnectMicType.Audio && unref(currentIsSpeaker),
);

/** 麦克风音量 0~1：取本地流实时音量；静音归零；>0.1 时抬高便于条柱可见 */
const audioVolume = computed(() => {
  if (unref(localIsAudioMuted)) return 0;
  const raw = unref(localMicItem)?.currentVolume ?? 0;
  if (raw > 0.1) return Math.min(raw + 0.4, 1);
  return raw;
});

function onClickDeviceSetting() {
  getEmitter().emit(appEvents.connectMic.TriggerOpenDeviceSetting);
}

function onClickHangup() {
  getEmitter().emit(appEvents.connectMic.TriggerEndConnectConfirm);
}

/** 连麦开始时间戳 */
const connectStartAt = ref(0);
/** 已连麦秒数 */
const connectDurationSeconds = ref(0);
let durationTimer: number | undefined;

function startDurationTimer() {
  stopDurationTimer();
  connectStartAt.value = Date.now();
  connectDurationSeconds.value = 0;
  durationTimer = window.setInterval(() => {
    connectDurationSeconds.value = Math.floor((Date.now() - unref(connectStartAt)) / 1000);
  }, 1000);
}

function stopDurationTimer() {
  if (durationTimer) {
    window.clearInterval(durationTimer);
    durationTimer = undefined;
  }
  connectDurationSeconds.value = 0;
}

const formattedDuration = computed(() => {
  const total = unref(connectDurationSeconds);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
});

watch(
  () => unref(connectMicStatus),
  status => {
    if (status === ConnectMicStatus.Connected) {
      if (!durationTimer) startDurationTimer();
    } else if (status === ConnectMicStatus.NotConnect || status === ConnectMicStatus.Error) {
      stopDurationTimer();
    }
  },
);

onMounted(() => {
  if (unref(connectMicStatus) === ConnectMicStatus.Connected) {
    startDurationTimer();
  }
});

onBeforeUnmount(() => {
  stopDurationTimer();
});
</script>

<style lang="scss">
.c-pc-connect-mic-bottom-v2 {
  flex-shrink: 0;
  padding: 16px 0 24px;
}

.c-pc-connect-mic-bottom-v2__controls {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 204px;
  margin: 0 auto;
}

.c-pc-connect-mic-bottom-v2__control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;

  &:hover {
    background: rgba(0, 0, 0, 0.65);
  }
}

.c-pc-connect-mic-bottom-v2__control-btn--off {
  background: rgba(0, 0, 0, 0.35);

  .c-pc-connect-mic-bottom-v2__control-icon {
    opacity: 0.3;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.45);
  }
}

.c-pc-connect-mic-bottom-v2__control-icon {
  width: auto;
  height: 22px;
  pointer-events: none;
  user-select: none;
}

.c-pc-connect-mic-bottom-v2__control-btn__audio {
  position: relative;
  font-size: 0;
}

.c-pc-connect-mic-bottom-v2__control-btn__volume {
  position: absolute;
  bottom: 10px;
  left: 50%;
  width: 4px;
  height: 10px;
  margin-left: -2px;
  background: #0dc565;
  border-radius: 2px;
}

.c-pc-connect-mic-bottom-v2__action {
  position: relative;
  display: flex;
  gap: 29px;
  align-items: center;
  justify-content: center;
  width: 204px;
  margin: 20px auto 0;
}

.c-pc-connect-mic-bottom-v2__hangup {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-width: 123px;
  height: 52px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  background: #e64a4a;
  border-radius: 26px;

  &:hover {
    background: rgba(230, 74, 74, 0.9);
  }
}

.c-pc-connect-mic-bottom-v2__hangup-icon {
  font-size: 24px;
  transform: rotate(135deg);
}

.c-pc-connect-mic-bottom-v2__hangup-timer {
  font-size: 14px;
  line-height: 1;
}
</style>
