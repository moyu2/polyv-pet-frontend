import { computed, onMounted, ref, watch } from 'vue';
import { isMobile } from '@/assets/utils/browser';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlayerEvents, FullScreenMode } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';

export function useWebPageFullscreen() {
  const isWebPageFullscreen = ref(false);
  const isMobileWebPageFullscreen = computed(() => {
    return isMobile && isWebPageFullscreen.value;
  });
  const { portraitPlayerIsPageFullscreen } = storeDefinitionToRefs(usePortraitLayoutStore);

  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  watch(portraitPlayerIsPageFullscreen, () => {
    isWebPageFullscreen.value = portraitPlayerIsPageFullscreen.value;
  });

  onMounted(() => {
    watchCore.player.eventEmitter.on(
      PlayerEvents.ToggleFullScreen,
      ({ isPlayerFullscreen, fullScreenMode }) => {
        if (fullScreenMode === FullScreenMode.WebHtml) {
          isWebPageFullscreen.value = isPlayerFullscreen;
        }
      },
    );
  });

  return {
    isMobileWebPageFullscreen,
  };
}
