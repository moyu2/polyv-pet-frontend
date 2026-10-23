import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { appendUrl, fitProtocol } from '@/assets/utils/url';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { appEvents } from '@/app/app-events';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useShareStore } from '@/store/use-share-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { WxShareUrlParams, useWeixinStore } from '@/store/use-weixin-store';
import { LoggerName, PolyvWatchCore, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { computed, unref } from 'vue';
import { useWeixinSdk } from './use-weixin-sdk';
import type { WxShareConfigInfo } from './types';

import { useWebsiteInfo } from '@/hooks/platform/use-browser/use-website-info';
import { useOgMeta } from '@/hooks/platform/use-browser/use-og-meta';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';

/**
 * @hook 微信分享
 * */
export const useWeixinShare = (opts?: { watchCore: PolyvWatchCore }) => {
  const { updateOgMeta } = useOgMeta();
  const { setFavIconElem } = useWebsiteInfo();
  const { getWeixinSdk } = useWeixinSdk();

  const themeStore = useThemeStore();
  const shareStore = useShareStore();
  const weixinStore = useWeixinStore();
  const playbackStore = usePlaybackStore();
  const watchAppStore = useWatchAppStore();
  const feedInjectStore = useFeedInjectStore();

  const { getWatchCore, getEmitter } = useMultiPolyvWatchApp();
  const watchCore = opts?.watchCore || getWatchCore();

  /** 微信分享中的分享标题 */
  const wxShareTitle = computed(() => {
    const shareInfo = weixinStore.wxShareInfo;
    const defaultShareTitle = shareInfo.shareTitle;

    if (watchAppStore.isPlaybackWatchUrl) {
      return watchAppStore.playbackWatchBasicInfo.videoName || defaultShareTitle;
    }

    if (ynToBool(shareInfo.isUseWxShareUrl, YN.N)) {
      return defaultShareTitle;
    }

    if (shareStore.playbackShareTitleEnabled && playbackStore.currentPlaybackTarget) {
      return playbackStore.currentPlaybackTarget.title;
    }

    return defaultShareTitle;
  });

  /** 微信分享中的分享地址 */
  const wxShareUrl = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl) {
      return watchCore.domain.processRandomHostname(window.location.href);
    }

    if (weixinStore.wxCustomShareUrl) {
      return weixinStore.wxCustomShareUrl;
    }

    const url = appendUrl<WxShareUrlParams>(window.location.href, weixinStore.wxShareUrlParams, {
      forbiddenFields: ['snapshotPage'],
    });
    return watchCore.domain.processRandomHostname(url);
  });

  /** 隐藏微信分享 */
  async function hideWeixinShare() {
    const wx = await getWeixinSdk();
    wx && wx.hideAllNonBaseMenuItem();
  }

  function updateBrowserInfo(shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption) {
    updateOgMeta(shareOptions);
    // setTitle(shareOptions.title);
    setFavIconElem(shareOptions.imgUrl);
  }

  /**
   * 更新微信分享配置
   */
  async function updateWxShareConfig(shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption) {
    if (isBuildForFeedMainMode()) return;

    updateBrowserInfo(shareOptions);

    const wx = await getWeixinSdk();

    if (!wx) {
      console.warn('window.wx is not exist, will use default behavior');
      return;
    }

    // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
    wx.updateAppMessageShareData({
      ...shareOptions,
      success() {
        console.info('Wx sdk: updateAppMessageShareData success');
      },
      fail(e) {
        console.info(
          'updateAppMessageShareData shareOptions',
          JSON.stringify(shareOptions),
          JSON.stringify(e),
        );
        watchCore.logger.error(
          LoggerName.Weixin,
          'update-app-message-share-fail',
          JSON.stringify(e),
        );
      },
    });

    // 自定义“分享到朋友圈”及“分享到 QQ 空间”按钮的分享内容
    wx.updateTimelineShareData({
      ...shareOptions,
      success() {
        console.info('Wx sdk: updateTimelineShareData success');
      },
      fail(e) {
        console.info(
          'updateTimelineShareData shareOptions',
          JSON.stringify(shareOptions),
          JSON.stringify(e),
        );
        watchCore.logger.error(LoggerName.Weixin, 'update-timeline-share-fail', JSON.stringify(e));
      },
    });
  }

  /**
   * 更新企业微信分享配置
   */
  async function updateWorkWxShareConfig(
    shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption,
  ) {
    if (isBuildForFeedMainMode()) return;
    updateBrowserInfo(shareOptions);

    const wx = await getWeixinSdk();

    if (!wx) {
      console.warn('window.wx is not exist, will use default behavior');
      return;
    }

    // 自定义转发
    wx.onMenuShareAppMessage &&
      wx.onMenuShareAppMessage({
        ...shareOptions,
        success() {
          console.info('Wx sdk: onMenuShareAppMessage success');
        },
        fail(e) {
          console.info('onMenuShareAppMessage shareOptions', JSON.stringify(shareOptions));
          watchCore.logger.error(
            LoggerName.Weixin,
            'on-menu-share-app-message-fail',
            JSON.stringify(e),
          );
        },
      });

    wx.onMenuShareWechat &&
      wx.onMenuShareWechat({
        ...shareOptions,
        success() {
          console.info('Wx sdk: onMenuShareWechat success');
        },
        fail(e) {
          console.info('onMenuShareWechat shareOptions', JSON.stringify(shareOptions));
          watchCore.logger.error(
            LoggerName.Weixin,
            'on-menu-share-share-wechat-fail',
            JSON.stringify(e),
          );
        },
      });

    // 自定义分享到微信朋友圈
    wx.onMenuShareTimeline &&
      wx.onMenuShareTimeline({
        ...shareOptions,
        success() {
          console.info('Wx sdk: onMenuShareTimeline success');
        },
        fail(e) {
          console.info('onMenuShareTimeline shareOptions', JSON.stringify(shareOptions));
          watchCore.logger.error(
            LoggerName.Weixin,
            'on-menu-share-timeline-fail',
            JSON.stringify(e),
          );
        },
      });
  }

  /** 设置微信分享 */
  async function configureWeixinShare() {
    const shareInfo = weixinStore.wxShareInfo;

    const imgUrl = shareInfo.weixinShareCoverImg || themeStore.channelCoverImg;

    const shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption = {
      title: wxShareTitle.value,
      desc: shareInfo.shareDesc || '',
      link: unref(wxShareUrl),
      imgUrl: fitProtocol(imgUrl),
    };

    // feed-inject 模式下，将微信分享信息回调给外部容器，由外部容器自行配置微信分享
    if (isBuildForFeedMainMode()) {
      return emitShareConfigToExternalContainer(shareOptions);
    }

    // 后台没开启分享开关，隐藏微信分享
    if (!shareStore.shareBtnEnabled) {
      return hideWeixinShare();
    }

    console.info('weixin shareOptions', JSON.parse(JSON.stringify(shareOptions)));

    if (isWeixin) {
      await updateWxShareConfig(shareOptions);
      return;
    }

    if (isWorkWeixin) {
      await updateWorkWxShareConfig(shareOptions);
    }
  }

  /**
   * 将微信分享配置信息回调给外部容器（仅 feed-inject 模式）
   */
  function emitShareConfigToExternalContainer(
    shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption,
  ) {
    const shareConfigInfo: WxShareConfigInfo = {
      shareEnabled: weixinStore.wxSdkFeatureEnabled && shareStore.shareBtnEnabled,
      ...shareOptions,
    };

    feedInjectStore.$patch({
      feedWxShareInfo: shareConfigInfo,
    });
    getEmitter().emit(appEvents.global.WxShareConfigChange, shareConfigInfo);
  }

  return {
    wxShareUrl,
    hideWeixinShare,
    configureWeixinShare,
  };
};
