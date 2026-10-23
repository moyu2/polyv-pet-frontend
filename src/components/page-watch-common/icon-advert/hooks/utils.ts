import { type IconAdvertItem, AdvertHrefType } from '@polyv/live-watch-sdk';

/** @file 关于h5跳转微信的一些能力函数 */
const ua = navigator.userAgent.toLowerCase();
/**
 * 获取微信版本
 */
export const getWeixinVersion = () => {
  const regData = ua.match(/micromessenger\/([\d.]+)/i);
  return regData && regData.length ? regData[1] : '';
};

/**
 * 比较两个版本号，version1高于version2返回大于0
 * @param {String} version1
 * @param {String} version2
 */
export const compareVersions = (version1: string, version2: string) => {
  const reg = /(\.0+)+$/;
  const segA = version1.replace(reg, '').split('.');
  const segB = version2.replace(reg, '').split('.');
  const len = Math.min(segA.length, segB.length);
  for (let i = 0; i < len; i++) {
    const diff = parseInt(segA[i], 10) - parseInt(segB[i], 10);
    if (diff) {
      return diff;
    }
  }
  return segA.length - segB.length;
};

export const convertIconAdvertItemToLinkData = (iconAdvert: IconAdvertItem) => {
  console.info('图标广告拿到的数据', iconAdvert);
  const data = {
    jumpWay: iconAdvert.jumpWay,
    link: iconAdvert.advertHref || '',
    pcLink: iconAdvert.pcLink || '',
    pcLinkJumpWay: iconAdvert.pcLinkJumpWay || iconAdvert.jumpWay,
    androidLink: iconAdvert.androidLink || '',
    iosLink: iconAdvert.iosLink || '',
    harmonyLink: iconAdvert.harmonyLink || '',
    mobileAppLink: iconAdvert.mobileAppLink || '',
    mobileAppLinkJumpWay: iconAdvert.mobileAppLinkJumpWay || iconAdvert.jumpWay,
    wxMiniprogramAppId: iconAdvert.wxMiniprogramAppId || '',
    wxMiniprogramOriginalId: iconAdvert.wxMiniprogramOriginalId || '',
    wxMiniprogramLink: iconAdvert.wxMiniprogramLink || '',
  };

  // 旧数据配置了通用链接，则多平台链接全部失效
  if (iconAdvert.hrefType === AdvertHrefType.COMMON) {
    console.info('图标广告进入通用链接');
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
  if (iconAdvert.hrefType === AdvertHrefType.MULTI_PLATFORM && !data.link) {
    console.info('图标广告进入多平台');
    data.link = iconAdvert.mobileLink;
  }
  console.info('最终转换的数据', data);

  return data;
};
