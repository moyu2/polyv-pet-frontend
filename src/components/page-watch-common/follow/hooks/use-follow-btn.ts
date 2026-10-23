import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';

export const useFollowBtn = () => {
  const { getEmitter } = useGlobalInject();

  const { trackUserClickFollowBtn } = useWatchEventTrack();

  function onClickFollowBtn() {
    trackUserClickFollowBtn();
    getEmitter().emit(appEvents.global.OpenFollowLayer, true);
  }

  return {
    onClickFollowBtn,
  };
};
