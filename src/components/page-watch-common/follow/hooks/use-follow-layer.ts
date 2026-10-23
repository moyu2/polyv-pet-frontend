import { onMounted, ref, watchEffect } from 'vue';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useFollowSetting } from './use-follow-setting';
import {
  obverseTrackShowBehavior,
  useWatchEventTrack,
} from '@/hooks/business/use-watch-event-track';

/**
 * 关注弹层 hook
 */
export const useFollowLayer = () => {
  const { followAutoShow } = useFollowSetting();

  const layerRef = ref<HTMLDivElement>();

  const {
    visible: layerVisible,
    setVisible: setLayerVisible,
    show: showLayer,
    close: closeLayer,
  } = useSimpleVisible(followAutoShow.value);

  watchEffect(() => {
    if (layerVisible.value && layerRef.value) {
      PlvPopperManager.openPopper(layerRef.value);
    }
  });

  useEventBusListener(appEvents.global.OpenFollowLayer, (visible: boolean) => {
    setLayerVisible(visible);
  });

  const { trackUserWatchQrCode } = useWatchEventTrack();

  onMounted(() => {
    obverseTrackShowBehavior({
      $el: layerRef.value,
      cb: () => {
        trackUserWatchQrCode();
      },
    });
  });

  return {
    layerRef,
    layerVisible,
    setLayerVisible,
    showLayer,
    closeLayer,
  };
};
