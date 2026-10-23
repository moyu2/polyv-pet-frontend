<!-- @file PC 端连麦申请/邀请面板 v2（未连麦态：申请/申请中/被邀请） -->
<template>
  <div
    class="c-pc-connect-mic-preview-v2"
    :class="{ 'c-pc-connect-mic-preview-v2--audio': connectMicType === ConnectMicType.Audio }"
  >
    <!-- 头像高斯模糊背景 + 黑色蒙层 -->
    <div
      class="c-pc-connect-mic-preview-v2__bg"
      :style="{ backgroundImage: `url(${avatar})` }"
    ></div>
    <div class="c-pc-connect-mic-preview-v2__mask"></div>

    <!-- 头像 / 预览视频 + 标题（位于头像下方） -->
    <div class="c-pc-connect-mic-preview-v2__main">
      <div
        class="c-pc-connect-mic-preview-v2__avatar-wrap"
        :class="{
          'c-pc-connect-mic-preview-v2__avatar-wrap--apply':
            connectMicStatus === ConnectMicStatus.Applying,
        }"
      >
        <div
          v-show="!displayVideoMuted"
          ref="previewElRef"
          class="c-pc-connect-mic-preview-v2__preview"
          :class="{
            'c-pc-connect-mic-preview-v2__preview--no-mirror': !mirrorEnabled,
          }"
        ></div>
        <img
          v-show="displayVideoMuted"
          class="c-pc-connect-mic-preview-v2__avatar"
          :src="avatar"
          alt=""
        />
      </div>

      <div class="c-pc-connect-mic-preview-v2__title">{{ title }}</div>
      <div
        v-if="isInviting && !hideInviteCountdown"
        class="c-pc-connect-mic-preview-v2__countdown"
      >
        {{ inviteCountdown }} s
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="c-pc-connect-mic-preview-v2__controls">
      <div
        class="c-pc-connect-mic-preview-v2__control-btn"
        :class="`c-pc-connect-mic-preview-v2__control-btn--${audioState}`"
        @click="onClickToggleAudio"
      >
        <div class="c-pc-connect-mic-preview-v2__control-btn__audio">
          <img
            class="c-pc-connect-mic-preview-v2__control-icon"
            :src="audioIcon"
            alt=""
          />
          <span
            class="c-pc-connect-mic-preview-v2__control-btn__volume"
            :style="{ height: `${Math.min(audioVolume * 10, 10)}px` }"
          ></span>
        </div>
      </div>
      <div
        v-if="connectMicType !== ConnectMicType.Audio"
        class="c-pc-connect-mic-preview-v2__control-btn"
        :class="`c-pc-connect-mic-preview-v2__control-btn--${videoState}`"
        @click="onClickToggleVideo"
      >
        <img
          class="c-pc-connect-mic-preview-v2__control-icon"
          :src="videoIcon"
          alt=""
        />
      </div>
      <div
        class="c-pc-connect-mic-preview-v2__control-btn"
        @click="onClickDeviceSetting"
      >
        <img
          class="c-pc-connect-mic-preview-v2__control-icon"
          :src="imgSetting"
          alt=""
        />
      </div>
    </div>

    <!-- 底部操作区 -->
    <div
      class="c-pc-connect-mic-preview-v2__action"
      :class="{ 'c-pc-connect-mic-preview-v2__action--split': isInviting }"
    >
      <!-- 邀请上麦：拒绝 / 接受 -->
      <template v-if="isInviting">
        <div
          class="c-pc-connect-mic-preview-v2__round-btn c-pc-connect-mic-preview-v2__round-btn--reject"
          @click="onClickReject"
        >
          <icon-phone />
        </div>
        <div
          class="c-pc-connect-mic-preview-v2__round-btn c-pc-connect-mic-preview-v2__round-btn--accept"
          @click="onClickAccept"
        >
          <icon-phone />
        </div>
      </template>

      <!-- 未连麦：申请连麦 -->
      <div
        v-else-if="connectMicStatus === ConnectMicStatus.NotConnect"
        class="c-pc-connect-mic-preview-v2__action-btn c-pc-connect-mic-preview-v2__action-btn--apply"
        @click="onClickApply"
      >
        <icon-phone class="c-pc-connect-mic-preview-v2__action-btn__icon" />
        <div class="c-pc-connect-mic-preview-v2__action-btn__label">
          {{ $lang('connectMic.applyConnect') }}
        </div>
      </div>

      <!-- 申请中：取消申请 -->
      <div
        v-else-if="connectMicStatus === ConnectMicStatus.Applying"
        class="c-pc-connect-mic-preview-v2__action-btn c-pc-connect-mic-preview-v2__action-btn--applying"
        @click="onClickCancelApply"
      >
        <icon-phone class="c-pc-connect-mic-preview-v2__action-btn__icon" />
        <wave-loading class="c-pc-connect-mic-preview-v2__action-btn__wave" />
      </div>
    </div>

    <!-- 底部说明 -->
    <div class="c-pc-connect-mic-preview-v2__notice">
      <icon-warning class="c-pc-connect-mic-preview-v2__notice-icon" />
      <span>{{
        connectMicType === ConnectMicType.Audio
          ? $lang('connectMic.agreement.audio')
          : $lang('connectMic.agreement')
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConnectMicEvents, ConnectMicStatus, ConnectMicType } from '@polyv/live-watch-sdk';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useViewerStore } from '@/store/use-viewer-store';

import { translate } from '@/assets/lang';
import { TAB_NAME_CONNECT_MIC } from '@/assets/constants/tab-name';
import { appEvents } from '@/app/app-events';
import { useToastManager } from '@/hooks/components/use-toast';
import { useGlobalInject } from '@/app/use-global-inject';
import { useConnectMicApply } from '../hooks/use-connect-mic';

import IconPhone from '../common/icon-phone.vue';
import IconWarning from '../common/icon-warning.vue';
import WaveLoading from '../common/wave-loading.vue';

import imgMicOn from '../imgs/ic_mob_mic.png';
import imgMicOff from '../imgs/ic_mob_mic_off.png';
import imgMicFail from '../imgs/ic_mob_mic_fail.png';
import imgCamOn from '../imgs/ic_mob_cam.png';
import imgCamOff from '../imgs/icon_mob_cam_off.png';
import imgCamFail from '../imgs/icon_mob_cam_fail.png';
import imgSetting from '../imgs/setting.png';

const { toast } = useToastManager();

const { isSmallClassChannel } = storeDefinitionToRefs(useChannelStore);

const { avatar } = storeDefinitionToRefs(useViewerStore);

const { pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

const {
  supportConnectMic,
  connectMicStatus,
  connectMicType,
  inviteStatus,
  isConnectMicing,
  mirrorEnabled,
  connectMicAutoConnect,
} = storeDefinitionToRefs(useConnectMicStore);

const { applyConnectMic, cancelApplyConnectMic, acceptInviteConnectMic, refuseInviteConnectMic } =
  useConnectMicApply();

const { getWatchCore, getEmitter } = useGlobalInject();
const watchCore = getWatchCore();

/** 是否处于邀请上麦状态 */
const isInviting = computed(() => unref(inviteStatus) && !unref(isConnectMicing));

/** 连麦面板（连麦 tab）是否处于激活态 */
const panelActive = computed(() => unref(pcAsideTabCurrentName) === TAB_NAME_CONNECT_MIC);

/**
 * 当前邀请是否已经被用户/超时处理过（accept / refuse / timeout）
 * 避免重复发送拒绝
 */
const inviteHandled = ref(false);

/** 小班课且开启自动连麦时不展示邀请倒计时 */
const hideInviteCountdown = computed(
  () => unref(isSmallClassChannel) && unref(connectMicAutoConnect),
);

/** 预览视频的容器节点 */
const previewElRef = ref<HTMLDivElement>();

/** 预览阶段的本地静音状态（默认摄像头与麦克风均关闭，不访问设备） */
const previewMuteStatus = ref({ video: true, audio: true });

/** 预览阶段轮询拿到的音量（0~1） */
const previewVolume = ref(0);
let previewVolumeTimer: number | undefined;

function clearPreviewVolumeTimer() {
  if (previewVolumeTimer) {
    window.clearInterval(previewVolumeTimer);
    previewVolumeTimer = undefined;
  }
  previewVolume.value = 0;
}

/** UI 展示用静音状态：未连麦走 SDK 预设值；语音连麦视为视频常关 */
const displayVideoMuted = computed(() => {
  if (unref(connectMicType) === ConnectMicType.Audio) return true;
  return unref(previewMuteStatus).video;
});
const displayAudioMuted = computed(() => unref(previewMuteStatus).audio);

function startPreviewVolumeTimer() {
  clearPreviewVolumeTimer();
  previewVolumeTimer = window.setInterval(() => {
    previewVolume.value = watchCore.connectMic.getPreviewVolume();
  }, 100);
}

/** 麦克风音量 0~1：取 getPreviewVolume；静音时归零；>0.1 时抬高便于条柱可见 */
const audioVolume = computed(() => {
  if (unref(displayAudioMuted)) return 0;
  const raw = unref(previewVolume);
  if (raw > 0.1) return Math.min(raw + 0.4, 1);
  return raw;
});

/** 预览开启失败标记 */
const previewFailed = ref(false);

/** 麦克风/摄像头三态：开启 on / 关闭 off / 异常 fail */
const audioState = computed<'on' | 'off' | 'fail'>(() => {
  if (unref(previewFailed)) return 'fail';
  return unref(displayAudioMuted) ? 'off' : 'on';
});
const videoState = computed<'on' | 'off' | 'fail'>(() => {
  if (unref(connectMicType) === ConnectMicType.Audio) return 'off';
  if (unref(previewFailed)) return 'fail';
  return unref(displayVideoMuted) ? 'off' : 'on';
});

const audioIcon = computed(() => {
  switch (unref(audioState)) {
    case 'fail':
      return imgMicFail;
    case 'off':
      return imgMicOff;
    default:
      return imgMicOn;
  }
});
const videoIcon = computed(() => {
  switch (unref(videoState)) {
    case 'fail':
      return imgCamFail;
    case 'off':
      return imgCamOff;
    default:
      return imgCamOn;
  }
});

function syncPreviewMuteStatus() {
  previewMuteStatus.value = watchCore.connectMic.getLocalMuteStatus();
}

/**
 * 重置为默认静音状态：摄像头与麦克风均关闭。
 * 用于讲师开启连麦、连麦 tab 刚出现时，默认不访问任何设备。
 */
function resetDefaultMute() {
  const def = { video: true, audio: true };
  watchCore.connectMic.setLocalMuteStatus(def);
  previewMuteStatus.value = def;
}

/** 当前预览实际采集的设备集合（startPreview 入参） */
const previewCapture = ref({ video: false, audio: false });

/** 防止并发重复开启预览（设备按钮点击与 LOCAL_MUTE_STATUS_CHANGE 可能同帧各触发一次） */
let previewStarting = false;

/** 以指定设备集合（重新）开启预览 */
async function startPreviewWith(videoOn: boolean, audioOn: boolean) {
  if (previewStarting) return;
  previewStarting = true;
  try {
    previewFailed.value = false;

    if (watchCore.connectMic.isPreviewing()) {
      watchCore.connectMic.stopPreview();
    }
    clearPreviewVolumeTimer();
    previewCapture.value = { video: false, audio: false };

    // 等待 v-show 翻转完成，确保预览容器已可见且有尺寸后再挂载视频，避免黑屏
    await nextTick();

    const el = unref(previewElRef);
    if (videoOn && !el) return;

    await watchCore.connectMic.startPreview({
      videoEl: videoOn ? el : undefined,
      video: videoOn,
      audio: audioOn,
      fit: 'cover',
    });
    previewCapture.value = { video: videoOn, audio: audioOn };
    if (audioOn) startPreviewVolumeTimer();
  } catch (e) {
    console.warn(e);
    previewFailed.value = true;
    toast.error(translate(videoOn ? 'connectMic.tips.allowDevice' : 'connectMic.tips.allowMic'));
  } finally {
    previewStarting = false;
  }
}

function stopPreview() {
  clearPreviewVolumeTimer();
  previewCapture.value = { video: false, audio: false };
  if (!watchCore.connectMic.isPreviewing()) return;
  watchCore.connectMic.stopPreview();
}

/**
 * 按当前麦克风/摄像头开关刷新预览：均关闭则释放设备，否则采集已开启的设备。
 * 用于 tab 激活、被邀请等需要整体重置的场景。
 */
function refreshPreview() {
  const isAudioOnly = unref(connectMicType) === ConnectMicType.Audio;
  const audioOn = !unref(previewMuteStatus).audio;
  const videoOn = !isAudioOnly && !unref(previewMuteStatus).video;
  if (!audioOn && !videoOn) {
    stopPreview();
    return;
  }
  startPreviewWith(videoOn, audioOn);
}

/**
 * 是否已应用过默认静音。
 * 仅在本组件生命周期内首次进入连麦 tab 时默认关闭设备；
 * 之后切到其他 tab（如聊天/提问）再切回时保留用户上次的设备开关状态。
 * 连麦结束后本组件会被重新挂载，该标记自然复位，新会话仍默认关闭设备。
 */
const defaultMuteApplied = ref(false);

/**
 * 连麦 tab 激活且未连麦时：
 * - 普通申请态首次进入默认关闭摄像头与麦克风、不访问设备，待用户点击设备按钮后才开启预览；
 *   再次进入（切 tab 返回）则沿用 SDK 记录的上次开关状态；
 * - 其余态（被邀请、申请中等）沿用 SDK 记录值。
 * tab 失活或已连麦时停止预览、释放设备。
 */
watch(
  [panelActive, isConnectMicing],
  ([active, micing]) => {
    if (active && !micing) {
      if (
        unref(connectMicStatus) === ConnectMicStatus.NotConnect &&
        !unref(isInviting) &&
        !unref(defaultMuteApplied)
      ) {
        defaultMuteApplied.value = true;
        resetDefaultMute();
      } else {
        syncPreviewMuteStatus();
      }
      refreshPreview();
    } else {
      stopPreview();
    }
  },
  { immediate: true, flush: 'post' },
);

function onClickToggleAudio() {
  const next = !unref(previewMuteStatus).audio;
  watchCore.connectMic.setLocalMuteStatus({ audio: next });
  previewMuteStatus.value = { ...unref(previewMuteStatus), audio: next };

  const audioOn = !next;
  const videoOn = unref(connectMicType) !== ConnectMicType.Audio && !unref(previewMuteStatus).video;

  // 两者都关闭：释放设备
  if (!audioOn && !videoOn) {
    stopPreview();
    return;
  }
  // 开启麦克风且当前未采集音频：重启预览纳入音频
  if (audioOn && !unref(previewCapture).audio) {
    startPreviewWith(videoOn, true);
  }
  // 关闭麦克风但摄像头仍开启：仅静音，不重启预览（沿用旧逻辑）
}

function onClickToggleVideo() {
  if (unref(connectMicType) === ConnectMicType.Audio) return;
  const next = !unref(previewMuteStatus).video;
  watchCore.connectMic.setLocalMuteStatus({ video: next });
  previewMuteStatus.value = { ...unref(previewMuteStatus), video: next };

  const videoOn = !next;
  const audioOn = !unref(previewMuteStatus).audio;

  // 两者都关闭：释放设备
  if (!audioOn && !videoOn) {
    stopPreview();
    return;
  }
  // 开启摄像头且当前未采集视频：重启预览纳入视频
  if (videoOn && !unref(previewCapture).video) {
    startPreviewWith(true, audioOn);
  }
  // 关闭摄像头但麦克风仍开启：仅静音，不重启预览（沿用旧逻辑）
}

function onClickDeviceSetting() {
  getEmitter().emit(appEvents.connectMic.TriggerOpenDeviceSetting);
}

/** 标题：根据连麦状态切换 */
const title = computed(() => {
  if (unref(isInviting)) {
    return translate('connectMic.invite.you');
  }
  if (unref(connectMicStatus) === ConnectMicStatus.Applying) {
    return translate('connectMic.waiting');
  }
  return unref(connectMicType) === ConnectMicType.Audio
    ? translate('connectMic.connectTitle.audio')
    : translate('connectMic.connectTitle.video');
});

function onClickApply() {
  if (!unref(supportConnectMic)) {
    toast.error(translate('connectMic.error.notSupport1'));
    return;
  }
  if (unref(previewFailed)) {
    toast.error(translate('connectMic.error.getDeviceFail'));
    return;
  }
  applyConnectMic();
}

function onClickCancelApply() {
  cancelApplyConnectMic();
}

/** 邀请上麦剩余秒数 */
const inviteCountdown = ref(0);

function onInviteCountDown(data: { remain: number; total: number }) {
  inviteCountdown.value = data.remain;
  if (data.remain <= 0 && unref(isInviting) && !unref(inviteHandled)) {
    inviteHandled.value = true;
    refuseInviteConnectMic();
  }
}

watch(
  isInviting,
  inviting => {
    if (inviting) {
      inviteHandled.value = false;
      const { remain } = watchCore.connectMic.getInviteCountDown();
      inviteCountdown.value = remain;
      // 已打开设备开始预览时，保留用户当前的麦克风/摄像头状态，不做修改；
      // 仅在未开启任何设备时，默认关闭麦克风和摄像头并释放可能残留的预览设备
      if (!watchCore.connectMic.isPreviewing()) {
        watchCore.connectMic.setLocalMuteStatus({ video: true, audio: true });
        previewMuteStatus.value = { video: true, audio: true };
        refreshPreview();
      }
    } else {
      inviteCountdown.value = 0;
    }
  },
  { immediate: true },
);

/** SDK 侧邀请超时/失效时，主动发送拒绝 */
watch(
  () => unref(inviteStatus),
  (curr, prev) => {
    if (
      prev &&
      !curr &&
      unref(connectMicStatus) === ConnectMicStatus.NotConnect &&
      !unref(inviteHandled)
    ) {
      inviteHandled.value = true;
      refuseInviteConnectMic();
    }
  },
);

/**
 * 预览阶段本地音视频开关变更时（设备检测面板修改、或本组件调用 setLocalMuteStatus 触发），
 * 仅同步按钮显示状态。注意不要在此修改 previewCapture —— 它只反映本组件实际 startPreview 的采集集合，
 * 否则会让设备按钮的"是否需要开启预览"判断失效，导致点击后不执行 startPreview。
 */
function onLocalMuteStatusChange(data: { video: boolean; audio: boolean }) {
  previewMuteStatus.value = { video: data.video, audio: data.audio };

  // 设备状态已开启但预览未开启（如在设备检测面板中开启了设备）时，需要开启预览
  const audioOn = !data.audio;
  const videoOn = unref(connectMicType) !== ConnectMicType.Audio && !data.video;
  if ((audioOn || videoOn) && !watchCore.connectMic.isPreviewing()) {
    startPreviewWith(videoOn, audioOn);
  }
}

onMounted(() => {
  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.InviteCountDown, onInviteCountDown);
  watchCore.connectMic.eventEmitter.on(
    ConnectMicEvents.LocalMuteStatusChange,
    onLocalMuteStatusChange,
  );
});

onBeforeUnmount(() => {
  watchCore.connectMic.eventEmitter.off(ConnectMicEvents.InviteCountDown, onInviteCountDown);
  watchCore.connectMic.eventEmitter.off(
    ConnectMicEvents.LocalMuteStatusChange,
    onLocalMuteStatusChange,
  );
  stopPreview();
});

function onClickAccept() {
  inviteHandled.value = true;
  acceptInviteConnectMic();
}

function onClickReject() {
  inviteHandled.value = true;
  // 已打开设备开始预览时，拒绝邀请后保留拒绝前的麦克风/摄像头状态，避免被重置
  const wasPreviewing = watchCore.connectMic.isPreviewing();
  const keep = { ...unref(previewMuteStatus) };
  refuseInviteConnectMic();
  if (wasPreviewing) {
    watchCore.connectMic.setLocalMuteStatus(keep);
    previewMuteStatus.value = keep;
  }
}
</script>

<style lang="scss">
.c-pc-connect-mic-preview-v2 {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 0 24px;
  overflow: hidden;
  background-color: #888;
}

.c-pc-connect-mic-preview-v2__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: #000;
  filter: blur(50px);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 750px 750px;
}

.c-pc-connect-mic-preview-v2__mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
}

.c-pc-connect-mic-preview-v2__main,
.c-pc-connect-mic-preview-v2__controls,
.c-pc-connect-mic-preview-v2__action,
.c-pc-connect-mic-preview-v2__notice {
  position: relative;
  z-index: 2;
}

.c-pc-connect-mic-preview-v2__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.c-pc-connect-mic-preview-v2__title {
  margin-top: 40px;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.c-pc-connect-mic-preview-v2__countdown {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.c-pc-connect-mic-preview-v2__avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    position: relative;
    z-index: 1;
  }
}

.c-pc-connect-mic-preview-v2__avatar-wrap--apply {
  &::before,
  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    width: 100px;
    height: 100px;
    margin-top: -52px;
    margin-left: -52px;
    pointer-events: none;
    content: '';
    border: 2px solid #0dc565;
    border-radius: 50%;
    animation: c-pc-connect-mic-preview-v2-avatar-ripple 1.5s ease-out infinite;
  }

  &::after {
    animation-delay: 0.5s;
  }
}

@keyframes c-pc-connect-mic-preview-v2-avatar-ripple {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.6);
  }
}

.c-pc-connect-mic-preview-v2__avatar {
  width: 96px;
  height: 96px;
  object-fit: cover;
  background-color: #eee;
  border-radius: 50%;
}

.c-pc-connect-mic-preview-v2__preview {
  width: 96px;
  height: 96px;
  overflow: hidden;
  background-color: #000;
  border-radius: 50%;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: none !important;
  }
}

.c-pc-connect-mic-preview-v2__preview--no-mirror {
  video {
    transform: scaleX(-1) !important;
  }
}

.c-pc-connect-mic-preview-v2__controls {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  width: 204px;
  margin: 24px auto 0;
}

/* 音频连麦时无摄像头按钮，控制行与操作行收窄 */
.c-pc-connect-mic-preview-v2--audio {
  .c-pc-connect-mic-preview-v2__controls,
  .c-pc-connect-mic-preview-v2__action {
    width: 148px;
  }
}

.c-pc-connect-mic-preview-v2__control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 22px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;

  &:hover {
    background: rgba(0, 0, 0, 0.65);
  }
}

.c-pc-connect-mic-preview-v2__control-btn--off {
  background: rgba(0, 0, 0, 0.35);

  .c-pc-connect-mic-preview-v2__control-icon {
    opacity: 0.3;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.45);
  }
}

.c-pc-connect-mic-preview-v2__control-icon {
  width: auto;
  height: 22px;
  pointer-events: none;
  user-select: none;
}

.c-pc-connect-mic-preview-v2__control-btn__audio {
  position: relative;
  font-size: 0;
}

.c-pc-connect-mic-preview-v2__control-btn__volume {
  position: absolute;
  bottom: 10px;
  left: 50%;
  width: 4px;
  height: 10px;
  margin-left: -2px;
  background: #0dc565;
  border-radius: 2px;
}

.c-pc-connect-mic-preview-v2__action {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 204px;
  margin: 24px auto 0;
}

/* 多个按钮（邀请态：拒绝 / 接受）时两端对齐 */
.c-pc-connect-mic-preview-v2__action--split {
  justify-content: space-between;
}

.c-pc-connect-mic-preview-v2__round-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 24px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  border-radius: 50%;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.12);
}

.c-pc-connect-mic-preview-v2__round-btn--reject {
  background: #e64a4a;

  svg {
    transform: rotate(135deg);
  }
}

.c-pc-connect-mic-preview-v2__round-btn--accept {
  position: relative;
  background: transparent;
  box-shadow: none;

  > svg {
    position: relative;
    z-index: 1;
  }

  &::before {
    position: absolute;
    inset: 0;
    content: '';
    background: #0eb05c;
    border-radius: 50%;
    box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.12);
    animation: c-pc-connect-mic-preview-v2-accept-pulse 1.4s ease-in-out infinite;
  }
}

@keyframes c-pc-connect-mic-preview-v2-accept-pulse {
  0%,
  100% {
    background: #0eb05c;
    transform: scale(1);
  }
  50% {
    background: #10eb79;
    transform: scale(1.2);
  }
}

.c-pc-connect-mic-preview-v2__action-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 123px;
  height: 52px;
  padding: 0 16px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  border-radius: 28px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.12);
}

.c-pc-connect-mic-preview-v2__action-btn--apply {
  background: #0dc565;

  &:hover {
    background: rgba(14, 176, 92, 0.95);
  }
}

.c-pc-connect-mic-preview-v2__action-btn--applying {
  background: #e64a4a;

  &:hover {
    background: rgba(230, 74, 74, 0.9);
  }
}

.c-pc-connect-mic-preview-v2__action-btn__icon {
  font-size: 22px;
}

.c-pc-connect-mic-preview-v2__action-btn__label {
  margin-left: 8px;
  font-size: 14px;
  line-height: 1;
  color: $--color-white;
  white-space: nowrap;
}

.c-pc-connect-mic-preview-v2__action-btn__wave {
  margin-left: 12px;
  color: $--color-white;
}

.c-pc-connect-mic-preview-v2__notice {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.c-pc-connect-mic-preview-v2__notice-icon {
  flex-shrink: 0;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}
</style>
