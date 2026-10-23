import { appEvents, useEventBusListener } from '@/app/app-events';
import { onBeforeUnmount, onMounted } from 'vue';
import { usePlayerStore } from '@/store/use-player-store';

export const usePlayerControlVisible = () => {
  const playerStore = usePlayerStore();

  /** 显示控制栏 */
  function openControl() {
    if (!playerStore.playerControlEnabled) return;

    playerStore.$patch({
      playerControlVisible: true,
    });
    startHideTimer();
  }

  /** 隐藏控制栏 */
  function closeControl() {
    playerStore.$patch({
      playerControlVisible: false,
    });
  }

  /** 切换控制栏 */
  function toggleControl() {
    if (!playerStore.playerControlEnabled) {
      closeControl();
      return;
    }

    if (playerStore.playerControlVisible) {
      closeControl();
    } else {
      openControl();
    }
  }

  let hideTimer: number | undefined;

  /** 启动隐藏定时器 */
  function startHideTimer() {
    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      closeControl();
    }, 3 * 1000);
  }

  /** 清除隐藏定时器 */
  function clearHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
  }

  useEventBusListener(appEvents.player.ClickMobilePlayerContainer, () => {
    toggleControl();
  });

  onMounted(() => {
    openControl();
  });

  onBeforeUnmount(() => {
    clearHideTimer();
  });

  return {
    startHidePlayerControlTimer: startHideTimer,
  };
};
