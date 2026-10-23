<!-- @file 移动端连麦挂件 v2 -->
<template>
  <div
    ref="wrapRef"
    class="c-mobile-connect-mic-pendant-v2"
    :class="{ 'c-mobile-connect-mic-pendant-v2--idle': idle }"
    :style="{
      top: `${top}px`,
    }"
  >
    <!-- 未连麦：申请按钮 -->
    <div
      v-if="connectMicStatus === ConnectMicStatus.NotConnect"
      class="c-mobile-connect-mic-pendant-v2__btn c-mobile-connect-mic-pendant-v2__btn--apply"
      @click="onClickPendant"
    >
      <div class="c-mobile-connect-mic-pendant-v2__icon">
        <icon-phone />
      </div>
      <div class="c-mobile-connect-mic-pendant-v2__label">{{ $lang('call.connect') }}</div>
    </div>

    <!-- 申请中：取消按钮 -->
    <div
      v-else-if="connectMicStatus === ConnectMicStatus.Applying"
      class="c-mobile-connect-mic-pendant-v2__btn c-mobile-connect-mic-pendant-v2__btn--cancel"
      @click="onClickPendant"
    >
      <div class="c-mobile-connect-mic-pendant-v2__icon">
        <icon-phone />
      </div>
      <wave-loading class="c-mobile-connect-mic-pendant-v2__wave" />
    </div>

    <!-- 连麦中：连麦时长 -->
    <div
      v-else
      class="c-mobile-connect-mic-pendant-v2__btn c-mobile-connect-mic-pendant-v2__btn--connected"
      @click="onClickPendant"
    >
      <div
        class="c-mobile-connect-mic-pendant-v2__icon c-mobile-connect-mic-pendant-v2__icon--blue"
      >
        <icon-phone />
      </div>
      <div class="c-mobile-connect-mic-pendant-v2__timer">
        {{ formattedDuration }}
      </div>
    </div>

    <!-- 连麦弹窗 -->
    <mobile-connect-mic-popup-v2
      :visible.sync="popupVisible"
      :duration="connectDurationSeconds"
    />
  </div>
</template>

<script setup lang="ts">
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { ConnectMicStatus } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';

import { useAsideDrag } from '@/hooks/behaviors/use-aside-drag';
import { useGlobalInject } from '@/app/use-global-inject';
import { useConnectMic } from '../hooks/use-connect-mic';

import IconPhone from '../common/icon-phone.vue';
import MobileConnectMicPopupV2 from './mobile-connect-mic-popup-v2.vue';
import WaveLoading from '../common/wave-loading.vue';

const { getAppBodyElement } = useGlobalInject();

/** 外层节点 */
const wrapRef = ref<HTMLDivElement>();

useAppendTo(wrapRef, getAppBodyElement());

const { connectMicStatus, inviteStatus, isConnectMicing } =
  storeDefinitionToRefs(useConnectMicStore);

const { mobileLayoutBottomTop, mobileMenuHeaderHeight } = storeDefinitionToRefs(useLayoutStore);

useConnectMic();

/** 弹窗可见 */
const popupVisible = ref(false);

/** 点击挂件 */
function onClickPendant() {
  popupVisible.value = true;
}

/** 收到邀请时自动弹出面板 */
watch(
  () => unref(inviteStatus),
  status => {
    if (status && !unref(isConnectMicing)) {
      popupVisible.value = true;
    }
  },
);

/** 挂件无操作时是否进入半透明状态 */
const idle = ref(false);
let idleTimer: number | undefined;

function clearIdleTimer() {
  if (idleTimer) {
    window.clearTimeout(idleTimer);
    idleTimer = undefined;
  }
}

function scheduleIdle() {
  clearIdleTimer();
  if (unref(popupVisible)) return;
  idleTimer = window.setTimeout(() => {
    idle.value = true;
    idleTimer = undefined;
  }, 2000);
}

function resetIdle() {
  idle.value = false;
  scheduleIdle();
}

watch(popupVisible, visible => {
  if (visible) {
    clearIdleTimer();
    idle.value = false;
  } else {
    scheduleIdle();
  }
});

/** 连麦开始时间戳 */
const connectStartAt = ref<number>(0);
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

/** 格式化连麦时长 */
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
    } else if (
      status === ConnectMicStatus.NotConnect ||
      status === ConnectMicStatus.Applying ||
      status === ConnectMicStatus.Error
    ) {
      stopDurationTimer();
    }
    if (status === ConnectMicStatus.NotConnect) {
      popupVisible.value = false;
    }
  },
);

onMounted(() => {
  if (unref(connectMicStatus) === ConnectMicStatus.Connected) {
    startDurationTimer();
  }
  if (unref(inviteStatus) && !unref(isConnectMicing)) {
    popupVisible.value = true;
  }
  scheduleIdle();
  const el = unref(wrapRef);
  if (el) {
    el.addEventListener('pointerdown', resetIdle);
    el.addEventListener('touchstart', resetIdle, { passive: true });
  }
});

onBeforeUnmount(() => {
  stopDurationTimer();
  clearIdleTimer();
  const el = unref(wrapRef);
  if (el) {
    el.removeEventListener('pointerdown', resetIdle);
    el.removeEventListener('touchstart', resetIdle);
  }
});

const { top } = useAsideDrag({
  targetRef: wrapRef,
  getInitTop: () => {
    return unref(mobileLayoutBottomTop) + unref(mobileMenuHeaderHeight) + 72;
  },
});

/** 拖动改变位置时重置半透明状态 */
watch(top, resetIdle);
</script>

<style lang="scss">
.c-mobile-connect-mic-pendant-v2 {
  position: absolute;
  top: 0;
  right: 0;
  z-index: $--zIndex-pendant;
  transition: opacity 0.3s ease-in-out;
}

.c-mobile-connect-mic-pendant-v2--idle {
  opacity: 0.3;
}

.c-mobile-connect-mic-pendant-v2__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  border-radius: 14px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.12);
}

.c-mobile-connect-mic-pendant-v2__btn--apply {
  background: #0dc565;
}

.c-mobile-connect-mic-pendant-v2__btn--cancel {
  color: rgba(255, 255, 255, 0.8);
  background: #e64a4a;
}

.c-mobile-connect-mic-pendant-v2__btn--connected {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.8);
}

.c-mobile-connect-mic-pendant-v2__icon {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  color: $--color-white;

  svg {
    font-size: 24px;
  }
}

.c-mobile-connect-mic-pendant-v2__icon--blue {
  color: #3d7eff;
}

.c-mobile-connect-mic-pendant-v2__label {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1;
  color: $--color-white;
}

.c-mobile-connect-mic-pendant-v2__timer {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1;
  color: $--color-white;
}

.c-mobile-connect-mic-pendant-v2__wave {
  margin-top: 6px;
  color: $--color-white;
}
</style>
