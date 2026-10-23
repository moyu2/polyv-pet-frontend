import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

export const useRushAnswer = () => {
  const { getWatchCore } = useGlobalInject();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();

  const rushAnswerSdk = watchCore.interactReceive.getRushAnswer();

  function handleEntryVisibleChanged(visible: boolean) {
    interactReceiveStore.$patch({
      rushAnswerPendantVisible: visible,
    });
  }

  function onRushAnswerVisibleChanged(visible: boolean) {
    if (visible) {
      toLockFeedDrag('rush-answer');
    } else {
      toUnlockFeedDrag();
    }
  }

  return {
    rushAnswerSdk,
    handleEntryVisibleChanged,
    onRushAnswerVisibleChanged,
  };
};
