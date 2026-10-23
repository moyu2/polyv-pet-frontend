<!-- @file 移动端连麦挂件 -->
<template>
  <div
    ref="wrapRef"
    class="c-mobile-connect-mic-pendant"
    :style="{
      width: `${pendantWidth}px`,
      top: `${top}px`,
    }"
  >
    <div
      ref="contentRef"
      class="c-mobile-connect-mic-pendant__content"
    >
      <!-- 申请连麦 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.NotConnect"
        class="c-mobile-connect-mic-pendant__button c-mobile-connect-mic-pendant__button--apply"
        @click="openApplyTips"
      ></div>
      <div
        v-if="connectMicStatus === ConnectMicStatus.NotConnect"
        class="c-mobile-connect-mic-pendant__tips"
        @click="openApplyTips"
      >
        {{
          connectMicType === ConnectMicType.Video
            ? $lang('connectMic.applyConnect.videoApply')
            : $lang('connectMic.applyConnect.audioApply')
        }}
      </div>

      <!-- 取消申请 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Applying"
        class="c-mobile-connect-mic-pendant__button c-mobile-connect-mic-pendant__button--cut"
        @click="cancelApplyConnectMic"
      ></div>

      <div
        v-if="connectMicStatus === ConnectMicStatus.Applying"
        class="c-mobile-connect-mic-pendant__tips"
        @click="cancelApplyConnectMic"
      >
        {{ cancelText }}
      </div>

      <!-- 展开挂件 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Connected && !pendantOpened"
        class="c-mobile-connect-mic-pendant__button c-mobile-connect-mic-pendant__button--open"
        @click="openPendant"
      ></div>

      <!-- 挂断 -->
      <div
        v-if="
          connectMicStatus === ConnectMicStatus.Publishing ||
          connectMicStatus === ConnectMicStatus.Connected
        "
        class="c-mobile-connect-mic-pendant__button c-mobile-connect-mic-pendant__button--cut"
        @click="endConnectMic"
      ></div>

      <div
        v-if="connectMicStatus === ConnectMicStatus.Publishing"
        class="c-mobile-connect-mic-pendant__tips"
        @click="endConnectMic"
      >
        {{ cancelText }}
      </div>

      <!-- 摄像头开关 -->
      <div
        v-if="
          connectMicStatus === ConnectMicStatus.Connected &&
          localConnectMicType === ConnectMicType.Video
        "
        class="c-mobile-connect-mic-pendant__button"
        :class="{
          'c-mobile-connect-mic-pendant__button--video-normal': !localIsVideoMuted,
          'c-mobile-connect-mic-pendant__button--video-muted': localIsVideoMuted,
        }"
        @click="toggleVideo"
      ></div>

      <!-- 切换前后摄像头 -->
      <div
        v-if="
          supportFacingMode &&
          connectMicStatus === ConnectMicStatus.Connected &&
          localConnectMicType === ConnectMicType.Video
        "
        class="c-mobile-connect-mic-pendant__button c-mobile-connect-mic-pendant__button--facing-mode"
        :class="{
          'c-mobile-connect-mic-pendant__button--facing-disabled': localIsVideoMuted,
        }"
        @click="toggleFacingMode"
      ></div>

      <!-- 镜像开关 -->
      <div
        v-if="
          connectMicStatus === ConnectMicStatus.Connected &&
          localConnectMicType === ConnectMicType.Video
        "
        class="c-mobile-connect-mic-pendant__button"
        :class="{
          'c-mobile-connect-mic-pendant__button--mirror-enabled':
            mirrorEnabled && !localIsVideoMuted,
          'c-mobile-connect-mic-pendant__button--mirror-disabled':
            !mirrorEnabled && !localIsVideoMuted,
          'c-mobile-connect-mic-pendant__button--mirror-video-disabled': localIsVideoMuted,
        }"
        @click="() => toggleMirror()"
      ></div>

      <!-- 麦克风开关 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Connected"
        class="c-mobile-connect-mic-pendant__button"
        :class="{
          'c-mobile-connect-mic-pendant__button--audio-normal': !localIsAudioMuted,
          'c-mobile-connect-mic-pendant__button--audio-muted': localIsAudioMuted,
        }"
        @click="toggleAudio"
      ></div>

      <!-- 隐藏 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Connected"
        class="c-mobile-connect-mic-pendant__hide"
        @click="closePendant"
      ></div>
    </div>

    <!-- 申请连麦提示弹层 -->
    <mobile-popup
      class="c-mobile-connect-mic-pendant__apply-tips"
      :visible.sync="applyTipsVisible"
      :title="
        connectMicType === ConnectMicType.Video
          ? $lang('connectMic.connectTitle.video')
          : $lang('connectMic.connectTitle.audio')
      "
    >
      <div class="c-mobile-connect-mic-pendant__apply-tips__content">
        <mobile-icon-video-call
          v-if="connectMicType === ConnectMicType.Video"
          class="c-mobile-connect-mic-pendant__apply-tips__icon"
        />
        <mobile-icon-voice-call
          v-else
          class="c-mobile-connect-mic-pendant__apply-tips__icon"
        />

        <div class="c-mobile-connect-mic-pendant__apply-tips__text">
          <span>{{
            connectMicType === ConnectMicType.Video
              ? $lang('connectMic.agreement')
              : $lang('connectMic.agreement.audio')
          }}</span>
          <span>{{ $lang('connectMic.agreement.audio.low') }}</span>
        </div>

        <normal-button
          :text="$lang('connectMic.applyConnect')"
          block
          :size="ButtonSize.Medium"
          @click="onClickApplyConfirm"
        />
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { MobileIconVideoCall, MobileIconVoiceCall } from '@/components/component-icons/mobile/map';

import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { ConnectMicStatus, ConnectMicType } from '@polyv/live-watch-sdk';
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';

import { translate } from '@/assets/lang';
import { useAsideDrag } from '@/hooks/behaviors/use-aside-drag';
import { useToastManager } from '@/hooks/components/use-toast';
import { useLayoutStore } from '@/store/use-layout-store';
import { useConnectMic, useConnectMicApply, useConnectMicControl } from '../hooks/use-connect-mic';
import { useLangStore } from '@/store/use-lang-store';
import { useGlobalInject } from '@/app/use-global-inject';

const { getAppBodyElement } = useGlobalInject();

const { toast } = useToastManager();

/** 外层节点 */
const wrapRef = ref<HTMLDivElement>();
/** 挂件内容节点 */
const contentRef = ref<HTMLDivElement>();

useAppendTo(wrapRef, getAppBodyElement());

const {
  supportConnectMic,
  supportFacingMode,
  connectMicStatus,
  connectMicType,
  localIsVideoMuted,
  localIsAudioMuted,
  localConnectMicType,
  currentMicIndex,
  maxMicIndex,
  showJoinQueueNumberEnabled,
  mirrorEnabled,
} = storeDefinitionToRefs(useConnectMicStore);

const { mobileLayoutBottomTop, mobileMenuHeaderHeight } = storeDefinitionToRefs(useLayoutStore);

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { applyConnectMic, cancelApplyConnectMic } = useConnectMicApply();

const { endConnectMic, toggleVideo, toggleAudio, toggleFacingMode, toggleMirror } =
  useConnectMicControl();

useConnectMic();

/** 取消申请按钮文案 */
const cancelText = computed(() => {
  const realIndex = currentMicIndex.value + 1;

  if (!showJoinQueueNumberEnabled.value || realIndex === 0) {
    return translate('connectMic.applying2') + '...';
  }

  const maxCount = unref(maxMicIndex);
  const suffixText = realIndex > maxCount ? `${maxCount}+` : realIndex;
  return `${translate('connectMic.applying3')} ${suffixText}`;
});

/** 申请连麦提示弹层显示 */
const applyTipsVisible = ref(false);

/** 打开申请提示 */
function openApplyTips() {
  applyTipsVisible.value = true;
}

/** 处理点击申请确认 */
function onClickApplyConfirm() {
  if (!supportConnectMic.value) {
    toast.error(translate('connectMic.error.notSupport1'));
    return;
  }

  applyConnectMic();
  applyTipsVisible.value = false;
  openPendant();
}

/** 挂件是否展开 */
const pendantOpened = ref(true);

let closeTimer: number;
/** 展开挂件 */
function openPendant() {
  if (closeTimer) clearTimeout(closeTimer);
  pendantOpened.value = true;
}

function autoClosePendant() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    closePendant();
  }, 5000);
}

/** 收起挂件 */
function closePendant() {
  pendantOpened.value = false;
}

onMounted(() => {
  setTimeout(() => {
    if (unref(connectMicStatus) === ConnectMicStatus.NotConnect) {
      closePendant();
    }
  }, 3000);
});

/** 挂件外层宽度 */
const pendantWidth = ref(50);

/** 计算挂件外层宽度 */
async function computePendantWidth() {
  await nextTick();

  let width = 50;
  const contentElem = unref(contentRef);

  if (unref(pendantOpened) && contentElem) {
    width = contentElem.clientWidth;
  }
  pendantWidth.value = width;
}

watch(
  () => [
    unref(pendantOpened),
    unref(connectMicStatus),
    unref(currentLang),
    unref(cancelText),
    unref(localConnectMicType),
    unref(localIsVideoMuted),
    unref(localIsAudioMuted),
    unref(mirrorEnabled),
  ],
  () => computePendantWidth(),
);

watch(
  () => unref(connectMicStatus),
  status => {
    if (status === ConnectMicStatus.NotConnect) autoClosePendant();
  },
);

onMounted(() => {
  computePendantWidth();
});

const { top } = useAsideDrag({
  targetRef: wrapRef,
  getInitTop: () => {
    return unref(mobileLayoutBottomTop) + unref(mobileMenuHeaderHeight) + 72;
  },
});
</script>

<style lang="scss">
.c-mobile-connect-mic-pendant {
  position: absolute;
  top: 0;
  right: 0;
  z-index: $--zIndex-pendant;
  display: flex;
  overflow: hidden;
  transition: width 0.3s;
}

.c-mobile-connect-mic-pendant__content {
  display: flex;
  align-items: center;
  padding: 8px;
  color: #fff;
  white-space: nowrap;
  background-color: #4e4c5b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 0;
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.1);
}

.c-mobile-connect-mic-pendant__button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
  border-radius: 50%;
}

.c-mobile-connect-mic-pendant__button + .c-mobile-connect-mic-pendant__button {
  margin-left: 8px;
}

.c-mobile-connect-mic-pendant__button--apply {
  background-image: url(../imgs/btn-icon-default.png);
}
.c-mobile-connect-mic-pendant__button--cut {
  background-image: url(../imgs/btn-icon-hangup.png);
}
.c-mobile-connect-mic-pendant__button--video-normal {
  background-image: url(../imgs/btn-video-open.png);
}
.c-mobile-connect-mic-pendant__button--video-muted {
  background-image: url(../imgs/btn-video-close.png);
}
.c-mobile-connect-mic-pendant__button--audio-normal {
  background-image: url(../imgs/btn-audio-open.png);
}
.c-mobile-connect-mic-pendant__button--audio-muted {
  background-image: url(../imgs/btn-audio-close.png);
}
.c-mobile-connect-mic-pendant__button--open {
  background-image: url(../imgs/btn-set.png);
}
.c-mobile-connect-mic-pendant__button--facing-mode {
  background-image: url(../imgs/btn-facingmode-user.png);
}
.c-mobile-connect-mic-pendant__button--facing-disabled {
  pointer-events: none;
  background-image: url(../imgs/btn-facingmode-environment.png);
}

.c-mobile-connect-mic-pendant__button--mirror-enabled {
  background-image: url(../imgs/btn-mirror-enabled.png);
}

.c-mobile-connect-mic-pendant__button--mirror-disabled {
  background-image: url(../imgs/btn-mirror-disabled.png);
}

.c-mobile-connect-mic-pendant__button--mirror-video-disabled {
  pointer-events: none;
  background-image: url(../imgs/btn-mirror-disabled.png);
  opacity: 0.5;
}

.c-mobile-connect-mic-pendant__tips {
  padding: 0 8px;
  font-size: 16px;
  line-height: 32px;
  color: $--color-white;
}

.c-mobile-connect-mic-pendant__hide {
  width: 32px;
  height: 32px;
  margin-left: 8px;
  background-image: url(../imgs/btn-close.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 8px 14px;
}

.c-mobile-connect-mic-pendant__apply-tips__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.c-mobile-connect-mic-pendant__apply-tips__icon {
  display: flex;
  font-size: 120px !important;
  color: #dcdbdf;
}

.c-mobile-connect-mic-pendant__apply-tips__text {
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.8);
  text-align: center;

  span {
    display: block;
  }

  span:nth-child(2) {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
  }
}

.pv-rtc-device-layout {
  z-index: #{$--zIndex-pendant + 1} !important;
}
</style>
