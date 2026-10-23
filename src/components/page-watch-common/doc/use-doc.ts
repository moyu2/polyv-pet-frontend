import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { tabletLoadDesktopTemplate } from '@/assets/utils/browser';
import { MessageBoxInstance } from '@/components/common-base/message-box';
import { useToastManager } from '@/hooks/components/use-toast';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { DocEvents, LiveStatus, SetupDocOptions } from '@polyv/live-watch-sdk';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

export const useDoc = (
  useOptions: {
    setupOptions?: Partial<SetupDocOptions>;
  } = {},
) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  const docStore = useDocStore();
  const channelStore = useChannelStore();
  const layoutStore = useLayoutStore();
  const webviewStore = useWebviewStore();

  /** 创建文档的外层节点 */
  const wrapRef = ref<HTMLDivElement>();

  const confirmRef = ref<MessageBoxInstance>();

  const docSetupFinished = ref(false);

  /** 初始化文档 */
  async function initDoc() {
    const { setupOptions = {} } = useOptions;
    const wrapElem = unref(wrapRef);
    if (!wrapElem) return;

    if (!docStore.docEnabled) return;

    docSetupFinished.value = false;

    await watchCore.doc.setupDoc({
      container: wrapElem,
      keyboardEnabled: false,
      beforeClear: async () => {
        if (confirmRef.value) {
          const result = await confirmRef.value.$confirm();
          if (!result) {
            return Promise.reject(new Error());
          }
          toast.success(translate('base.deleteSuccess'));
        }
      },
      ...setupOptions,
    });

    docSetupFinished.value = true;

    listenDocEvent();
  }

  function listenDocEvent() {
    unlistenDocEvent();
    watchCore.doc.eventEmitter.on(DocEvents.FullScreenStateChange, onFullScreenStateChange);
  }

  function unlistenDocEvent() {
    watchCore.doc.eventEmitter.off(DocEvents.FullScreenStateChange, onFullScreenStateChange);
  }

  /** 销毁文档：移除事件监听、重置状态并销毁 SDK 文档实例 */
  function destroyDoc() {
    unlistenDocEvent();
    docSetupFinished.value = false;
    watchCore.doc.destroyDoc();
  }

  function onFullScreenStateChange(evt: { isFullScreen: boolean }) {
    layoutStore.$patch({
      mobileDocIsPageFullscreen: evt.isFullScreen,
    });
  }

  useEventBusListener(appEvents.doc.ResetUpDoc, () => {
    initDoc();
  });

  useEventBusListener(appEvents.doc.DestroyDoc, () => {
    destroyDoc();
  });

  onMounted(() => {
    initDoc();
  });

  /** 暂无直播状态是否显示 */
  const emptyPlaceholderVisible = computed<boolean>(() => {
    if (
      [LiveStatus.UnStart, LiveStatus.End, LiveStatus.Waiting, LiveStatus.Stop].includes(
        channelStore.liveStatus,
      )
    ) {
      return true;
    }

    return false;
  });

  watch(
    () => [
      layoutStore.isHorizontalScreenOrientation,
      layoutStore.isPcPageFullscreen,
      layoutStore.isFullscreen,
      layoutStore.mainScreen,
      layoutStore.mobileDocIsPageFullscreen,
      // 小窗固定放在最后
      webviewStore.isSmallWindow,
    ],
    async (next, prev) => {
      await nextTick();
      // 小窗事件结束不一定这么快
      const length = next.length - 1 >= 0 ? next.length - 1 : 0;
      const timeout = next[length] !== prev[length] ? 500 : 0;

      setTimeout(async () => {
        watchCore.doc.resize();

        // 该模式下需要再调用一次 resize，才能正常调整大小
        if (tabletLoadDesktopTemplate) {
          await nextTick();
          watchCore.doc.resize();
        }
      }, timeout);
    },
  );

  onBeforeUnmount(() => {
    unlistenDocEvent();
  });

  return {
    docSetupFinished,

    wrapRef,
    confirmRef,
    emptyPlaceholderVisible,
  };
};
