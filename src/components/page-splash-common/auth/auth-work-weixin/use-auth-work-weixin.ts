import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';

import { AuthSettingItemEnterpriseWeChat } from '@polyv/live-watch-sdk';

import {
  loadWorkWeixinLoginSdk,
  WwLoginInstance,
} from '@/plugins/external-lib-loaders/load-work-weixin-login';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';

import { useAuthStore } from '@/store/use-auth-store';

import {
  useWeixinAuthorize,
  useWorkWeixinAuthorize,
} from '@/hooks/platform/use-weixin/use-weixin-authorize';

import { useAuthButtonInject } from '../hooks/use-auth-button';
import { getWwLoginStyle } from './utils';
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useWorkWeixinErrorPage } from '@/hooks/platform/use-weixin/use-work-weixin-error-page';
import { useGlobalInject } from '@/app/use-global-inject';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

const useAuthWorkWeixinCommon = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  const { redirectWorkWeixinAuthorize } = useWorkWeixinAuthorize();

  const { redirectWeixinAuthorize } = useWeixinAuthorize();

  const { isNeedErrorPageRedirect, processErrorPageRedirect } = useWorkWeixinErrorPage();

  function redirect2Auth() {
    // 优先处理错误页跳转
    if (isNeedErrorPageRedirect()) {
      const processResult = processErrorPageRedirect();
      if (processResult) {
        return;
      }
    }

    // 微信环境下
    if (isWeixin) {
      redirectWeixinAuthorize({
        snsApiBase: false,
      });
      return;
    }

    if (isWorkWeixin) {
      // 判断是否为企业成员
      if (!watchCore.weixin.isEnterpriseStaff()) {
        toast.error(translate('auth.error.workWeixinNotStaff'));
        return;
      }

      // 企微环境直接进行非静默授权，非企微环境只能进行静默授权
      redirectWorkWeixinAuthorize({
        snsApiBase: false,
      });
    }
  }

  return {
    redirect2Auth,
  };
};

/**
 * @hook PC 端企微观看条件
 */
export const useAuthWorkWeixinPc = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();
  const authStore = useAuthStore();

  useAuthButtonInject<AuthSettingItemEnterpriseWeChat>(onClickAuthButton);

  const { redirect2Auth } = useAuthWorkWeixinCommon();

  const dialogVisible = ref(false);

  async function onClickAuthButton() {
    // 企微已过期
    if (watchCore.weixin.isWorkWeixinExpired()) {
      toast.error(translate('auth.error.workWeixinExpire'));
      return;
    }

    // 当前环境不支持企微授权
    if (!(isWorkWeixin || isWeixin)) {
      dialogVisible.value = true;
      initWorkWeixinCode();
      return;
    }

    redirect2Auth();
  }

  let wwloginInstance: WwLoginInstance | undefined;

  /**
   * 初始化企微登录二维码
   */
  async function initWorkWeixinCode() {
    destroyWwLogin();

    const watchCore = getWatchCore();
    const data = await watchCore.weixin.getWorkWeixinAuthorizeCode();
    const WwLogin = await loadWorkWeixinLoginSdk();

    wwloginInstance = new WwLogin({
      id: 'wx_work_code',
      appid: data.corpId,
      agentid: data.agentId,
      redirect_uri: encodeURIComponent(data.redirectUrl),
      state: data.state,
      lang: 'zh',
      href: getWwLoginStyle(),
    });
  }

  /**
   * 销毁企微登录实例
   */
  function destroyWwLogin() {
    if (wwloginInstance) {
      wwloginInstance.destroyed();
      wwloginInstance = undefined;
    }
  }

  onBeforeMount(() => {
    loadWorkWeixinLoginSdk();
  });

  onMounted(() => {
    // PC 端在微信环境下，只有单个企微观看条件下，需要自动点击按钮
    if ((isWorkWeixin || isWeixin) && authStore.authSettings.length === 1) {
      onClickAuthButton();
    }
  });

  onBeforeUnmount(() => {
    destroyWwLogin();
  });

  return {
    dialogVisible,
  };
};

/**
 * @hook 移动端企微观看条件
 */
export const useAuthWorkWeixinMobile = () => {
  const authStore = useAuthStore();
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  useAuthButtonInject<AuthSettingItemEnterpriseWeChat>(onClickAuthButton);

  const { redirect2Auth } = useAuthWorkWeixinCommon();

  async function onClickAuthButton() {
    // 企微已过期
    if (watchCore.weixin.isWorkWeixinExpired()) {
      toast.error(translate('auth.error.workWeixinExpire'));
      return;
    }

    // 当前环境不支持企微授权
    if (!(isWorkWeixin || isWeixin)) {
      toast.error(translate('auth.error.workWeixinNotAllow'));
      return;
    }

    redirect2Auth();
  }

  onMounted(() => {
    // 只有单个企微观看条件下，需要自动点击按钮
    if (authStore.authSettings.length === 1) {
      onClickAuthButton();
    }
  });
};
