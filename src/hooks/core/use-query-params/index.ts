/**
 * @file 当前观看页地址上的参数
 */

import type {
  ChannelWatchPageSkin,
  MobileWatchLayout,
  PlaybackType,
  YN,
  ZoneType,
} from '@polyv/live-watch-sdk';
import { parse, concat as appendToURL } from '@polyv/utils/querystring';
import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvWatchAppClass } from '@/plugins/sdk-inject-helper';
import { isInjectByExternalApp } from '@/assets/utils/utils';

/** 获取地址栏上的参数 */
export const getUrlQueryParams = (): UniversalParams<string | string[] | undefined> => {
  return parse(window.location.search && window.location.search.slice(1)) || {};
};

export const useQueryParams = (opts?: {
  getPolyvWatchAppLoader: () => () => PolyvWatchAppClass | undefined;
}) => {
  const { getPolyvWatchAppLoader } = opts || {
    getPolyvWatchAppLoader: () => useGlobalInject().getPolyvWatchApp,
  };

  const getPolyvWatchApp = getPolyvWatchAppLoader();

  /** 获取参数值 */
  function getQueryParams(): UniversalParams<string | string[] | undefined> {
    const plvWatchApp = getPolyvWatchApp();

    if (!plvWatchApp) {
      console.warn('当前 PolyvWatchApp 未创建，将直接使用 url 参数');
      return getUrlQueryParams();
    }

    return plvWatchApp.getStoreMap().queryParams || {};
  }

  /** 设置 queryParams */
  function __setQueryParams(
    params: UniversalParams<string | string[] | undefined>,
    options?: { reset: boolean },
  ) {
    const { reset = false } = options || {};
    const plvWatchApp = getPolyvWatchApp();

    if (!plvWatchApp) {
      throw new Error('__setQueryParams error for plvWatchApp');
    }

    if (reset) {
      plvWatchApp.resetQueryParams(params);
    } else {
      plvWatchApp.setQueryParams(params);
    }
  }

  /**
   * 获取当前观看页地址上的所有参数的对象
   * @desc 如果从地址上获取不到，会从默认值中获取，如果默认值也获取不到，则返回 undefined
   * */
  function __getQueryParamItem(key: string): string | undefined {
    const __formatResult = (result: string | string[] | undefined) => {
      if (typeof result !== 'undefined') {
        if (Array.isArray(result)) {
          console.warn(`${key} 的值为数组，当前仅返回数组中的第一个元素`);
          return result[0];
        }
        return result;
      }
    };

    return __formatResult(getQueryParams()[key]);
  }

  const buildGetters = <T extends string = string>(key: string) => {
    return (): T | undefined => {
      return __getQueryParamItem(key) as T | undefined;
    };
  };

  /** 兼容 pathname 中出现多个 / 的情况 */
  function getLocationPathName() {
    return window.location.pathname.replace(/\/+/g, '/');
  }

  function replaceHistoryState({ url }: { url: string }) {
    if (isInjectByExternalApp()) {
      // console.log('replaceHistoryState', url);
      return;
    }

    if (url === window.location.href) return;

    try {
      if (window.history.replaceState) {
        window.history.replaceState(null, document.title, url);
      } else {
        window.location.href = url;
      }
    } catch (error) {
      // 可能会出现 url 非同源错误
      console.error('replaceHistoryState error', error);
      window.location.href = url;
    }
  }

  type ParamGetterType = ReturnType<typeof paramGetter>;

  type QueryParamsKeyType = keyof ParamGetterType;

  /**
   * 参数获取器
   * @desc 需要获取地址上的参数都必须通过该获取器获取
   */
  const paramGetter = () => ({
    // ===========  polyv sdk 外链参数 ===========

    /** 互动功能 sdk 层 js 地址 */
    interactionSdkScriptUrl: buildGetters('interactionSdkScriptUrl'),
    /** 直播播放器 js 地址 */
    livePlayerScriptUrl: buildGetters('livePlayerScriptUrl'),
    /** 无延迟直播播放器 js 地址 */
    liveLowLatencyPlayerScriptUrl: buildGetters('liveLowLatencyPlayerScriptUrl'),
    /** 点播播放器 js 地址 */
    vodPlayerScriptUrl: buildGetters('vodPlayerScriptUrl'),
    /** 连麦 sdk js 地址 */
    rtcWebScriptUrl: buildGetters('rtcWebScriptUrl'),
    /** 聊天室功能 sdk 层 js 地址 */
    chatSdkScriptUrl: buildGetters('chatSdkScriptUrl'),

    // ===========  业务参数 ===========

    forceSplashPage: buildGetters<YN>('forceSplashPage'),

    /** 信息流页面Id */
    infoFeedFlowPageId: buildGetters<'string'>('infoFeedFlowPageId'),
    /** 页面 id（聚合页跳转场景由 URL query `pageId` 透传） */
    pageId: buildGetters<string>('pageId'),
    /** 页面类型：aggregate/feed/watch（聚合页跳转场景由 URL query `pageType` 透传） */
    pageType: buildGetters<string>('pageType'),
    /** 不需要互动功能 */
    notNeedIar: buildGetters<YN>('notNeedIar'),
    /** 是否需要微信 SDK 功能 */
    wxSdkFeatureEnabled: buildGetters<YN>('wxSdkFeatureEnabled'),
    /** 观看页初始状态，用于 webview-feed 和 web-feed */
    watchPageInitStatus: buildGetters<'active' | 'inactive'>('watchPageInitStatus'),
    /** 被某种方式嵌入使用，目前仅用于 web-feed' 处理 */
    combinedBy: buildGetters<'web-feed'>('combinedBy'),
    /** 观看页布局 */
    watchLayout: buildGetters<MobileWatchLayout>('watchLayout'),
    /** feed 流布局层级 */
    feedLayoutLevel: buildGetters<'0' | '1'>('feedLayoutLevel'),
    /** 外链跳转额外参数 */
    linkExt: buildGetters<string>('linkExt'),

    /** 频道号 */
    channelId: buildGetters('channelId'),
    /** 目标场次 Id */
    targetSessionId: buildGetters('targetSessionId'),
    /**
     * 会议模式
     * 传入该参数后，在移动端横屏场景不会加载播放器和PPT
     * */
    polyvMeeting: buildGetters<'true'>('polyvMeeting'),
    /** 是否调试皮肤 */
    debugSkin: buildGetters<YN>('debugSkin'),
    /** 是否加载 VConsole */
    console: buildGetters<'1'>('console'),
    /** 多语言 */
    lang: buildGetters('lang'),
    /** 回放地址-回放 vid */
    vid: buildGetters('vid'),
    /** 回放地址-回放来源 */
    playbackType: buildGetters<PlaybackType>('playbackType'),
    /** 回放分享-回放视频 Id */
    playBackVid: buildGetters('playBackVid'),
    /** 渠道 id */
    promoteId: buildGetters('promoteId'),
    /** 企业微信分享海报的企微员工 ID */
    wxInviteId: buildGetters('wxInviteId'),
    /** 邀请海报唯一ID */
    invitePosterId: buildGetters('invitePosterId'),
    /** 受邀者 ID */
    invitee: buildGetters('invitee'),
    /** 测试模式 token */
    testModeToken: buildGetters('testModeToken'),
    /** 忽略微信授权 */
    ignoreWxAuth: buildGetters<YN>('ignoreWxAuth'),
    /** 强制用户体系授权，当使用用户体系外部授权时，可以传递该参数，即使已经授权也会再重新授权 */
    forceUserAuth: buildGetters<YN>('forceUserAuth'),
    /** 观众 id */
    viewerid: buildGetters('viewerid'),
    /** 观看条件-验证码 */
    password: buildGetters('password'),
    /** 观看条件-白名单 token */
    phoneAuthToken: buildGetters('phoneAuthToken'),
    /** 观众昵称 */
    name: buildGetters('name'),
    /** 观众昵称 */
    nickname: buildGetters('nickname'),
    /** 观众头像 */
    avatar: buildGetters('avatar'),
    /** 网络类型 */
    zone: buildGetters<ZoneType>('zone'),
    /** 是否被 iframe */
    hasFrame: buildGetters<'1'>('hasFrame'),
    /** 用户系统独立授权的用户 id */
    externalViewerId: buildGetters('externalViewerId'),
    /** 自定义授权 & 外部授权 & 独立授权 & 用户系统独立授权中的用户 id */
    userid: buildGetters('userid'),
    /** 参与者头衔 */
    actor: buildGetters('actor'),
    /** 自定义授权 & 外部授权 & 独立授权 & 用户系统独立授权中的时间戳 */
    ts: buildGetters('ts'),
    /** 自定义授权 & 外部授权 & 独立授权 & 用户系统独立授权中的签名 */
    sign: buildGetters('sign'),
    /** 微信 openId */
    openid: buildGetters('openid'),
    /** 微信 unionId */
    unionid: buildGetters('unionid'),
    /** 微信用户 id */
    wechatUserId: buildGetters('wechatUserId'),
    /** 播放器 param4 */
    param4: buildGetters('param4'),
    /** 播放器 param5 */
    param5: buildGetters('param5'),
    /** 真实姓名 */
    realName: buildGetters('realName'),
    /** 多皮肤 */
    skin: buildGetters<ChannelWatchPageSkin>('skin'),
    /** 是否使用 ip 地址进行 CDN 拉流 */
    ipPlay: buildGetters<'1'>('ipPlay'),
    /** 微信快照页环境 */
    snapshotPage: buildGetters<YN>('snapshotPage'),
    /** 强制优先独立授权，默认关 */
    forceDirectAuth: buildGetters<YN>('forceDirectAuth'),
    /** 一客一码--销售码 */
    saleCode: buildGetters<string>('saleCode'),
    /** 一客一码--销售邀请的客户id */
    inviteCustomerId: buildGetters<string>('inviteCustomerId'),
    /** 是否关闭引导条 */
    noAppBar: buildGetters<'1'>('noAppBar'),
    /** 邀请观看--分销员/邀请人 Id */
    inviteWatchSaleId: buildGetters<string>('inviteWatchSaleId'),
    /** 支付宝支付跳转方式 target */
    aliPayLinkTarget: buildGetters<string>('aliPayLinkTarget'),
    /** 聊天室 UI 请求版本 */
    chatUIVersion: buildGetters<'v1' | 'v2'>('chatUIVersion'),
    /** 移动端连麦 UI 版本，v2 为新版 */
    connectMicUIVersion: buildGetters<'v1' | 'v2'>('connectMicUIVersion'),
    /** 使用 AI 全部功能 */
    useAICompleteFeature: buildGetters<YN>('useAICompleteFeature'),
    /** 是否强制外部授权 */
    forceExternalAuth: buildGetters<YN>('forceExternalAuth'),
    /** app 标识 */
    isApp: buildGetters<'1'>('isApp'),
  });

  /**
   * 移除当前观看页地址上对应的参数
   * */
  function removeQueryParam(keys: QueryParamsKeyType[]) {
    const urlParams = getQueryParams();
    for (const key of keys) {
      if (!urlParams[key]) {
        continue;
      }
      delete urlParams[key];
    }

    __setQueryParams(urlParams, { reset: true });

    const url = appendToURL(getLocationPathName(), getQueryParams());
    replaceHistoryState({ url });
  }

  /**
   * 添加当前观看页地址上对应的参数
   * */
  function appendQueryParam(params: { [key in QueryParamsKeyType]?: string } = {}) {
    const urlParams = getUrlQueryParams();

    __setQueryParams({
      ...urlParams,
      ...params,
    });

    const url = appendToURL(getLocationPathName(), getQueryParams(), { ignoreEmpty: true });
    replaceHistoryState({ url });
  }

  return {
    getQueryParams,

    paramGetter,

    removeQueryParam,
    appendQueryParam,
  };
};

export type ParamGetterType = ReturnType<ReturnType<typeof useQueryParams>['paramGetter']>;

export type QueryParamsKeyType = keyof ParamGetterType;

export type QueryParamsHookType = ReturnType<typeof useQueryParams>;

/**
 * 从 url 链接路径中提取频道号和场次 Id
 * @param paramUrl 地址
 */
export function extractChannelAndSessionId(paramUrl?: string) {
  const url = paramUrl || window.location.href;
  const pathname = new URL(url).pathname;
  const parts = pathname.split('/').filter(part => part);
  const lastPart = parts[parts.length - 1];

  let channelId: string | undefined;
  let targetSessionId: string | undefined;

  if (/^\d+$/.test(lastPart)) {
    channelId = lastPart; // 如果最后一个部分是纯数字，则认为是 channelId
  } else {
    targetSessionId = lastPart;
    if (parts.length >= 2 && /^\d+$/.test(parts[parts.length - 2])) {
      channelId = parts[parts.length - 2];
    }
  }

  return { channelId, targetSessionId };
}
