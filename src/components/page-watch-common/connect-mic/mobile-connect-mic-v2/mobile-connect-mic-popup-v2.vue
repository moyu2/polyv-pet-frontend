<!-- @file 移动端连麦弹窗 v2 -->
<template>
  <mobile-popup
    class="c-mobile-connect-mic-popup-v2"
    :visible.sync="popupVisibleSync"
    :show-header="false"
    :closable="false"
    :mask-opacity="0"
    :close-on-click-mask="true"
    content-background="transparent"
    :ignore-content-max-height="true"
  >
    <div class="c-mobile-connect-mic-popup-v2__inner">
      <!-- 头像高斯模糊背景 + 黑色蒙层 -->
      <div
        class="c-mobile-connect-mic-popup-v2__bg"
        :style="{ backgroundImage: `url(${avatar})` }"
      ></div>
      <div class="c-mobile-connect-mic-popup-v2__mask"></div>

      <!-- 顶部 -->
      <div class="c-mobile-connect-mic-popup-v2__header">
        <div
          class="c-mobile-connect-mic-popup-v2__collapse"
          @click="closePopup"
        >
          <icon-collapse />
        </div>
        <div class="c-mobile-connect-mic-popup-v2__title">{{ title }}</div>
        <div
          v-if="isInviting && !hideInviteCountdown"
          class="c-mobile-connect-mic-popup-v2__countdown"
        >
          {{ inviteCountdown }} s
        </div>
      </div>

      <!-- 头像 / 预览视频 -->
      <div
        v-if="!isConnectMicing"
        class="c-mobile-connect-mic-popup-v2__avatar-wrap"
        :class="{
          'c-mobile-connect-mic-popup-v2__avatar-wrap-apply':
            connectMicStatus === ConnectMicStatus.Applying,
        }"
      >
        <div
          v-show="!displayVideoMuted"
          ref="previewElRef"
          class="c-mobile-connect-mic-popup-v2__preview"
          :class="{
            'c-mobile-connect-mic-popup-v2__preview--no-mirror': !mirrorEnabled,
          }"
        ></div>
        <img
          v-show="displayVideoMuted"
          class="c-mobile-connect-mic-popup-v2__avatar"
          :src="avatar"
          alt=""
        />
      </div>

      <!-- 控制按钮（语音连麦被邀请时麦克风改到下方拒绝/接受中间，此处不展示） -->
      <div
        v-if="!(isInviting && connectMicType === ConnectMicType.Audio)"
        class="c-mobile-connect-mic-popup-v2__controls"
      >
        <div
          class="c-mobile-connect-mic-popup-v2__control-btn"
          :class="`c-mobile-connect-mic-popup-v2__control-btn--${audioState}`"
          @click="onClickToggleAudio"
        >
          <div class="c-mobile-connect-mic-popup-v2__control-btn__audio">
            <img
              class="c-mobile-connect-mic-popup-v2__control-icon"
              :src="audioIcon"
              alt=""
            />
            <span
              class="c-mobile-connect-mic-popup-v2__control-btn__volume"
              :style="{ height: `${Math.min(audioVolume * 10, 10)}px` }"
            ></span>
          </div>
        </div>
        <div
          v-if="connectMicType !== ConnectMicType.Audio"
          class="c-mobile-connect-mic-popup-v2__control-btn"
          :class="`c-mobile-connect-mic-popup-v2__control-btn--${videoState}`"
          @click="onClickToggleVideo"
        >
          <img
            class="c-mobile-connect-mic-popup-v2__control-icon"
            :src="videoIcon"
            alt=""
          />
        </div>
        <div
          v-if="connectMicType !== ConnectMicType.Audio"
          class="c-mobile-connect-mic-popup-v2__control-btn"
          :class="{
            'c-mobile-connect-mic-popup-v2__control-btn--off': cameraUnavailable,
          }"
          @click="onClickMore"
        >
          <icon-more />
        </div>
      </div>

      <!-- 更多设置弹窗（仅视频连麦） -->
      <mobile-connect-mic-more-popup-v2
        v-if="connectMicType !== ConnectMicType.Audio"
        :visible.sync="morePopupVisible"
      />

      <!-- 关闭连麦二次确认 -->
      <mobile-connect-mic-hangup-confirm-v2
        :visible.sync="hangupConfirmVisible"
        @confirm="onConfirmHangup"
      />

      <!-- 底部按钮 -->
      <div
        class="c-mobile-connect-mic-popup-v2__action"
        :class="{
          'c-mobile-connect-mic-popup-v2__action--invite-audio':
            isInviting && connectMicType === ConnectMicType.Audio,
        }"
      >
        <!-- 邀请上麦：拒绝 /（语音连麦时麦克风）/ 接受 -->
        <template v-if="isInviting">
          <div
            class="c-mobile-connect-mic-popup-v2__round-btn c-mobile-connect-mic-popup-v2__round-btn--reject"
            @click="onClickReject"
          >
            <icon-phone />
          </div>
          <div
            v-if="connectMicType === ConnectMicType.Audio"
            class="c-mobile-connect-mic-popup-v2__control-btn c-mobile-connect-mic-popup-v2__control-btn--invite-row"
            :class="`c-mobile-connect-mic-popup-v2__control-btn--${audioState}`"
            @click="onClickToggleAudio"
          >
            <div class="c-mobile-connect-mic-popup-v2__control-btn__audio">
              <img
                class="c-mobile-connect-mic-popup-v2__control-icon"
                :src="audioIcon"
                alt=""
              />
              <span
                class="c-mobile-connect-mic-popup-v2__control-btn__volume"
                :style="{ height: `${Math.min(audioVolume * 10, 10)}px` }"
              ></span>
            </div>
          </div>
          <div
            class="c-mobile-connect-mic-popup-v2__round-btn c-mobile-connect-mic-popup-v2__round-btn--accept"
            @click="onClickAccept"
          >
            <icon-phone />
          </div>
        </template>

        <!-- 未连麦：申请连麦 -->
        <div
          v-else-if="connectMicStatus === ConnectMicStatus.NotConnect"
          class="c-mobile-connect-mic-popup-v2__action-btn c-mobile-connect-mic-popup-v2__action-btn--apply"
          @click="onClickApply"
        >
          <icon-phone class="c-mobile-connect-mic-popup-v2__action-btn__icon" />
          <div class="c-mobile-connect-mic-popup-v2__action-btn__label">
            {{ $lang('connectMic.applyConnect') }}
          </div>
        </div>

        <!-- 申请中：取消申请 -->
        <div
          v-else-if="connectMicStatus === ConnectMicStatus.Applying"
          class="c-mobile-connect-mic-popup-v2__action-btn c-mobile-connect-mic-popup-v2__action-btn--applying"
          @click="onClickCancelApply"
        >
          <icon-phone class="c-mobile-connect-mic-popup-v2__action-btn__icon" />
          <wave-loading class="c-mobile-connect-mic-popup-v2__action-btn__wave" />
        </div>

        <!-- 连麦中：挂断 -->
        <div
          v-else
          class="c-mobile-connect-mic-popup-v2__action-btn c-mobile-connect-mic-popup-v2__action-btn--hangup"
          @click="onClickHangup"
        >
          <icon-phone class="c-mobile-connect-mic-popup-v2__action-btn__icon" />
          <div class="c-mobile-connect-mic-popup-v2__action-btn__label">
            {{ formattedDuration }}
          </div>
        </div>
      </div>

      <!-- 底部说明 -->
      <div class="c-mobile-connect-mic-popup-v2__notice">
        <icon-warning class="c-mobile-connect-mic-popup-v2__notice-icon" />
        <span>{{
          connectMicType === ConnectMicType.Audio
            ? $lang('connectMic.agreement.audio')
            : $lang('connectMic.agreement')
        }}</span>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { ConnectMicEvents, ConnectMicStatus, ConnectMicType } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useViewerStore } from '@/store/use-viewer-store';

import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { useGlobalInject } from '@/app/use-global-inject';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { PropUtils, updateModelEmit, emitFunc } from '@polyv/vue-components';
import { useConnectMicApply, useConnectMicControl } from '../hooks/use-connect-mic';

import IconPhone from '../common/icon-phone.vue';
import IconCollapse from './icon-collapse.vue';
import IconMore from './icon-more.vue';
import IconWarning from '../common/icon-warning.vue';
import WaveLoading from '../common/wave-loading.vue';

import imgMicOn from '../imgs/ic_mob_mic.png';
import imgMicOff from '../imgs/ic_mob_mic_off.png';
import imgMicFail from '../imgs/ic_mob_mic_fail.png';
import imgCamOn from '../imgs/ic_mob_cam.png';
import imgCamOff from '../imgs/icon_mob_cam_off.png';
import imgCamFail from '../imgs/icon_mob_cam_fail.png';
import MobileConnectMicMorePopupV2 from './mobile-connect-mic-more-popup-v2.vue';
import MobileConnectMicHangupConfirmV2 from './mobile-connect-mic-hangup-confirm-v2.vue';

const props = defineProps({
  visible: PropUtils.bool.def(false),
  /** 已连麦秒数（来自挂件） */
  duration: PropUtils.number.def(0),
});

const emit = defineEmits({
  ...updateModelEmit<'visible', boolean>('visible'),
  apply: emitFunc<void>(),
});

const { toast } = useToastManager();

const { isSmallClassChannel } = storeDefinitionToRefs(useChannelStore);

const {
  supportConnectMic,
  connectMicStatus,
  connectMicType,
  localIsAudioMuted,
  localIsVideoMuted,
  inviteStatus,
  isConnectMicing,
  mirrorEnabled,
  localMicItem,
  facingMode,
  connectMicAutoConnect,
} = storeDefinitionToRefs(useConnectMicStore);

/** 是否处于邀请上麦状态 */
const isInviting = computed(() => unref(inviteStatus) && !unref(isConnectMicing));

/**
 * 当前邀请是否已经被用户/超时处理过（accept / refuse / timeout）
 * 避免 SDK 异步切状态时被 `popupVisibleSync` setter 或 watch 误判为「未处理就被关闭」，重复发拒绝
 */
const inviteHandled = ref(false);

/** 小班课且开启自动连麦时不展示邀请倒计时 */
const hideInviteCountdown = computed(
  () => unref(isSmallClassChannel) && unref(connectMicAutoConnect),
);

const { applyConnectMic, cancelApplyConnectMic, acceptInviteConnectMic, refuseInviteConnectMic } =
  useConnectMicApply();
const { endConnectMic, toggleAudio, toggleVideo } = useConnectMicControl();

const { getWatchCore } = useGlobalInject();
const watchCore = getWatchCore();

const { getQueryParams } = useQueryParams();

/** url 上传入 facingMode=0 时跳过该参数（用于规避部分设备前后置摄像头切换异常） */
function isFacingModeDisabled() {
  const raw = getQueryParams().facingMode;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '0';
}

/** 预览视频的容器节点 */
const previewElRef = ref<HTMLDivElement>();

/** 预览阶段的本地静音状态（来自 SDK getLocalMuteStatus，用于覆盖 store 默认值） */
const previewMuteStatus = ref({ video: false, audio: false });

/** 预览阶段轮询拿到的音量（0~1）；连麦中走 store 的 localMicItem.currentVolume */
const previewVolume = ref(0);
let previewVolumeTimer: number | undefined;

function clearPreviewVolumeTimer() {
  if (previewVolumeTimer) {
    window.clearInterval(previewVolumeTimer);
    previewVolumeTimer = undefined;
  }
  previewVolume.value = 0;
}

/** UI 展示用静音状态：连麦中走 store 实时值，未连麦走 SDK 预设值；语音连麦视为视频常关 */
const displayVideoMuted = computed(() => {
  if (unref(connectMicType) === ConnectMicType.Audio) return true;
  return unref(isConnectMicing) ? unref(localIsVideoMuted) : unref(previewMuteStatus).video;
});
const displayAudioMuted = computed(() =>
  unref(isConnectMicing) ? unref(localIsAudioMuted) : unref(previewMuteStatus).audio,
);

function startPreviewVolumeTimer() {
  clearPreviewVolumeTimer();
  previewVolumeTimer = window.setInterval(() => {
    previewVolume.value = watchCore.connectMic.getPreviewVolume();
  }, 100);
}

/** 麦克风音量 0~1：预览阶段取 getPreviewVolume，连麦中取 localMicItem.currentVolume；静音时归零；>0.1 时抬高 0.2 便于条柱可见，上限 1 */
const audioVolume = computed(() => {
  if (unref(displayAudioMuted)) return 0;
  const raw = unref(isConnectMicing)
    ? unref(localMicItem)?.currentVolume ?? 0
    : unref(previewVolume);
  if (raw > 0.1) return Math.min(raw + 0.4, 1);
  return raw;
});

const popupVisibleSync = computed({
  get: () => props.visible,
  set: (val: boolean) => {
    // 邀请态下关闭面板（点击收起、点击遮罩等）等同于拒绝邀请；已主动处理（accept/refuse/timeout）则跳过
    if (!val && unref(isInviting) && !unref(inviteHandled)) {
      clearInviteCountdownTimer();
      inviteHandled.value = true;
      refuseInviteConnectMic();
    }
    emit('update:visible', val);
  },
});

/** 摄像头不可用：语音连麦 或 摄像头已关闭 */
const cameraUnavailable = computed(
  () => unref(connectMicType) === ConnectMicType.Audio || unref(displayVideoMuted),
);

/** 预览开启失败标记：仅限当前面板会话内有效，再次开启预览时清零 */
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

const { avatar } = storeDefinitionToRefs(useViewerStore);

/** 关闭连麦确认弹窗显示 */
const hangupConfirmVisible = ref(false);

function syncPreviewMuteStatus() {
  previewMuteStatus.value = watchCore.connectMic.getLocalMuteStatus();
}

async function startPreview() {
  if (watchCore.connectMic.isPreviewing()) return;
  const isAudioOnly = unref(connectMicType) === ConnectMicType.Audio;
  const el = unref(previewElRef);
  // 视频连麦才需要 videoEl；语音连麦仅采集音频
  if (!isAudioOnly && !el) return;
  previewFailed.value = false;
  try {
    syncPreviewMuteStatus();
    await watchCore.connectMic.startPreview({
      videoEl: isAudioOnly ? undefined : el,
      video: !isAudioOnly,
      audio: true,
      fit: 'cover',
      ...(isFacingModeDisabled() ? {} : { facingMode: unref(facingMode) }),
    });
    startPreviewVolumeTimer();
  } catch (e) {
    console.warn(e);
    // 预览开启失败（权限拒绝、设备占用等）→ UI 切到 fail 态，仅作用于本面板
    previewFailed.value = true;
    toast.error(
      translate(isAudioOnly ? 'connectMic.tips.allowMic' : 'connectMic.tips.allowDevice'),
    );
  }
}

function stopPreview() {
  clearPreviewVolumeTimer();
  if (!watchCore.connectMic.isPreviewing()) return;
  watchCore.connectMic.stopPreview();
}

/** 面板打开 + 非连麦中 + 挂件可见时开启预览；否则停止预览（如挂件被全屏/横屏隐藏时） */
watch(
  [popupVisibleSync, isConnectMicing],
  ([visible, micing]) => {
    if (visible && !micing) {
      startPreview();
    } else {
      stopPreview();
    }
  },
  { flush: 'post' },
);

function onClickToggleAudio() {
  if (unref(audioState) === 'fail') {
    toast.error(translate('connectMic.tips.allowMic'));
    return;
  }
  if (unref(isConnectMicing)) {
    toggleAudio();
    return;
  }
  // 预览/未推流阶段使用 setLocalMuteStatus 写入预设值
  const next = !unref(previewMuteStatus).audio;
  watchCore.connectMic.setLocalMuteStatus({ audio: next });
  previewMuteStatus.value = { ...unref(previewMuteStatus), audio: next };
}

function onClickToggleVideo() {
  // 语音连麦无摄像头，视频按钮不响应（也不会进入 fail 态）
  if (unref(connectMicType) === ConnectMicType.Audio) return;
  if (unref(videoState) === 'fail') {
    toast.error(translate('connectMic.tips.allowCamera'));
    return;
  }
  if (unref(isConnectMicing)) {
    toggleVideo();
    return;
  }
  const next = !unref(previewMuteStatus).video;
  watchCore.connectMic.setLocalMuteStatus({ video: next });
  previewMuteStatus.value = { ...unref(previewMuteStatus), video: next };
}

/** 标题：根据连麦状态切换 */
const title = computed(() => {
  if (unref(isInviting)) {
    return translate('connectMic.invite.you');
  }
  switch (unref(connectMicStatus)) {
    case ConnectMicStatus.Applying:
      return translate('connectMic.waiting');
    case ConnectMicStatus.Publishing:
    case ConnectMicStatus.Connected:
      return translate('connectMic.connected');
    default:
      return unref(connectMicType) === ConnectMicType.Audio
        ? translate('connectMic.connectTitle.audio')
        : translate('connectMic.connectTitle.video');
  }
});

/** 已连麦时长 mm:ss 文案 */
const formattedDuration = computed(() => {
  const total = props.duration;
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
});

function closePopup() {
  popupVisibleSync.value = false;
}

/** 连麦成功后自动关闭面板 */
watch(
  () => unref(connectMicStatus),
  status => {
    if (status === ConnectMicStatus.Connected) {
      closePopup();
    }
  },
);

function onClickApply() {
  if (!unref(supportConnectMic)) {
    toast.error(translate('connectMic.error.notSupport1'));
    return;
  }
  // 预览阶段已判定设备采集失败，禁止申请并统一提示
  if (unref(previewFailed)) {
    toast.error(translate('connectMic.error.getDeviceFail'));
    return;
  }
  applyConnectMic();
  emit('apply');
}

function onClickCancelApply() {
  cancelApplyConnectMic();
}

function onClickHangup() {
  hangupConfirmVisible.value = true;
}

function onConfirmHangup() {
  endConnectMic();
  closePopup();
}

/** 更多设置弹窗显示 */
const morePopupVisible = ref(false);

function onClickMore() {
  if (unref(cameraUnavailable)) {
    toast.info(translate('connectMic.tips.enableCamera'));
    return;
  }
  morePopupVisible.value = true;
}

/** 邀请上麦剩余秒数（来自 SDK 倒计时事件） */
const inviteCountdown = ref(0);

function onInviteCountDown(data: { remain: number; total: number }) {
  inviteCountdown.value = data.remain;
  // 倒计时归零（超时）：主动发送拒绝邀请并关闭面板
  if (data.remain <= 0 && unref(isInviting) && !unref(inviteHandled)) {
    inviteHandled.value = true;
    refuseInviteConnectMic();
    closePopup();
  }
}

/** 占位：保留命名以维持调用点语义 */
function clearInviteCountdownTimer() {
  // SDK 自管理倒计时，此处仅在状态切换时同步本地展示用值
  inviteCountdown.value = 0;
}

watch(
  isInviting,
  inviting => {
    if (inviting) {
      // 新邀请到来：重置处理状态
      inviteHandled.value = false;
      // 进入邀请态时立即取一次当前剩余值，避免等首个事件
      const { remain } = watchCore.connectMic.getInviteCountDown();
      inviteCountdown.value = remain;
      // 收到邀请时默认关闭麦克风和摄像头
      watchCore.connectMic.setLocalMuteStatus({ video: true, audio: true });
      previewMuteStatus.value = { video: true, audio: true };
    } else {
      clearInviteCountdownTimer();
    }
  },
  { immediate: true },
);

/** SDK 侧邀请超时/失效时（用户未点接受），主动发送拒绝并关闭面板 */
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
      closePopup();
    }
  },
);

onMounted(() => {
  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.InviteCountDown, onInviteCountDown);
});

onBeforeUnmount(() => {
  watchCore.connectMic.eventEmitter.off(ConnectMicEvents.InviteCountDown, onInviteCountDown);
  stopPreview();
});

function onClickAccept() {
  inviteHandled.value = true;
  acceptInviteConnectMic();
  closePopup();
}

function onClickReject() {
  inviteHandled.value = true;
  refuseInviteConnectMic();
  closePopup();
}
</script>

<style lang="scss">
.c-mobile-connect-mic-popup-v2 {
  .c-mobile-popup__content {
    background-color: #ffffff;
    border-radius: 16px 16px 0 0;
  }
}

.c-mobile-connect-mic-popup-v2__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 15px 40px;
  overflow: hidden;
  background-color: #888;
  border-radius: 16px 16px 0 0;
}

.c-mobile-connect-mic-popup-v2__bg {
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

.c-mobile-connect-mic-popup-v2__mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
}

.c-mobile-connect-mic-popup-v2__header,
.c-mobile-connect-mic-popup-v2__avatar-wrap,
.c-mobile-connect-mic-popup-v2__controls,
.c-mobile-connect-mic-popup-v2__action,
.c-mobile-connect-mic-popup-v2__notice {
  position: relative;
  z-index: 2;
}

.c-mobile-connect-mic-popup-v2__notice {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
}

.c-mobile-connect-mic-popup-v2__notice-icon {
  flex-shrink: 0;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.c-mobile-connect-mic-popup-v2__header {
  position: relative;
  line-height: 52px;
  text-align: center;
}

.c-mobile-connect-mic-popup-v2__collapse {
  position: absolute;
  top: 12px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
}

.c-mobile-connect-mic-popup-v2__title {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.c-mobile-connect-mic-popup-v2__countdown {
  position: absolute;
  top: 0;
  right: 0;
  height: 52px;
  font-size: 13px;
  line-height: 52px;
  color: rgba(255, 255, 255, 0.8);
}

.c-mobile-connect-mic-popup-v2__avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;

  > * {
    position: relative;
    z-index: 1;
  }
}

.c-mobile-connect-mic-popup-v2__avatar-wrap-apply {
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
    animation: c-mobile-connect-mic-popup-v2-avatar-ripple 1.5s ease-out infinite;
  }

  &::after {
    animation-delay: 0.5s;
  }
}

@keyframes c-mobile-connect-mic-popup-v2-avatar-ripple {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.6);
  }
}

.c-mobile-connect-mic-popup-v2__avatar {
  width: 104px;
  height: 104px;
  object-fit: cover;
  background-color: #eee;
  border-radius: 50%;
}

.c-mobile-connect-mic-popup-v2__preview {
  width: 104px;
  height: 104px;
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

.c-mobile-connect-mic-popup-v2__preview--no-mirror {
  video {
    transform: scaleX(-1) !important;
  }
}

.c-mobile-connect-mic-popup-v2__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 36px;
}

.c-mobile-connect-mic-popup-v2__control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 18px;
  font-size: 22px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
}

.c-mobile-connect-mic-popup-v2__control-btn--off {
  background: rgba(0, 0, 0, 0.35);

  .c-mobile-connect-mic-popup-v2__control-icon {
    opacity: 0.3;
  }
}

.c-mobile-connect-mic-popup-v2__control-icon {
  width: auto;
  height: 24px;
  pointer-events: none;
  user-select: none;
}

.c-mobile-connect-mic-popup-v2__control-btn__audio {
  position: relative;
  font-size: 0;
}

.c-mobile-connect-mic-popup-v2__control-btn__volume {
  position: absolute;
  bottom: 11px;
  left: 50%;
  width: 4px;
  height: 10px;
  margin-left: -2px;
  background: #0dc565;
  border-radius: 2px;
}

.c-mobile-connect-mic-popup-v2__action {
  display: flex;
  gap: 136px;
  align-items: center;
  justify-content: center;
  margin-top: 36px;
}

.c-mobile-connect-mic-popup-v2__action--invite-audio {
  gap: 18px;
  /* 原布局为 controls(上间距36 + 按钮64 + 下间距36)，隐藏 controls 后对齐整体留白 */
  margin-top: 136px;
}

.c-mobile-connect-mic-popup-v2__control-btn--invite-row {
  flex-shrink: 0;
}

.c-mobile-connect-mic-popup-v2__round-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 24px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  border-radius: 50%;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.12);
}

.c-mobile-connect-mic-popup-v2__round-btn--reject {
  background: #e64a4a;

  svg {
    transform: rotate(135deg);
  }
}

.c-mobile-connect-mic-popup-v2__round-btn--accept {
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
    animation: c-mobile-connect-mic-popup-v2-accept-pulse 1.4s ease-in-out infinite;
  }
}

@keyframes c-mobile-connect-mic-popup-v2-accept-pulse {
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

.c-mobile-connect-mic-popup-v2__action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 104px;
  height: 64px;
  padding: 0 16px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  border-radius: 32px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.12);
}

.c-mobile-connect-mic-popup-v2__action-btn--apply {
  background: #0dc565;
}

.c-mobile-connect-mic-popup-v2__action-btn--applying,
.c-mobile-connect-mic-popup-v2__action-btn--hangup {
  background: #e64a4a;

  .c-mobile-connect-mic-popup-v2__action-btn__icon {
    transform: rotate(135deg);
  }
}

.c-mobile-connect-mic-popup-v2__action-btn__icon {
  font-size: 24px;
}

.c-mobile-connect-mic-popup-v2__action-btn__label {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1;
  color: $--color-white;
  white-space: nowrap;
}

.c-mobile-connect-mic-popup-v2__action-btn__wave {
  margin-top: 8px;
  color: $--color-white;
}
</style>
