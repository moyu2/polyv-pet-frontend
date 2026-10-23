/**
 * @file 试看播放器事件 hook
 */
import { ref } from 'vue';
import { ChannelTrialInfo, PlayerEvents } from '@polyv/live-watch-sdk';
import { local } from '@polyv/utils/storage';

import { usePlayerStore } from '@/store/use-player-store';
import { appEvents } from '@/app/app-events';
import { getStorageKey } from '@/assets/utils/storage';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/** 获取本地存储的"试看剩余时长" key 值 */
const mergeStorageKey = (sessionId: string) => {
  return getStorageKey(`live-trial-remaining-time-${sessionId}`);
};

/** @hook 试看播放器事件 hook */
export const usePlayerTrialEvent = ({ trialInfo }: { trialInfo: ChannelTrialInfo | null }) => {
  const { getEmitter, getWatchCore } = useMultiPolyvWatchApp();

  const playerStore = usePlayerStore();

  /** 试看剩余时长，秒级别 */
  const trialRemainingTime = ref(0);

  /** 试看时长定时器 */
  const trialWatchTimer = ref<number | null>(null);

  /** 设置剩余试看时长到本地缓存中 */
  function setLocalTrialRemainingTime(time: number) {
    if (!trialInfo) return;
    if (time < 0) return;

    local.set(mergeStorageKey(trialInfo.channelSessionId), String(time));
  }

  /** 清除试看时长轮询定时器 */
  function clearTrialWatchTimer() {
    if (trialWatchTimer.value !== null) {
      clearInterval(trialWatchTimer.value);
    }
    trialWatchTimer.value = null;
  }

  /** 通过定时器轮询，更新本地缓存的试看时长 */
  function setTrialWatchTimer() {
    trialWatchTimer.value = window.setInterval(() => {
      if (trialRemainingTime.value <= 0) {
        clearTrialWatchTimer();
        getEmitter().emit(appEvents.player.TrialPlayEnd);
        return;
      }
      trialRemainingTime.value -= 1;
      setLocalTrialRemainingTime(trialRemainingTime.value);
    }, 1000);
  }

  /** 初始化剩余试看时长 */
  function initTrialRemainingTime() {
    if (!trialInfo) {
      console.warn('需要频道试看数据');
      return;
    }

    /** 后端计算的试看剩余时长 */
    const serverTrialRemainingTime = trialInfo.availableTrial;
    /** 频道配置的试看总时长，以秒为单位  */
    const serverTrialConfigTime = trialInfo.trialWatchTime * 60;

    const cachedTime = local.get(mergeStorageKey(trialInfo.channelSessionId));
    /** 本地缓存剩余时长 */
    const localTrialRemainingTime =
      cachedTime !== null ? parseInt(cachedTime) : serverTrialConfigTime;

    if (localTrialRemainingTime === 0) {
      // 无本地缓存 || 剩余时长确实为 0 的情况
      clearTrialWatchTimer();
      getEmitter().emit(appEvents.player.TrialPlayEnd);
      return;
    } else {
      getEmitter().emit(appEvents.player.TrialPlayStart, {
        trialRemainingTime: localTrialRemainingTime,
      });
    }

    // 设置剩余时长
    trialRemainingTime.value =
      localTrialRemainingTime === serverTrialConfigTime
        ? serverTrialConfigTime
        : Math.min(localTrialRemainingTime, serverTrialRemainingTime); // 本地缓存剩余时长和服务器记录剩余时长取最小
    setLocalTrialRemainingTime(trialRemainingTime.value);

    setTrialWatchTimer();
  }

  /** 播放器初始化钩子 */
  function onPlayerInited() {
    playerStore.$patch({ playerInited: true });
    initTrialRemainingTime();
  }

  function bindPlayerEvents() {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, onPlayerInited);
  }

  function unbindPlayerEvents() {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerInited, onPlayerInited);

    clearTrialWatchTimer();
  }

  return {
    bindPlayerEvents,
    unbindPlayerEvents,
  };
};
