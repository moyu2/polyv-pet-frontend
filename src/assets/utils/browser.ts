import { getCurrentUAInfo } from '@polyv/utils/ua-info';
import { PlvChannelModule } from '@polyv/live-watch-sdk';
import { isBuildForFeedMainMode } from './utils';

const ua = navigator.userAgent.toLowerCase();

const uaInfo = getCurrentUAInfo();

/** 是否微信（非企业微信） */
export const isWeixin = uaInfo.client.isWx;

/**
 * 微信版本
 */
export const weixinVersion = uaInfo.client.version;

/** 是否企业微信 */
export const isWorkWeixin = uaInfo.client.isWxWork;

/** 强制使用 PC 端样式 */
export const forcePc = /[?&]plvLayout=pc?(&|$)/.test(window.location.search);

/** 强制使用移动端样式 */
export const forceMobile = /[?&]plvLayout=mobile?(&|$)/.test(window.location.search);

/** 是否微信小程序 */
export const isWxMiniProgram = uaInfo.client.isWxMiniProgram;

/** 判断 PC 端微信小程序环境 */
export const isPcMiniProgram = (() => {
  const env = isWeixin || isWorkWeixin;
  const supportUA = /miniprogramenv/.test(ua);

  return env && supportUA;
})();

function __isMobile() {
  const ua = navigator.userAgent;
  if (/mobile|android/i.test(ua)) {
    return true;
  } else {
    if (
      /\b(Windows\sNT|Macintosh|x86(_(32|64))?|amd64|i[1-6]86)\b/.test(ua) ||
      !('onorientationchange' in window)
    ) {
      return false;
    } else {
      return true;
    }
  }
}

function __isTablet() {
  return uaInfo.isTabletLike;
}

const isMob = __isMobile();

/**
 * 是否是平板
 */
export const isTablet = isMob && __isTablet();

/**
 * 是否在移动端平板加载pc端模版
 */
export const tabletLoadDesktopTemplate =
  isTablet && PlvChannelModule.getTabletLayoutSetting() === 'follow_pc';

/** 是否移动端 */
export const isMobile = (() => {
  if (forceMobile) return true;
  if (forcePc) return false;

  if (isBuildForFeedMainMode()) return true;
  if (tabletLoadDesktopTemplate) return false;
  return isMob || isPcMiniProgram; // uaInfo.isPortable || isPcMiniProgram;
})();

/** 是否为 QQ 浏览器 */
export const isQQBrowser = uaInfo.client.isQQBrowser;

/** 是否为 UC 浏览器 */
export const isUCBrowser = uaInfo.client.isUCBrowser;

/** 是否为百度 app */
export const isBaiduApp = uaInfo.client.isBaiduApp;

/** 是否安卓 */
export const isAndroid = uaInfo.os.isAndroid;

/** 是否为 MAC */
export const isMac = uaInfo.os.isMacOS;

/** 是否 ios */
export const isIOS = uaInfo.os.isIOS;

/** 是否纯血鸿蒙 */
export const isOpenHarmony = uaInfo.os.isOpenHarmony;

/** 是否被 iframe */
export const isIframe = window.self !== window.top;

/** 获取 IOS 版本 */
export function getIosVersion() {
  const ver = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (ver) {
    return parseInt(ver[1], 10);
  } else {
    return null;
  }
}

/** 针对 iOS 13 以上 iPad(ua 与桌面端 Mac OS 近似) */
export const isDesktopIPad = /mac os x/i.test(ua) && 'ontouchend' in document;

/** IE 浏览器版本号，不符合该浏览器特征时返回 -1 */
const ieVersion = (() => {
  const ua = window.navigator.userAgent;
  const msieIndex = ua.indexOf('MSIE ');
  const tridentIndex = ua.indexOf('Trident/');

  if (msieIndex > -1) {
    // IE 10及以下版本
    return parseInt(ua.substring(msieIndex + 5, ua.indexOf('.', msieIndex)), 10);
  }

  if (tridentIndex > -1) {
    // IE 11版本
    const rvIndex = ua.indexOf('rv:');
    return parseInt(ua.substring(rvIndex + 3, ua.indexOf('.', rvIndex)), 10);
  }

  // 不是IE浏览器
  return -1;
})();

/** 是否为 IE */
export const isIE = uaInfo.browser.isIE;

/** 是否为低版本 IE */
export const isLowerIE = isIE && ieVersion !== -1 && ieVersion <= 10;

/**
 * 判断是否模拟 PC 的 UA
 *
 * 通过媒体查询判断，不通过 UA 和 navigator.platform
 *  - pointer:coarse 表示当前设备的指针是不精确的。手机不支持鼠标，只支持触摸
 *  - hover: none 表示当前设备不支持 mouse hover 处理
 */
function judgeIsMockPC(): boolean {
  const matchMedia = window.matchMedia;
  if (matchMedia) {
    const isCoarsePointer = matchMedia('(pointer:coarse)').matches;
    const isNotHover = matchMedia('(hover: none)').matches;
    return isCoarsePointer && isNotHover && !isMobile; // 内部逻辑：支持触摸，不支持鼠标悬浮，UA 判断又不是移动端 => 模拟 PC
  }
  return false;
}

/** 是否模拟 UA 为 PC */
export const isMockPc = judgeIsMockPC();

/** 是否为钉钉内置浏览器 */
export const isDingTalk = /DingTalk/i.test(ua);
