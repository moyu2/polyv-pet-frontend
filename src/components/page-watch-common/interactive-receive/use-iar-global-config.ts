import { useLangStore } from '@/store/use-lang-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { provide, reactive, watchEffect } from 'vue';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useQueryParams } from '@/hooks/core/use-query-params';

/**
 * 互动功能全局配置注入的 key
 */
const INTERACT_GLOBAL_PROVIDE_KEY = 'interactGlobalConfig';

/**
 * @hook 互动功能全局配置
 */
export const useIarGlobalConfigHook = () => {
  const langStore = useLangStore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
  const { getPlvWebviewBridge } = useWebviewStore();
  const { paramGetter } = useQueryParams();

  function getIarDelayTime() {
    return playbackStore.chatReplayEnabled ? 0 : playerStore.delayTime;
  }

  const provideData = reactive({
    globalLang: langStore.currentLang,
    globalDelayTime: getIarDelayTime(),
    getPlvWebviewBridge,
    isPlvWebview: () => {
      return isPlvWebview.value;
    },
    getPlvWebviewSmallWindowSize: () => {
      return {
        width: plvWebviewDataSize.value.width,
        height: plvWebviewDataSize.value.height,
      };
    },
    getIsApp: () => paramGetter().isApp(),
  });

  watchEffect(() => {
    provideData.globalLang = langStore.currentLang;
    provideData.globalDelayTime = getIarDelayTime();
  });

  provide(INTERACT_GLOBAL_PROVIDE_KEY, provideData);
};
