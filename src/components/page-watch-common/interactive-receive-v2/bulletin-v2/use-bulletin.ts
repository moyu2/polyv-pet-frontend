import { ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import type { PolyvBulletin } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../_hooks/use-iar-target';
import { appEvents } from '@/app/app-events/use-app-events';
import { useEventBusListener } from '@/app/app-events';

export const useBulletin = (afterCreate?: (iarTarget: PolyvBulletin.Bulletin) => unknown) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const bulletinPopupRef = ref();

  const { targetInited, getIarTarget } = useIarTarget<PolyvBulletin.Bulletin>(() => {
    return watchCore.interactReceive.getBulletinV2();
  }, afterCreate);

  function openBulletinPopup() {
    bulletinPopupRef.value?.open();
  }

  useEventBusListener(appEvents.interaction.OpenBulletinPopup, openBulletinPopup);

  return {
    targetInited,
    bulletinPopupRef,
    getIarTarget,
  };
};
