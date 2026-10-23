import { translate } from '@/assets/lang';
import { openLink } from '@/assets/utils/url';
import { PropUtils, VueProps } from '@polyv/vue-components';
import { ChannelMenuIframeOpenType, plvInterval, plvParseJson } from '@polyv/live-watch-sdk';
import { computed, onMounted, ref, watch } from 'vue';
import { formatLink, type LinkData, LinkJumpWay } from '@polyv/utils/external-link';
import { useIarExternalLinkParams } from '../interactive-receive/use-iar-external-link-params';
import { useMultiPlatformLink } from '@/hooks/platform/use-multi-platform-link/use-multi-platform-link';
import { omit } from 'lodash-es';
import { useWebviewStore } from '@/store/use-webview-store';

export const promoteExternalLinkProps = () => ({
  /** iframe 链接地址或者 json 配置 */
  content: PropUtils.string.def(''),
  /** iframe 打开方式 */
  openType: PropUtils.enum<ChannelMenuIframeOpenType>().def(undefined),
  /** 是否激活 */
  isActive: PropUtils.bool.def(false),
  /** 链接类型 */
  linkType: PropUtils.number.def(),
  /** 微信按钮选择器 */
  weixinBtnSelector: PropUtils.string.def(),
});

/**
 * @hook 推广链接组件 Hook
 */
export const usePromoteExternalLinkHook = (options: {
  props: VueProps<typeof promoteExternalLinkProps>;
}) => {
  const { props } = options;

  const { getLinkParams } = useIarExternalLinkParams();

  const webviewStore = useWebviewStore();

  const tips = computed(() => {
    return translate('promote.external.link.tips');
  });

  const finalLinkType = computed(() => {
    const linkType = props.linkType;
    if (!linkType) {
      // 英文菜单在 props.linkType 为空，从 props.content 里取 linkType
      const { success, data } = plvParseJson<LinkData & { mobileLink: string; linkType: number }>(
        props.content,
      );
      if (success) return data.linkType;
    }
    return linkType;
  });

  /** 强制页内展示 */
  const forceOpenInMenu = ref(false);

  /** iframe 地址 */
  const iframeUrl = ref('');

  function generateDefaultLinkData(): LinkData {
    return {
      jumpWay: LinkJumpWay.NewWindow,
      link: '',
      pcLink: '',
      mobileAppLink: '',
      androidLink: '',
      iosLink: '',
      harmonyLink: '',
      wxMiniprogramOriginalId: '',
      wxMiniprogramAppId: '',
      wxMiniprogramLink: '',
    };
  }

  function getLinkData() {
    const { success, data } = plvParseJson<LinkData & { mobileLink: string; linkType: number }>(
      props.content,
    );
    if (!success) {
      console.error('getLinkData parse error');
      return null;
    }

    // 旧数据配置了通用链接，则多平台链接全部失效
    if (data.linkType === 10) {
      return {
        ...generateDefaultLinkData(),
        jumpWay: data.jumpWay,
        pcLinkJumpWay: data.pcLinkJumpWay || data.jumpWay,
        mobileAppLinkJumpWay: data.mobileAppLinkJumpWay || data.jumpWay,
        link: data.link || '',
      };
    }

    const finalData = omit(data, ['mobileLink', 'linkType']);
    // 旧数据只配置多平台，要把手机端链接放到浏览器链接里使用
    if (data.linkType === 11 && !data.link) {
      finalData.link = data.mobileLink;
    }

    return finalData;
  }

  const { getWeixinBtnSetupEnabled, weixinBtnRef, handleMultiPlatformLinkType } =
    useMultiPlatformLink({
      getLinkParams,
      getLinkData,
      wxBtnClassKey: 'promote',
      popUpJumpHandler: url => {
        forceOpenInMenu.value = true;
        iframeUrl.value = url;
      },
    });

  const isOpenInMenu = computed(() => {
    return (
      !props.openType ||
      props.openType === ChannelMenuIframeOpenType.MenuDisplay ||
      forceOpenInMenu.value
    );
  });

  function getPromoteGeneralLinkUrl() {
    if (!props.linkType || props.linkType === 10) {
      return formatLink(props.content, getLinkParams);
    }

    return '';
  }

  function handleGeneralLinkType() {
    const promoteLinkUrl = getPromoteGeneralLinkUrl();
    console.info('执行通用链接', promoteLinkUrl);
    if (!promoteLinkUrl) return;

    console.info('isOpenInMenu', isOpenInMenu.value);
    if (isOpenInMenu.value) {
      iframeUrl.value = promoteLinkUrl;
      return;
    }

    console.info('props.openType', props.openType);
    if (props.openType === ChannelMenuIframeOpenType.NewPage) {
      if (webviewStore.isPlvWebview) {
        window.location.href = promoteLinkUrl;
      } else {
        openLink(promoteLinkUrl);
      }
      return;
    }

    if (props.openType === ChannelMenuIframeOpenType.CurrentPage) {
      window.location.href = promoteLinkUrl;
    }
  }

  watch(
    () => props.isActive,
    isActive => {
      console.info('进入激活状态', props.isActive);
      console.info('linkType', props.linkType);
      if (!isActive) return;

      // 处理通用链接
      if (!finalLinkType.value || finalLinkType.value === 10) {
        handleGeneralLinkType();
        return;
      }

      // 处理多平台链接
      if (finalLinkType.value === 11) {
        handleMultiPlatformLinkType();
      }
    },
    {
      immediate: true,
    },
  );

  let pollingTimer: ReturnType<typeof plvInterval> | null = null;

  function clearPolling() {
    if (pollingTimer) {
      pollingTimer.clear();
      pollingTimer = null;
    }
  }

  async function hackWeixinBtnSetup() {
    const weixinBtnSetupEnabled = await getWeixinBtnSetupEnabled();
    if (!weixinBtnSetupEnabled || !props.weixinBtnSelector) return;

    // 延迟一下，确保外部 hack 的占位 dom 节点有加载
    pollingTimer = plvInterval(
      () => {
        const $hackWeixinBtn = document.querySelector(props.weixinBtnSelector);

        if ($hackWeixinBtn) {
          clearPolling();
          // 设置值的时候，会自动去创建对应的微信开放标签
          weixinBtnRef.value = $hackWeixinBtn as HTMLDivElement;
        }
      },
      100,
      { maxCount: 10 },
    );
  }

  onMounted(() => {
    if (finalLinkType.value === 11) {
      hackWeixinBtnSetup();
    }
  });

  return {
    tips,

    iframeUrl,
    isOpenInMenu,

    handleGeneralLinkType,
  };
};
