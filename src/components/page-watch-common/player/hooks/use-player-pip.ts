/**
 * @file PC端画中画(小窗播放) hook
 */
import { computed, ref, watch } from 'vue';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlayerEvents, LiveStatus } from '@polyv/live-watch-sdk';

/** 检测浏览器是否支持画中画 */
function isBrowserSupportPip(): boolean {
  return 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;
}

export const usePlayerPip = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const playerStore = usePlayerStore();
  const { isSmallClassChannel, liveStatus } = storeDefinitionToRefs(useChannelStore);
  const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

  /** 是否处于画中画状态 */
  const isPipActive = ref(false);

  /** 当前播放器是否支持画中画，通过 PlayerInited 事件触发更新 */
  const playerSupportPip = ref(false);

  /** 画中画按钮是否显示 */
  const pipButtonVisible = computed(() => {
    // 浏览器不支持
    if (!isBrowserSupportPip()) {
      return false;
    }

    // 后台未开启PC小窗播放
    if (!getWatchCore().player.getPcPIPEnabled()) {
      return false;
    }

    // 小班课不显示
    if (isSmallClassChannel.value) {
      return false;
    }

    // 直播中不显示
    if (liveStatus.value !== LiveStatus.Live && liveStatus.value !== LiveStatus.Playback) {
      return false;
    }

    // 连麦中不显示
    if (isConnectMicing.value) {
      return false;
    }

    // 播放器未初始化
    if (!playerStore.playerInited) {
      return false;
    }

    // 当前播放器不支持画中画（如VRM加密视频）
    if (!playerSupportPip.value) {
      return false;
    }

    return true;
  });

  /** 切换画中画 */
  async function togglePip(): Promise<void> {
    const watchCore = getWatchCore();
    if (isPipActive.value) {
      await watchCore.player.leavePictureInPicture();
    } else {
      await watchCore.player.enterPictureInPicture();
    }
  }

  // 播放器初始化后更新支持状态
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, () => {
    playerSupportPip.value = watchCore.player.supportPictureInPicture();
  });

  // 监听 SDK 画中画事件
  watchCore.player.eventEmitter.on(PlayerEvents.EnterPictureInPicture, () => {
    isPipActive.value = true;
  });
  watchCore.player.eventEmitter.on(PlayerEvents.LeavePictureInPicture, () => {
    isPipActive.value = false;
  });

  // 连麦时退出画中画
  watch(isConnectMicing, micing => {
    if (micing && isPipActive.value) {
      getWatchCore().player.leavePictureInPicture();
    }
  });

  return {
    isPipActive,
    pipButtonVisible,
    togglePip,
  };
};
