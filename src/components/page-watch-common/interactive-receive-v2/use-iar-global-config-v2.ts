import { useGlobalInject } from '@/app/use-global-inject';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { isMobile } from '@/assets/utils/browser';
import { messageBox } from '@/components/common-base/message-box';
import { useToastManager } from '@/hooks/components/use-toast';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { provide, reactive, watchEffect } from 'vue';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useQueryParams } from '@/hooks/core/use-query-params';

/**
 * 互动功能全局配置注入的 key
 */
const INTERACT_V2_GLOBAL_PROVIDE_KEY = 'interactGlobalConfigV2';

/**
 * @hook 互动功能全局配置
 */
export const useIarGlobalConfigHookV2 = () => {
  const langStore = useLangStore();
  const layoutStore = useLayoutStore();

  const { getEmitter } = useGlobalInject();

  const { toast } = useToastManager();

  const { getWeixinSdk } = useWeixinSdk();

  const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
  const { getPlvWebviewBridge } = useWebviewStore();
  const { paramGetter } = useQueryParams();

  const provideData = reactive({
    globalLang: langStore.currentLang,
    pageFullscreen: layoutStore.mobilePlayerIsPageFullscreen,
    fullscreenElement: isMobile ? undefined : PC_PLAYER_FULL_SCREEN_SELECTOR,
    isMobile: () => {
      return isMobile;
    },

    toast: (msg: string) => {
      toast.success(msg);
    },
    messageBox: (options: Parameters<typeof messageBox>[0]) => {
      return messageBox(options).$confirm();
    },
    getEmitter,
    getWeixinSdk,
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
    provideData.pageFullscreen = layoutStore.mobilePlayerIsPageFullscreen;
  });

  provide(INTERACT_V2_GLOBAL_PROVIDE_KEY, provideData);
};
