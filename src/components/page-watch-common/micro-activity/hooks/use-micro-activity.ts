import { onMounted, onBeforeUnmount, ref, unref } from 'vue';
import {
  HxcGeneralIframeEventData,
  HxcIframeEventData,
  HxcRequestDevicePermissionIframeEventData,
  LoggerName,
  MicroActivityIframeEventType,
} from '@polyv/live-watch-sdk';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';
import { MicroActivityDeviceMotion } from './window-device-motion';
import { useToastManager } from '@/hooks/components/use-toast';
import { useGlobalInject } from '@/app/use-global-inject';

type IframeMessageHandleCb<T> = (data: T) => void;

interface MicroActivityHookOption {
  /** 全屏消息事件钩子 */
  fullScreenMessageHandler?: IframeMessageHandleCb<HxcGeneralIframeEventData>;
  /** 返回首页事件钩子 */
  halfScreenMessageHandler?: IframeMessageHandleCb<HxcGeneralIframeEventData>;
  /** 不支持 PC 端访问事件钩子 */
  onlyMobileMessageHandler?: IframeMessageHandleCb<HxcGeneralIframeEventData>;
  /** 强制全屏事件钩子 */
  forceFullScreenMessageHandler?: IframeMessageHandleCb<HxcGeneralIframeEventData>;
}

export const useMicroActivityHook = (hookOptions: MicroActivityHookOption) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const {
    fullScreenMessageHandler = () => {},
    halfScreenMessageHandler = () => {},
    onlyMobileMessageHandler = () => {},
    forceFullScreenMessageHandler = () => {},
  } = hookOptions;

  const { nickname } = storeDefinitionToRefs(useViewerStore);
  const watchCore = getWatchCore();

  /** iframe 主体 */
  const microActivityIframeRef = ref<HTMLIFrameElement | null>(null);

  /** iframe 链接 */
  const iframeUrl = ref('');

  /** 缓存 nickname */
  let cacheNickName = '';

  /** 请求设备权限钩子  */
  function requestDevicePermissionHandler(
    iframeEventData: HxcRequestDevicePermissionIframeEventData,
  ) {
    if (!MicroActivityDeviceMotion.$iframe) {
      const $iframe = unref(microActivityIframeRef);
      MicroActivityDeviceMotion.setIframe($iframe);
    }

    const enable = iframeEventData.data.enable === true;
    if (enable) {
      MicroActivityDeviceMotion.bindDeviceMotionEvent();
    } else {
      MicroActivityDeviceMotion.unbindDeviceMotionEvent();
    }
  }

  /**
   * iframe 消息监听钩子
   */
  function handleIframeMessage(event: MessageEvent) {
    if (!/game.polyv/.test(event.origin)) return;

    const watchCore = getWatchCore();
    watchCore.logger.info(LoggerName.MicroActivity, 'iframe-message', JSON.stringify(event.data));

    const eventData: HxcIframeEventData = event.data;
    const eventType = eventData.type;

    switch (eventType) {
      case MicroActivityIframeEventType.HXC_RESTORE_DEFAULT:
        fullScreenMessageHandler(eventData);
        break;
      case MicroActivityIframeEventType.HXC_DISABLE_PAGE_SCROLL:
        halfScreenMessageHandler(eventData);
        break;
      case MicroActivityIframeEventType.HXC_FORCE_FULL_SCREEN:
        forceFullScreenMessageHandler(eventData);
        break;
      case MicroActivityIframeEventType.HXC_ONLY_MOBILE:
        onlyMobileMessageHandler(eventData);
        break;
      case MicroActivityIframeEventType.HXC_REQUEST_DEVICE_PERMISSION:
        requestDevicePermissionHandler(eventData);
        break;
      default:
        break;
    }
  }

  /** 更新 iframe 链接 */
  async function updateIframeUrl() {
    try {
      // 当昵称不同时，需要重新获取 iframe 链接
      if (cacheNickName !== nickname.value || !iframeUrl.value) {
        const url = await watchCore.microActivity.getMicroActivityUrl();
        iframeUrl.value = url;
        cacheNickName = nickname.value;
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  onMounted(() => {
    window.addEventListener('message', handleIframeMessage, false);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleIframeMessage, false);
  });

  return {
    microActivityIframeRef,
    iframeUrl,

    updateIframeUrl,
  };
};
