import { LiveSquare, plvInterval } from '@polyv/live-watch-sdk';
import { ref, computed } from 'vue';
import { navigateToLink, formatLink, type LinkData, LinkJumpWay } from '@polyv/utils/external-link';
import { openLink } from '@/assets/utils/url';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';
import { isMobile } from '@/assets/utils/browser';
import { useWeixinButton } from '@/hooks/platform/use-weixin/use-weixin-button';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useToast } from '@polyv/vue-components';
import { translate } from '@/assets/lang';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useThemeStore } from '@/store/use-theme-store';
import { ynToBool } from '@polyv/utils/boolean';

export type liveSquareConfig = Exclude<LiveSquare, 'enabled' | 'title'>;

function useLiveSquare() {
  const { liveSquareConfig } = storeDefinitionToRefs(useThemeStore);

  /** 直播广场是否开启 */
  const liveSquareEnabled = computed(() => {
    return liveSquareConfig.value ? ynToBool(liveSquareConfig.value.enabled) : false;
  });

  /** 直播广场标题 */
  const liveSquareTitle = computed(() => {
    return liveSquareConfig.value ? liveSquareConfig.value.title : '';
  });

  const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);

  const showWeixinBtn = ref(false);

  /** 强制页内展示 */
  const forceOpenInMenu = ref(false);
  /** iframe 地址 */
  const iframeUrl = ref('');

  const { getPlvWebviewBridge } = useWebviewStore();
  const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
  const { getLinkParams } = useIarExternalLinkParams();
  const { paramGetter } = useQueryParams();
  const { toast } = useToast();

  // 微信按钮功能
  const {
    supportWxOpenLaunchWebApp,
    weixinBtnRef,
    checkWxMiniProgramWebview,
    toWxMiniProgram,
    supportWxMiniProgramNavigateTo,
  } = useWeixinButton({
    getButtonOptions: () => {
      const linkData = getLinkData();
      if (!linkData) return undefined;

      return {
        wxMiniprogramOriginalId: linkData.wxMiniprogramOriginalId,
        wxMiniprogramLink: formatLink(linkData.wxMiniprogramLink, getLinkParams),
        classKey: 'live-square',
      };
    },
  });

  function getLinkData(): LinkData | null {
    if (!liveSquareConfig.value) {
      return null;
    }

    // 普通链接类型
    const data = {
      link: liveSquareConfig.value.link,
      jumpWay: (liveSquareConfig.value.jumpWay as LinkJumpWay) || LinkJumpWay.NewWindow,
      pcLink: liveSquareConfig.value.pcLink,
      pcLinkJumpWay: (liveSquareConfig.value.pcLinkJumpWay as LinkJumpWay) || LinkJumpWay.NewWindow,
      mobileAppLink: liveSquareConfig.value.mobileAppLink,
      mobileAppLinkJumpWay:
        (liveSquareConfig.value.mobileAppLinkJumpWay as LinkJumpWay) || LinkJumpWay.NewWindow,
      androidLink: liveSquareConfig.value.androidLink,
      iosLink: liveSquareConfig.value.iosLink,
      harmonyLink: liveSquareConfig.value.harmonyLink,
      wxMiniprogramOriginalId: liveSquareConfig.value.wxMiniprogramOriginalId,
      wxMiniprogramAppId: liveSquareConfig.value.wxMiniprogramAppId,
      wxMiniprogramLink: liveSquareConfig.value.wxMiniprogramLink,
    };

    // 旧数据配置了通用链接，则多平台链接全部失效
    if (liveSquareConfig.value.linkType === '10') {
      data.pcLink = '';
      data.mobileAppLink = '';
      data.androidLink = '';
      data.iosLink = '';
      data.harmonyLink = '';
      data.wxMiniprogramOriginalId = '';
      data.wxMiniprogramAppId = '';
      data.wxMiniprogramLink = '';
    }

    // 旧数据只配置多平台，要把手机端链接放到浏览器链接里使用
    if (liveSquareConfig.value.linkType === '11' && !data.link) {
      data.link = liveSquareConfig.value.mobileLink;
    }

    return data;
  }

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
        forceOpenInMenu.value = true;
        iframeUrl.value = url;
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
      const linkData = getLinkData();
      if (!linkData) {
        console.warn('handleMultiPlatformLinkType: linkData is null');
        return;
      }

      navigateToLink({
        linkData,
        getLinkParams,
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
      console.error('handleMultiPlatformLinkType error:', error);
    }
  }

  function handleGeneralLinkType() {
    if (!liveSquareConfig.value?.link) return;

    const promoteLinkUrl = formatLink(liveSquareConfig.value.link, getLinkParams);
    if (!promoteLinkUrl) return;

    const jumpWay = (liveSquareConfig.value.jumpWay as LinkJumpWay) || LinkJumpWay.NewWindow;
    openJumpWayLink(promoteLinkUrl, jumpWay);
  }

  function handleLiveSquareClick() {
    if (!liveSquareConfig.value) {
      console.warn('handleLiveSquareClick: liveSquareConfig is null');
      return;
    }

    handleMultiPlatformLinkType();
  }

  /** 是否需要在弹窗中打开 */
  const isOpenInPopup = computed(() => {
    return forceOpenInMenu.value;
  });

  /** 重置弹窗状态 */
  function resetPopupState() {
    forceOpenInMenu.value = false;
    iframeUrl.value = '';
  }

  /** 获取微信按钮设置是否启用 */
  const getWeixinBtnSetupEnabled = async () => {
    const linkData = getLinkData();
    if (!linkData) return false;

    const isWxMiniProgramWebview = await checkWxMiniProgramWebview();
    // 小程序 webview 内使用原生 sdk 功能跳转
    if (isWxMiniProgramWebview) {
      return false;
    }

    return supportWxOpenLaunchWebApp.value && !!linkData.wxMiniprogramOriginalId;
  };

  let pollingTimer: ReturnType<typeof plvInterval> | null = null;

  function clearPolling() {
    if (pollingTimer) {
      pollingTimer.clear();
      pollingTimer = null;
    }
  }

  /** 设置微信按钮hack逻辑 */
  async function hackWeixinBtnSetup(weixinBtnSelector?: string) {
    const weixinBtnSetupEnabled = await getWeixinBtnSetupEnabled();
    if (!weixinBtnSetupEnabled || !weixinBtnSelector) return;

    // 延迟一下，确保外部 hack 的占位 dom 节点有加载
    pollingTimer = plvInterval(
      () => {
        const $hackWeixinBtn = document.querySelector(weixinBtnSelector);

        if ($hackWeixinBtn) {
          clearPolling();
          // 设置值的时候，会自动去创建对应的微信开放标签
          weixinBtnRef.value = $hackWeixinBtn as HTMLDivElement;
          showWeixinBtn.value = true;
        }
      },
      100,
      { maxCount: 10 },
    );
  }

  const isShowLiveSquare = computed(() => {
    return liveSquareEnabled.value && !showLiveCountDown.value && liveSquareTitle.value !== '';
  });

  // onMounted(() => {
  //   if (liveSquareConfig.value?.linkType === String(LinkType.MultiPlatform)) {
  //     // 这里可以根据需要传入微信按钮选择器
  //     // hackWeixinBtnSetup('.live-square-weixin-btn');
  //   }
  // });

  return {
    liveSquareTitle,
    liveSquareConfig,
    isShowLiveSquare,
    handleLiveSquareClick,
    handleGeneralLinkType,
    iframeUrl,
    isOpenInPopup,
    resetPopupState,

    // 微信按钮相关
    getWeixinBtnSetupEnabled,
    weixinBtnRef,
    hackWeixinBtnSetup,
    supportWxOpenLaunchWebApp,
    checkWxMiniProgramWebview,
    toWxMiniProgram,
    supportWxMiniProgramNavigateTo,
    showWeixinBtn,
  };
}

export default useLiveSquare;
