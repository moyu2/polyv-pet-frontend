import { openLink } from '@/assets/utils/url';
import { ref } from 'vue';
import { navigateToLink, formatLink, type LinkData, LinkJumpWay } from '@polyv/utils/external-link';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { useWeixinButton } from '@/hooks/platform/use-weixin/use-weixin-button';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';
import { isMobile } from '@/assets/utils/browser';
import { useToast } from '@polyv/vue-components';
import { translate } from '@/assets/lang';
import { useQueryParams } from '@/hooks/core/use-query-params';

/**
 * 横幅广告、图标广告、片头广告、暂停广告外链跳转逻辑
 */
export const useAdvert = (options: { getLinkData: () => LinkData | null }) => {
  const { getLinkParams } = useIarExternalLinkParams();

  const iframeVisible = ref(false);
  const iframeUrl = ref('');

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
        wxMiniprogramLink: formatLink(linkData.wxMiniprogramLink, getLinkParams),
        classKey: 'plv-page-advert',
      };
    },
  });

  async function isWeixinButton() {
    const linkData = options.getLinkData();
    if (!linkData) return false;

    const isWxMiniProgramWebview = await checkWxMiniProgramWebview();
    // 小程序 webview 内使用原生 sdk 功能跳转
    if (isWxMiniProgramWebview) {
      return false;
    }

    return supportWxOpenLaunchWebApp.value && !!linkData.wxMiniprogramOriginalId;
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
        iframeVisible.value = true;
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

  function handleAdvertClick() {
    try {
      const linkData = options.getLinkData();
      console.info('链接数据源是什么', linkData);
      console.info('isMobile', isMobile);
      console.info('isPlvWebview', isPlvWebview.value);
      if (!linkData) return;

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
      console.error('跳转广告链接错误：', error);
    }
  }

  return {
    iframeVisible,
    iframeUrl,
    weixinBtnRef,

    isWeixinButton,
    handleAdvertClick,
    supportWxOpenLaunchWebApp,
    checkWxMiniProgramWebview,
    supportWxMiniProgramNavigateTo,
  };
};
