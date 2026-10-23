import Vue from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useThemeStore } from '@/store/use-theme-store';
import { PwcEventEmitter, useConfigProvider, vLoading as vNewLoading } from '@polyv/vue-components';
import '@polyv/vue-components/font/din-pro/index.scss';

Vue.directive('new-loading', vNewLoading);

export const installVueComponents = () => {
  const langStore = useLangStore();
  const layoutStore = useLayoutStore();
  const themeStore = useThemeStore();
  const { getEmitter } = useGlobalInject();

  useConfigProvider({
    globalLang: () => langStore.currentLang,
    pageFullscreen: () => layoutStore.mobilePlayerIsPageFullscreen,
    getEmitter: getEmitter as unknown as () => PwcEventEmitter,
    // getEmitter,
    getSkinColorConfig: () => {
      return {
        skinColorMode: themeStore.currentSkinColorMode,
        specialColor: themeStore.currentSkinPrimaryColor,
        themeColor: themeStore.currentSkinThemeColor,
        primaryColor: themeStore.currentSkinPrimaryColor,
      };
    },
  });
};
