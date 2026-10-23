import { useGlobalInject } from '@/app/use-global-inject';
import { KeyCodeMap } from '@/assets/constants/key-code';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';

/**
 * 文档键盘控制 hook
 */
export const useDocKeydownControl = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const layoutStore = useLayoutStore();
  const docStore = useDocStore();

  function onKeydownEvent(event: KeyboardEvent) {
    const keyCode = event.keyCode;
    if (layoutStore.mainScreen !== MainScreenContent.Doc || !docStore.viewerPptTurningEnabled) {
      return;
    }

    const target = event.target as HTMLElement;
    const tagName = target?.tagName;
    const contentEditable = target?.contentEditable === 'true';
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || contentEditable) {
      return;
    }

    if (keyCode === KeyCodeMap.ArrowLeft) {
      watchCore.doc.gotoPrev();
      return;
    }

    if (keyCode === KeyCodeMap.ArrowRight) {
      watchCore.doc.gotoNext();
    }
  }

  function listenEvent() {
    removeListenEvent();
    watchCore.doc.setKeyboardEnabled(false);
    window.addEventListener('keydown', onKeydownEvent);
  }

  function removeListenEvent() {
    watchCore.doc.setKeyboardEnabled(true);
    window.removeEventListener('keydown', onKeydownEvent);
  }

  onMounted(() => {
    listenEvent();
  });

  onBeforeUnmount(() => {
    removeListenEvent();
  });
};
