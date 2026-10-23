import { provide, reactive, watchEffect } from 'vue';

import { isMobile } from '@/assets/utils/browser';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useGlobalInject } from '@/app/use-global-inject';
import { useThemeStore } from '@/store/use-theme-store';
import { storeToRefs } from 'pinia';

export const useAIGlobalProvider = () => {
  const { currentLang } = storeDefinitionToRefs(useLangStore);

  const { getWatchCore } = useGlobalInject();

  const { currentSkinColorMode } = storeToRefs(useThemeStore());

  const watchCore = getWatchCore();

  function getWatchAICore() {
    return watchCore.polyvAI.getWatchAICore();
  }

  const provideData = reactive({
    globalLang: currentLang.value,
    theme: currentSkinColorMode.value,
    isMobile: () => isMobile,
    getWatchAICore,
  });

  watchEffect(() => {
    provideData.globalLang = currentLang.value;
    provideData.theme = currentSkinColorMode.value;
  });

  provide('AIUIGlobalConfig', provideData);

  return {
    watchCore,
    getWatchAICore,
  };
};
