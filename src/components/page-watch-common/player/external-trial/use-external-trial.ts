/**
 * @file 外部授权试看业务 Hook（观看页）
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { ExternalAuthWatchAccess, ExternalTrialWatchInfo, LiveStatus } from '@polyv/live-watch-sdk';
import { formatLink } from '@polyv/utils/external-link';
import { local } from '@polyv/utils/storage';

import { appEvents } from '@/app/app-events';
import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { getStorageKey } from '@/assets/utils/storage';

/** 获取本地存储的"外部授权试看剩余时长" key 值（按 sessionId + viewerId 隔离，避免同一浏览器下不同观众共享缓存） */
const mergeStorageKey = (sessionId: string, viewerId?: string) =>
  getStorageKey(
    viewerId
      ? `external-trial-remaining-time-${sessionId}-${viewerId}`
      : `external-trial-remaining-time-${sessionId}`,
  );

/** 读取本地缓存的试看剩余时长（秒），无缓存返回 null */
function readLocalRemaining(sessionId: string, viewerId?: string): number | null {
  if (!sessionId) return null;
  const v = local.get(mergeStorageKey(sessionId, viewerId));
  return v !== null ? parseInt(v) : null;
}

/** 写入本地缓存的试看剩余时长（秒） */
function writeLocalRemaining(sessionId: string, viewerId: string | undefined, time: number): void {
  if (!sessionId || time < 0) return;
  local.set(mergeStorageKey(sessionId, viewerId), String(time));
}

export const useExternalTrial = () => {
  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();
  const viewerStore = useViewerStore();
  const { getWatchCore, getEmitter } = useGlobalInject();
  const { getLinkParams } = useIarExternalLinkParams();

  const watchCore = getWatchCore();

  /** 外部授权试看信息 */
  const trialInfo = computed<ExternalTrialWatchInfo | null>(() => channelStore.externalTrialWatch);

  /** 是否处于试看态（watchAccess=trial） */
  const isTrial = computed(
    () =>
      !!trialInfo.value &&
      trialInfo.value.watchAccess === ExternalAuthWatchAccess.Trial &&
      trialInfo.value.trialWatchEnabled,
  );

  /**
   * 后端 availableTrial（秒）。
   * 用 Math.max 归一化为非负：后端异常返回负数时，若直接用原值，
   * trialEnded（===0）与 trialPlaying（>0）均为 false，overlay 会既不显倒计时也不显到期遮罩，
   * 形成永不停止的空白试看态；归一化后负数等价于“已耗尽”，直接走到期停止分支。
   */
  const availableTrial = computed(() => Math.max(0, trialInfo.value?.availableTrial ?? 0));

  /** 本地剩余秒数（按墙钟递减，并持久化到 localStorage，刷新后可续算） */
  const remainingSeconds = ref(0);

  /** 本次试看已到期；销毁播放器后仍需保留到期面板 */
  const trialExpired = ref(false);

  /** 试看播放中：直播中 且 trial 且播放器已初始化且后端 availableTrial>0 且本地倒计时未归零 */
  const trialPlaying = computed(
    () =>
      isTrial.value &&
      channelStore.liveStatus === LiveStatus.Live &&
      playerStore.playerInited &&
      availableTrial.value > 0 &&
      remainingSeconds.value > 0,
  );

  /** 试看结束：直播中 且 trial 且本次倒计时已归零 */
  const trialEnded = computed(
    () => isTrial.value && channelStore.liveStatus === LiveStatus.Live && trialExpired.value,
  );

  let countdownTimer: number | null = null;
  /** 倒计时结束的墙钟时间戳（ms）。以 Date.now() 对齐，避免 setInterval 在后台 tab/低性能下漂移累积 */
  let countdownEndTime = 0;

  /** 清除倒计时 */
  function clearCountdown(): void {
    if (countdownTimer !== null) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  /** 试看到期：清除倒计时、缓存归零并销毁播放器与文档 */
  function stopTrialPlay(sessionId: string, viewerId: string | undefined): void {
    clearCountdown();
    trialExpired.value = true;
    remainingSeconds.value = 0;
    writeLocalRemaining(sessionId, viewerId, 0);
    getEmitter().emit(appEvents.player.DestroyPlayer);
    getEmitter().emit(appEvents.doc.DestroyDoc);
  }

  /**
   * 启动秒级倒计时，并将剩余时长持久化到 localStorage（防止刷新重置）。
   * 以墙钟 Date.now() 为基准计算剩余秒数，而非单纯每秒 -1：
   * setInterval 在后台 tab 被节流、CPU 繁忙或 WebView 挂起时会显著变慢，
   * 若用计数递减会导致超时观看（破坏“到期即停”付费墙契约）；
   * 用时间戳对齐后，切回前台的首个 tick 即可按真实经过时间结算。
   */
  function startCountdown(seconds: number, sessionId: string, viewerId: string | undefined): void {
    clearCountdown();
    remainingSeconds.value = seconds;
    writeLocalRemaining(sessionId, viewerId, seconds);
    if (remainingSeconds.value <= 0) {
      stopTrialPlay(sessionId, viewerId);
      return;
    }
    countdownEndTime = Date.now() + seconds * 1000;
    countdownTimer = window.setInterval(() => {
      const remaining = Math.ceil((countdownEndTime - Date.now()) / 1000);
      remainingSeconds.value = Math.max(0, remaining);
      writeLocalRemaining(sessionId, viewerId, remainingSeconds.value);
      if (remainingSeconds.value <= 0) {
        stopTrialPlay(sessionId, viewerId);
      }
    }, 1000);
  }

  // 试看态、剩余时长、直播状态或播放器初始化状态变化时重置倒计时
  watch(
    [isTrial, availableTrial, () => channelStore.liveStatus, () => playerStore.playerInited],
    async ([trial, seconds, liveStatus, inited]) => {
      if (!inited) return;

      // 非试看态或非直播：清除试看态，放行正常观看
      if (!trial || liveStatus !== LiveStatus.Live) {
        clearCountdown();
        trialExpired.value = false;
        remainingSeconds.value = 0;
        return;
      }

      // 试看态但后端剩余时长已耗尽（availableTrial <= 0）：判定为试看到期，
      // 销毁播放器并展示到期引导，阻止无限制观看。
      if (seconds <= 0) {
        stopTrialPlay(trialInfo.value?.sessionId ?? '', viewerStore.viewerId);
        return;
      }

      try {
        const result = await watchCore.trial.startExternalTrial();
        if (result.success) {
          channelStore.syncExternalTrialWatch();
          const latestTrialInfo = watchCore.trial.getExternalTrialWatch();
          const sessionId = trialInfo.value?.sessionId ?? '';
          const viewerId = viewerStore.viewerId;
          // 以 startExternalTrial 后 SDK 同步的服务端剩余时长为基准，避免本地缓存 0 导致直接进入到期态。
          const serverRemaining = Math.max(0, latestTrialInfo?.availableTrial ?? seconds);
          const cached = readLocalRemaining(sessionId, viewerId);
          const effective = cached !== null ? Math.min(cached, serverRemaining) : serverRemaining;
          trialExpired.value = false;
          startCountdown(effective, sessionId, viewerId);
        } else {
          clearCountdown();
          remainingSeconds.value = 0;
          console.error('[useExternalTrial] startExternalTrial failed', result.failReason);
        }
      } catch (e) {
        console.error('[useExternalTrial] startExternalTrial error', e);
      }
    },
    { immediate: true },
  );

  /**
   * 跳转试看引导地址。
   *
   * 链接参数复用 useIarExternalLinkParams 的通用外链参数（channelId/sessionId/userId/openId 等）。
   */
  function redirectToTrialUrl(): void {
    const info = trialInfo.value;
    if (!info?.trialRedirectUrl) return;

    try {
      const url = formatLink(info.trialRedirectUrl, () => ({
        ...getLinkParams(),
      }));
      window.location.href = url;
    } catch (e) {
      console.warn('[useExternalTrial] redirectToTrialUrl failed', e);
    }
  }

  onBeforeUnmount(() => {
    clearCountdown();
  });

  return {
    trialInfo,
    isTrial,
    trialPlaying,
    trialEnded,
    remainingSeconds,
    redirectToTrialUrl,
  };
};
