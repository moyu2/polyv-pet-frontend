/**
 * @file 分享 store
 */
import { ref, computed, Ref, ComputedRef, unref } from 'vue';
import {
  DEFAULT_SHARE_QQ_ICON,
  DEFAULT_SHARE_QZONE_ICON,
  DEFAULT_SHARE_WEIBO_ICON,
} from '@/assets/constants/defaults';
import { translate } from '@/assets/lang';
import { concat as appendToURL } from '@polyv/utils/querystring';
import { changeProtocol } from '@polyv/utils/net';
import { defineStore } from 'pinia';
import { useChannelInfoStore } from './use-channel-info-store';
import { useThemeStore } from './use-theme-store';
import { usePlaybackStore } from './use-playback-store';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useWatchAppStore } from './use-watch-app-store';
import { PlvShareModule } from '@polyv/live-watch-sdk';

/** Web 分享平台枚举 */
enum WebShareType {
  /** QQ 分享 */
  QQ = 'qq',
  /** QQ 空间分享 */
  Qzone = 'qzone',
  /** 微博分享 */
  Weibo = 'weibo',
  /** facebook 分享 */
  Facebook = 'facebook',
  /** 推特分享 */
  Twitter = 'twitter',
}

/** Web 分享数据类型 */
type WebShareData = {
  /** 标题 */
  title: string;
  /** 类型 */
  type: WebShareType;
  /** 分享链接 */
  url: string;
  /** 图标地址 */
  icon: string;
};

/** 各分享平台需要的参数类型 */
type WebShareProvideParams = {
  [WebShareType.QQ]: Record<'url' | 'title' | 'desc' | 'source' | 'pics', string>;
  [WebShareType.Qzone]: Record<'url' | 'title' | 'site', string>;
  [WebShareType.Weibo]: Record<'url' | 'title' | 'pic', string>;
  [WebShareType.Facebook]: Record<'u', string>;
  [WebShareType.Twitter]: Record<'url' | 'text', string>;
};

/** 各分享平台的跳转地址 */
const WebShareRedirectUrl: Record<WebShareType, string> = {
  [WebShareType.QQ]: 'http://connect.qq.com/widget/shareqq/index.html',
  [WebShareType.Qzone]: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey',
  [WebShareType.Weibo]: 'https://service.weibo.com/share/share.php',
  [WebShareType.Facebook]: 'https://www.facebook.com/sharer/sharer.php',
  [WebShareType.Twitter]: 'https://twitter.com/intent/tweet',
};

export interface ShareStoreState {
  /** 分享按钮开关 */
  shareBtnEnabled: Ref<boolean>;
  /** 是否允许添加自定义分享参数 */
  customShareUrlAppendParamsEnabled: Ref<boolean>;
  /** 是否使用回放标题分享 */
  playbackShareTitleEnabled: Ref<boolean>;
  /** PC web 分享的观看地址 */
  shareWatchUrl: ComputedRef<string>;
  /** PC web 分享的观看地址二维码地址 */
  shareQrCodeUrl: ComputedRef<string>;
  /** QQ 分享跳转地址 */
  qqShareUrl: ComputedRef<string>;
  /** QQ 空间分享跳转地址 */
  qzoneShareUrl: ComputedRef<string>;
  /** 微博分享跳转地址 */
  weiboShareUrl: ComputedRef<string>;
  /** facebook 分享跳转地址 */
  facebookShareUrl: ComputedRef<string>;
  /** 推特分享跳转地址 */
  twitterShareUrl: ComputedRef<string>;
  /** PC web 分享列表 */
  webShareList: ComputedRef<WebShareData[]>;
  /** 一客一码--销售邀请的客户id */
  saleInviteCustomerId: Ref<string | null>;
  /** 邀请观看--分销员/邀请人id */
  inviteWatchSaleId: Ref<string | null>;
  /** 邀请观看上级邀请员的 inviteWatchSaleId */
  inviteWatchInviteSalesId: Ref<string | null>;
}

export interface ShareStoreAction {
  /** 同步 Store 数据 */
  syncShareStore: () => void;
  /** 补充分享参数到当前链接 */
  appendShareQueueParams: () => void;
  /** 生成 web 分享地址 */
  composeShareUrl: <T extends WebShareType>(
    webShareType: T,
    provideParams: WebShareProvideParams[T],
  ) => string;
}

/** 分享 store */
export interface ShareStore extends ShareStoreState, ShareStoreAction {}

export const useShareStore = defineStore<'share', ShareStore>('share', () => {
  const watchAppStore = useWatchAppStore();
  const channelInfoStore = useChannelInfoStore();
  const themeStore = useThemeStore();
  const playbackStore = usePlaybackStore();

  const { appendQueryParam } = useQueryParams();

  /** 分享设置 */
  const shareSetting = ref(PlvShareModule.generateDefaultShareSetting());

  /** 分享按钮开关 */
  const shareBtnEnabled = ref(false);

  /** 是否允许添加自定义分享参数 */
  const customShareUrlAppendParamsEnabled = ref(false);

  /** 是否使用回放标题分享 */
  const playbackShareTitleEnabled = ref(false);

  const shareBaseWatchUrl = ref('');

  /** 一客一码--销售邀请的客户id */
  const saleInviteCustomerId = ref<string | null>(null);

  /** 邀请观看--分销员/邀请人id */
  const inviteWatchSaleId = ref<string | null>(null);

  /** 邀请观看上级邀请员的inviteWatchSaleId */
  const inviteWatchInviteSalesId = ref<string | null>(null);

  /** PC web 分享的观看地址 */
  const shareWatchUrl = computed(() => {
    if (shareSetting.value.isUseCustomShareUrl && !customShareUrlAppendParamsEnabled.value) {
      return shareSetting.value.customShareUrl;
    }

    const playbackShareVid = playbackStore.getPlaybackShareId();

    return appendToURL(
      shareBaseWatchUrl.value,
      {
        playBackVid: playbackShareVid,
        inviteWatchSaleId: inviteWatchSaleId.value,
      },
      {
        ignoreEmpty: true,
      },
    );
  });

  /** PC web 分享的观看地址二维码地址 */
  const shareQrCodeUrl = computed<string>(() => {
    const watchCore = watchAppStore.getWatchCore();
    return watchCore.utils.generateQrcodeUrl(unref(shareWatchUrl));
  });

  /** QQ 分享跳转地址 */
  const qqShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.QQ, {
      url: unref(shareWatchUrl),
      title: channelInfoStore.channelTitle,
      source: channelInfoStore.channelTitle,
      desc: '', // qq 分享中描述过长会分享失败
      pics: changeProtocol(themeStore.channelCoverImg, 'http'), // qq 分享的图片需要协议头
    });
  });

  /** QQ 空间分享跳转地址 */
  const qzoneShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Qzone, {
      url: unref(shareWatchUrl),
      title: channelInfoStore.channelTitle,
      site: channelInfoStore.channelTitle,
    });
  });

  /** 微博分享跳转地址 */
  const weiboShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Weibo, {
      url: unref(shareWatchUrl),
      title: channelInfoStore.channelTitle,
      pic: themeStore.channelCoverImg,
    });
  });

  /** facebook 分享跳转地址 */
  const facebookShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Facebook, {
      u: unref(shareWatchUrl),
    });
  });

  /** 推特分享跳转地址 */
  const twitterShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Twitter, {
      url: unref(shareWatchUrl),
      text: channelInfoStore.channelTitle,
    });
  });

  /** 分享列表 */
  const webShareList = computed<WebShareData[]>(() => {
    return [
      {
        title: translate('share.QQ'),
        type: WebShareType.QQ,
        url: unref(qqShareUrl),
        icon: DEFAULT_SHARE_QQ_ICON,
      },
      {
        title: translate('share.QZone'),
        type: WebShareType.Qzone,
        url: unref(qzoneShareUrl),
        icon: DEFAULT_SHARE_QZONE_ICON,
      },
      {
        title: translate('share.weibo'),
        type: WebShareType.Weibo,
        url: unref(weiboShareUrl),
        icon: DEFAULT_SHARE_WEIBO_ICON,
      },
    ];
  });

  /**
   * 生成分享类型
   * @param webShareType 分享类型
   * @param provideParams 传入参数
   */
  function composeShareUrl<T extends WebShareType>(
    webShareType: T,
    provideParams: WebShareProvideParams[T],
  ): string {
    const baseUrl = WebShareRedirectUrl[webShareType];
    return appendToURL(baseUrl, provideParams);
  }

  function syncShareStore() {
    const watchCore = watchAppStore.getWatchCore();

    const __shareSetting = watchCore.share.getShareSetting();

    shareSetting.value = __shareSetting;
    shareBtnEnabled.value = __shareSetting.shareEnabled;
    customShareUrlAppendParamsEnabled.value = __shareSetting.customShareUrlAppendParamsEnabled;
    playbackShareTitleEnabled.value = __shareSetting.playbackShareTitleEnabled;

    shareBaseWatchUrl.value = watchCore.share.getShareWatchUrl();

    saleInviteCustomerId.value = watchCore.saleInvite.getSaleInviteCustomerId();

    inviteWatchSaleId.value = watchCore.user.getInviteWatchSaleId();
    inviteWatchInviteSalesId.value = watchCore.user.getInviteWatchInviteSalesId();
  }

  /**
   * 补充分享参数到当前链接
   */
  function appendShareQueueParams() {
    const params: Parameters<typeof appendQueryParam>[0] = {};

    if (saleInviteCustomerId.value) {
      params.inviteCustomerId = saleInviteCustomerId.value;
    }

    if (inviteWatchSaleId.value) {
      params.inviteWatchSaleId = inviteWatchSaleId.value;
    }

    appendQueryParam(params);
  }

  return {
    shareBtnEnabled,
    customShareUrlAppendParamsEnabled,
    playbackShareTitleEnabled,
    saleInviteCustomerId,
    inviteWatchSaleId,
    inviteWatchInviteSalesId,
    shareWatchUrl,
    shareQrCodeUrl,
    qqShareUrl,
    qzoneShareUrl,
    weiboShareUrl,
    facebookShareUrl,
    twitterShareUrl,
    webShareList,

    syncShareStore,
    composeShareUrl,

    appendShareQueueParams,
  };
});
