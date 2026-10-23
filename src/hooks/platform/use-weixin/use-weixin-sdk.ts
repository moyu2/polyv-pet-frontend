/* eslint-disable n/handle-callback-err */
/* eslint-disable promise/prefer-await-to-then */
import { translate } from '@/assets/lang';
import { isWorkWeixin } from '@/assets/utils/browser';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { messageBox } from '@/components/common-base/message-box';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { loadWorkWxSdk, loadWxSdk } from '@/plugins/external-lib-loaders/load-wx-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { LoggerName } from '@polyv/live-watch-sdk';

/** 创建微信 JS-SDK 实例 */
function createWxInstance() {
  const watchAppStore = useWatchAppStore();
  const { getWatchCore } = useMultiPolyvWatchApp();

  return new Promise<WechatJsSdk.Wx>((resolve, reject) => {
    const watchCore = getWatchCore();
    Promise.all([
      isWorkWeixin ? loadWorkWxSdk() : loadWxSdk(),
      isWorkWeixin ? watchCore.weixin.getWorkWeixinSign() : watchCore.weixin.getWeixinSign(),
    ])
      .then(([wx, signRes]) => {
        /** 是否已经回调 */
        let hadCalled = false;

        // 保存微信分享信息
        const weixinStore = useWeixinStore();
        if (signRes) {
          weixinStore.saveWxShareInfo({
            isUseWxShareUrl: signRes.isUseWxShareUrl,
            wxShareUrl: signRes.wxShareUrl,
            weixinShareCoverImg: signRes.weixinShareCoverImg,
            shareTitle: signRes.shareTitle,
            shareDesc: signRes.shareDesc,
            weixinShareCustomUrlWithParamEnabled: signRes.weixinShareCustomUrlWithParamEnabled,
          });
        }

        // 配置微信分享
        const { appId, timestamp, nonceStr, signature } = signRes?.wxSign || {};

        const configData = {
          appId,
          timestamp,
          nonceStr,
          signature,
        };

        console.info('wx.config', configData);

        function tryGetMiniProgramEnv() {
          return new Promise(resolve => {
            console.info('start tryGetMiniProgramEnv');

            // 1秒后如果还没有获取到环境，则认为没有获取到
            const timer = window.setTimeout(() => {
              console.info('wx.miniProgram.getEnv timeout');
              resolve(false);
            }, 1000);

            // 尝试调用 api 获取 webview 环境，如果能获取到，则说明是配置成功的
            if (wx.miniProgram?.getEnv) {
              wx.miniProgram.getEnv(res => {
                console.info('wx.miniProgram.getEnv', res);
                if (res?.miniprogram === true) {
                  watchAppStore.$patch({
                    isWxMiniProgram: true,
                  });
                  window.clearTimeout(timer);
                  resolve(true);
                } else {
                  window.clearTimeout(timer);
                  resolve(false);
                }
              });
            } else {
              console.info('wx.miniProgram.getEnv not support');
              window.clearTimeout(timer);
              resolve(false);
            }
          });
        }

        setTimeout(() => {
          // 处理 wx-js-sdk 没有触发任何回调的问题
          if (!hadCalled) {
            (async () => {
              const isMiniEnv = await tryGetMiniProgramEnv();
              if (hadCalled) {
                return;
              }

              if (isMiniEnv) {
                resolve(wx);
                hadCalled = true;
              } else {
                reject(new Error('wx sdk setTimeout catch error'));
              }
            })();
          }
        }, 3000);

        wx.config({
          appId,
          timestamp,
          nonceStr,
          signature,
          jsApiList: [
            'updateAppMessageShareData',
            'updateTimelineShareData',
            'hideAllNonBaseMenuItem',
            'chooseWXPay',
            'previewImage',
            'onMenuShareAppMessage',
            'onMenuShareWechat',
            'shareAppMessage',
            'shareWechatMessage',
            'onMenuShareTimeline',
          ],
          openTagList: ['wx-open-launch-weapp'],
        });

        wx.error(error => {
          console.error('Wx sdk: error', error);
          hadCalled = true;
          reject(new Error('wx sdk config error'));

          const watchCore = getWatchCore();
          const logMsg = {
            href: location.href,
            error: JSON.stringify(error),
            configData,
          };
          watchCore.logger.error(LoggerName.Weixin, 'config-js-sdk-fail', JSON.stringify(logMsg));
        });

        wx.ready(() => {
          console.info('wx sdk: success');
          hadCalled = true;
          resolve(wx);

          // 获取是否微信小程序环境
          try {
            wx.miniProgram?.getEnv(res => {
              if (res?.miniprogram === true) {
                watchAppStore.$patch({
                  isWxMiniProgram: true,
                });
              }
            });
          } catch (e) {
            console.error('miniProgram error', e);
          }
        });
      })
      .catch(error => {
        console.error('createWxInstance fail', error);
        reject(new Error('create wx sdk instance catch error'));

        const logMsg = {
          href: location.href,
          error: JSON.stringify(error),
        };

        watchCore.logger.error(
          LoggerName.Weixin,
          'create-wx-instance-fail',
          JSON.stringify(logMsg),
        );
      });
  });
}

const wxLoaders: Record<string, Promise<WechatJsSdk.Wx | undefined> | undefined> = {};

/**
 * feed-inject 模式下获取微信实例
 * @desc 容器已完成 wx.config 配置，直接复用容器的 window.wx 实例，无需重复加载 SDK 和配置
 * 仅通过签名接口获取微信分享信息
 */
function createWxInstanceFromContainer(): Promise<WechatJsSdk.Wx | undefined> {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();
  const weixinStore = useWeixinStore();

  return (isWorkWeixin ? watchCore.weixin.getWorkWeixinSign() : watchCore.weixin.getWeixinSign())
    .then(signRes => {
      // 保存微信分享信息
      if (signRes) {
        weixinStore.saveWxShareInfo({
          isUseWxShareUrl: signRes.isUseWxShareUrl,
          wxShareUrl: signRes.wxShareUrl,
          weixinShareCoverImg: signRes.weixinShareCoverImg,
          shareTitle: signRes.shareTitle,
          shareDesc: signRes.shareDesc,
          weixinShareCustomUrlWithParamEnabled: signRes.weixinShareCustomUrlWithParamEnabled,
        });
      }

      // 复用容器已配置好的微信实例
      return window.wx;
    })
    .catch(error => {
      console.error('createWxInstanceFromContainer fail', error);
      return undefined;
    });
}

/**
 * 通过 channelId 来获取微信实例
 */
function getWeixinSdkByChannelId(channelId: string): Promise<WechatJsSdk.Wx | undefined> {
  let promiseTarget = wxLoaders[channelId];
  if (promiseTarget) {
    return promiseTarget;
  }

  // feed-inject 模式下，从容器获取已配置好的微信实例，无需再次配置 wx.config
  promiseTarget = isBuildForFeedMainMode() ? createWxInstanceFromContainer() : createWxInstance();

  wxLoaders[channelId] = promiseTarget;

  return promiseTarget;
}

/**
 * 标志位
 * @desc 只上报一次数据给到 plvLogger
 */
let errorLoggerOnce = false;

/**
 * @hook 使用微信 JS-SDK
 */
export const useWeixinSdk = () => {
  const channelStore = useChannelStore();
  const weixinStore = useWeixinStore();

  const { getWatchCore } = useMultiPolyvWatchApp();

  /** 获取微信 js-sdk */
  const getWeixinSdk = (): Promise<WechatJsSdk.Wx | undefined> => {
    return new Promise(resolve => {
      if (!weixinStore.wxSdkFeatureEnabled) {
        console.warn('weixin-sdk is disabled');
        return resolve(undefined);
      }

      // 不支持企业微信功能
      if (isWorkWeixin && !weixinStore.workWeixinFunctionEnabled) {
        console.warn('work weixin-sdk is disable');
        return resolve(undefined);
      }

      getWeixinSdkByChannelId(channelStore.channelId)
        .then(result => {
          return resolve(result);
        })
        .catch(error => {
          if (!errorLoggerOnce && window.plvLogger) {
            window.plvLogger.error(error);
            errorLoggerOnce = true;
          }

          console.error('getWeixinSdkByChannelId err', error);
          return resolve(undefined);
        });
    });
  };

  /**
   * 检查 api 是否支持
   * @param apiName api 名称
   */
  function checkJsApi(apiName: WechatJsSdk.JsApiNames): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      (async () => {
        const watchCore = getWatchCore();
        const wx = await getWeixinSdk();

        wx?.checkJsApi({
          jsApiList: [apiName],
          success: res => {
            if (res?.checkResult[apiName]) {
              resolve();
            } else {
              messageBox({
                title: translate('base.tips'),
                content: translate('withdraw.apply.error.msg'),
                confirmButtonText: translate('base.ok'),
              }).$confirm();

              const msg = `check js api fail, ${apiName} not support, ${res?.errMsg}`;
              watchCore.logger.error(LoggerName.Weixin, 'check-js-api-fail', msg);
              reject(new Error(msg));
            }
          },
        });
      })();
    });
  }

  return {
    getWeixinSdk,
    checkJsApi,
  };
};
