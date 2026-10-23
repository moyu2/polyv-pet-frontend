import { isMobile } from '@/assets/utils/browser';
import { useLayoutStore } from '@/store/use-layout-store';

export const useMobileInput = () => {
  const layoutStore = useLayoutStore();

  function onInputFocus() {
    if (!isMobile) {
      return;
    }
    layoutStore.mobileInputFocusing = true;
    setTimeout(() => {
      console.log('window.scrollY', window.scrollY);
      layoutStore.mobileKeyboardHeight = window.scrollY;
    }, 300);
  }

  function onInputBlur() {
    if (!isMobile) {
      return;
    }
    layoutStore.mobileInputFocusing = false;
    layoutStore.mobileKeyboardHeight = 0;
  }

  return {
    onInputFocus,
    onInputBlur,
  };
};
