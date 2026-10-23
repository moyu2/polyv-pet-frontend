import { ref, onMounted } from 'vue';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { useAdvert } from '@/hooks/business/use-advert';

export const usePlayerAdvert = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const advertType = ref<'head' | 'stop'>('head');

  const { handleAdvertClick, iframeVisible, iframeUrl } = useAdvert({
    getLinkData: () => {
      return watchCore.player.getPlayerAdvertLinkData(advertType.value);
    },
  });

  onMounted(() => {
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerHeadAdClicked, () => {
      advertType.value = 'head';
      handleAdvertClick();
    });
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerStopAdClicked, () => {
      advertType.value = 'stop';
      handleAdvertClick();
    });
  });

  return {
    iframeVisible,
    iframeUrl,
  };
};
