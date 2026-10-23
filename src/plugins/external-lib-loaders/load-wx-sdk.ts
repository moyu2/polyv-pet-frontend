/**
 * @file 加载微信 js-sdk 文件
 */
import { loadScript } from '@polyv/utils/load-script';

let loadPromise: Promise<WechatJsSdk.Wx> | undefined;

/**
 * 加载微信 js-sdk
 */
export const loadWxSdk = () => {
  if (window.wx) {
    return Promise.resolve(window.wx);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      (async () => {
        await loadScript('//res.wx.qq.com/open/js/jweixin-1.6.0.js');

        if (window.wx) {
          resolve(window.wx);
        } else {
          reject(new Error('loadWxSdk fail, window.wx is undefined'));
        }
      })();
    });
  }

  return loadPromise;
};

/**
 * 加载企业微信的 js-sdk
 * https://developer.work.weixin.qq.com/document/path/90514
 */
export const loadWorkWxSdk = () => {
  if (window.wx) {
    return Promise.resolve(window.wx);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      (async () => {
        await loadScript('//res.wx.qq.com/open/js/jweixin-1.2.0.js');

        if (window.wx) {
          resolve(window.wx);
        } else {
          reject(new Error('loadWorkWxSdk fail, window.wx is undefined'));
        }
      })();
    });
  }

  return loadPromise;
};
