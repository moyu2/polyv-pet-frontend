import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useWeixinStore } from '@/store/use-weixin-store';
import { PolyvWatchCore } from '@polyv/live-watch-sdk';
import { useWeixinSdk } from './use-weixin-sdk';
import { useWeixinShare } from './use-weixin-share';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 处理微信相关配置
 * */
export const useWeixinConfig = () => {
  const weixinStore = useWeixinStore();

  const { getWeixinSdk } = useWeixinSdk();

  async function toConfigWeixinFeature(watchCore: PolyvWatchCore) {
    try {
      if (!(isWeixin || isWorkWeixin)) {
        return;
      }

      if (!weixinStore.wxSdkFeatureEnabled) {
        return;
      }

      watchCore.setWeixinSdk(getWeixinSdk);

      await getWeixinSdk();

      const { configureWeixinShare } = useWeixinShare({ watchCore });

      await configureWeixinShare();
    } catch (error) {
      console.error('toConfigWeixinFeature error', error);
    }
  }

  return {
    toConfigWeixinFeature,
  };
};

/**
 * @hook 更新微信分享配置
 * */
export const useWeixinShareConfigUpdate = () => {
  const weixinStore = useWeixinStore();
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { configureWeixinShare } = useWeixinShare({ watchCore });

  async function updateWeixinShareConfig() {
    if (!(isWeixin || isWorkWeixin)) {
      return;
    }

    if (!weixinStore.wxSdkFeatureEnabled) {
      return;
    }

    await configureWeixinShare();
  }

  return {
    updateWeixinShareConfig,
  };
};
