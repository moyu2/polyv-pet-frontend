import { navigateToLink, formatLink, type LinkData, LinkJumpWay } from '@polyv/utils/external-link';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWeixinButton } from '../use-weixin/use-weixin-button';
import { openLink } from '@/assets/utils/url';
import { isMobile } from '@/assets/utils/browser';
import { plvInterval } from '@polyv/live-watch-sdk';
import { useToast } from '@polyv/vue-components';
import { translate } from '@/assets/lang';
import { useQueryParams } from '@/hooks/core/use-query-params';

/**
 * 处理多平台链接跳转
 * @param options
 */
export const useMultiPlatformLink = (options: {
  /** 获取链接拼接的参数 */
  getLinkParams: () => UniversalParams;
  /** 获取多平台链接配置数据 */
  getLinkData: () => LinkData | null;
  /** 半弹窗跳转方式的回调方法 */
  popUpJumpHandler: (url: string) => void;
  /** 微信小程序跳转按钮的样式 key，便于后续区分 */
  wxBtnClassKey: string;
}) => {
  const { getPlvWebviewBridge } = useWebviewStore();
  const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
  const { toast } = useToast();
  const { paramGetter } = useQueryParams();

  const {
    supportWxOpenLaunchWebApp,
    weixinBtnRef,

    checkWxMiniProgramWebview,
    toWxMiniProgram,
    supportWxMiniProgramNavigateTo,
  } = useWeixinButton({
    getButtonOptions: () => {
      const linkData = options.getLinkData();
      if (!linkData) return undefined;

      return {
        wxMiniprogramOriginalId: linkData.wxMiniprogramOriginalId,
        wxMiniprogramLink: formatLink(linkData.wxMiniprogramLink, options.getLinkParams),
        classKey: options.wxBtnClassKey,
      };
    },
  });

  /**
   * 根据跳转方式打开链接
   * @param url 链接
   * @param jumpWay 跳转方式，默认新窗口打开
   */
  function openJumpWayLink(url: string, jumpWay: LinkJumpWay) {
    switch (jumpWay) {
      case LinkJumpWay.CurrentWindow:
        window.location.href = url;
        break;
      case LinkJumpWay.PopUp:
        options.popUpJumpHandler(url);
        break;
      case LinkJumpWay.NewWindow: {
        if (isPlvWebview.value) {
          window.location.href = url;
        } else {
          openLink(url);
        }
        break;
      }
      default:
        openLink(url);
    }
  }

  function handleMultiPlatformLinkType() {
    try {
      const linkData = options.getLinkData();
      if (!linkData) return;

      navigateToLink({
        linkData,
        getLinkParams: options.getLinkParams,
        openLink: openJumpWayLink,
        isMobile: () => isMobile,
        isPlvWebview: () => isPlvWebview.value,
        getPlvWebviewBridge: () => new Promise(resolve => resolve(getPlvWebviewBridge())),
        getPlvWebviewSmallWindowSize: () => plvWebviewDataSize.value,
        isWxMiniProgramEnv: supportWxMiniProgramNavigateTo,
        toWxMiniProgram,
        getIsApp: () => paramGetter().isApp(),
        failCallback: () => {
          toast.warning(translate('externalLink.navigateFail'));
        },
      });
    } catch (error) {
      console.error('handleMultiPlatformLinkType', error);
    }
  }

  const getWeixinBtnSetupEnabled = async () => {
    const linkData = options.getLinkData();
    if (!linkData) return false;

    const isWxMiniProgramWebview = await checkWxMiniProgramWebview();
    // 小程序 webview 内使用原生 sdk 功能跳转
    if (isWxMiniProgramWebview) {
      return false;
    }

    return supportWxOpenLaunchWebApp.value && !!linkData.wxMiniprogramOriginalId;
  };

  return {
    getWeixinBtnSetupEnabled,
    weixinBtnRef,

    handleMultiPlatformLinkType,
  };
};

export const useMultiPlatformLinkHelper = (options: {
  setWeixinBtnRef: (dom: HTMLElement) => void;
  getWeixinBtnSetupEnabled: () => Promise<boolean>;
  weixinBtnSelector: string;
}) => {
  let pollingTimer: ReturnType<typeof plvInterval> | null = null;

  function clearPolling() {
    if (pollingTimer) {
      pollingTimer.clear();
      pollingTimer = null;
    }
  }

  async function hackWeixinBtnSetup() {
    const weixinBtnSetupEnabled = await options.getWeixinBtnSetupEnabled();
    if (!weixinBtnSetupEnabled || !options.weixinBtnSelector) return;

    const weixinBtnSelector = options.weixinBtnSelector;

    // 延迟一下，确保外部 hack 的占位 dom 节点有加载
    pollingTimer = plvInterval(
      () => {
        const $hackWeixinBtn = document.querySelector(weixinBtnSelector);

        if ($hackWeixinBtn) {
          clearPolling();
          // 设置值的时候，会自动去创建对应的微信开放标签
          options.setWeixinBtnRef($hackWeixinBtn as HTMLElement);
        }
      },
      100,
      { maxCount: 10 },
    );
  }

  return {
    hackWeixinBtnSetup,
  };
};
