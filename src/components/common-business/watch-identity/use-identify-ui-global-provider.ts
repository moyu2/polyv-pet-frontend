import { useGlobalInject } from '@/app/use-global-inject';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { useLangStore } from '@/store/use-lang-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useWeixinSdk } from '@polyv/vue-components';
import { storeToRefs } from 'pinia';
import { provide, reactive, watchEffect } from 'vue';
import { useQueryParams } from '@/hooks/core/use-query-params';

const PLV_IDENTITY_UI_GLOBAL_CONFIG = 'PlvIdentityUIGlobalConfig';

export const useIdentity = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  function getWatchIdentifyCore() {
    return watchCore.identity.getIdentifyCore();
  }

  return {
    getWatchIdentifyCore,
  };
};

export const useIdentityUIGlobalProvider = () => {
  const { getWatchIdentifyCore } = useIdentity();

  const { getLinkParams } = useIarExternalLinkParams();

  const { getWeixinSdk } = useWeixinSdk();

  const { paramGetter } = useQueryParams();

  const langStore = useLangStore();

  const { isPlvWebview, plvWebviewDataSize } = storeToRefs(useWebviewStore());
  const webviewStore = useWebviewStore();

  const provideData = reactive({
    globalLang: langStore.currentLang,
    getWatchIdentifyCore,
    getWeixinSdk,
    getPlvWebviewBridge: webviewStore.getPlvWebviewBridge,
    isPlvWebview: () => {
      return isPlvWebview.value;
    },
    getPlvWebviewSmallWindowSize: () => {
      return {
        width: plvWebviewDataSize.value.width,
        height: plvWebviewDataSize.value.height,
      };
    },
    getLinkParams,
    getIsApp: () => paramGetter().isApp(),
  });

  watchEffect(() => {
    provideData.globalLang = langStore.currentLang;
  });

  provide(PLV_IDENTITY_UI_GLOBAL_CONFIG, provideData);
};
