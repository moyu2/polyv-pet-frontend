import { isWeixin, weixinVersion } from '@/assets/utils/browser';
import { computed, ref, watch } from 'vue';
import { randomStr, escapeHTML } from '@polyv/utils/string';
import { useWeixinSdk } from './use-weixin-sdk';

export interface WeixinButtonOptions {
  /** 小程序原始 id */
  wxMiniprogramOriginalId: string;
  /** 小程序链接 */
  wxMiniprogramLink: string;
  /** className 前缀 */
  classKey: string;
}

export const useWeixinMiniProgramHelper = () => {
  const { getWeixinSdk } = useWeixinSdk();

  /**
   * 是否高于指定的微信浏览器版本
   */
  const isHighWeixinVersion = weixinVersion.gte('7.0.12');

  /**
   * 是否处于微信小程序 webview 页面
   */
  const isWxMiniProgramWebview = ref<boolean | null>(null);

  /**
   * 是否支持 <wx-open-launch-weapp>
   * 1. 微信浏览器环境
   * 2. 微信版本高于 7.0.12
   */
  const supportWxOpenLaunchWebApp = computed(() => {
    // 由于观看页会存在移动端页面是用 PC 布局的情况，所以此处不判断 isMobile
    return isWeixin && isHighWeixinVersion;
  });

  /**
   * 小程序 webview 下是否支持微信 SDK 功能跳转小程序页面
   */
  async function supportWxMiniProgramNavigateTo() {
    if (!isWeixin || !getWeixinSdk) {
      return false;
    }

    const wx = await getWeixinSdk();
    if (wx?.miniProgram?.getEnv) {
      return new Promise<boolean>(resolve => {
        wx.miniProgram?.getEnv(res => {
          resolve(res?.miniprogram === true);
        });
      });
    }
    return false;
  }

  /**
   * 检查当前环境是否为微信小程序 webview 环境中
   */
  async function checkWxMiniProgramWebview(): Promise<boolean> {
    try {
      if (isWxMiniProgramWebview.value !== null) {
        return isWxMiniProgramWebview.value;
      }

      const check = await supportWxMiniProgramNavigateTo();
      isWxMiniProgramWebview.value = check;
      return check;
    } catch (error) {
      return false;
    }
  }

  /**
   * 调用微信 sdk 方法跳转到当前小程序的某个页面
   */
  async function toWxMiniProgram(url: string) {
    if (!isWeixin || !getWeixinSdk) {
      return;
    }
    const wx = await getWeixinSdk();
    wx?.miniProgram?.navigateTo({
      url,
    });
  }

  return {
    isWxMiniProgramWebview,
    supportWxOpenLaunchWebApp,

    supportWxMiniProgramNavigateTo,
    checkWxMiniProgramWebview,
    toWxMiniProgram,
  };
};

export const useWeixinButton = (
  hookOptions: {
    /** 获取按钮选项 */
    getButtonOptions?: () => WeixinButtonOptions | undefined;
    /** launch 回调 */
    launchCallback?: () => unknown;
  } = {},
) => {
  const {
    isWxMiniProgramWebview,
    supportWxOpenLaunchWebApp,

    supportWxMiniProgramNavigateTo,
    checkWxMiniProgramWebview,
    toWxMiniProgram,
  } = useWeixinMiniProgramHelper();

  const weixinBtnRef = ref<HTMLDivElement | HTMLElement>();

  const buttonOptions = computed(() => {
    return hookOptions.getButtonOptions?.();
  });

  /**
   * 创建微信小程序打开按钮
   */
  function createWxMiniProgramButton() {
    if (!weixinBtnRef.value || !supportWxOpenLaunchWebApp.value) {
      return;
    }

    const options = buttonOptions.value;
    if (!options) {
      return;
    }

    const { wxMiniprogramOriginalId, wxMiniprogramLink, classKey } = options;
    const btnElem = weixinBtnRef.value;

    const width = btnElem.clientWidth;
    const height = btnElem.clientHeight;

    const id = 'wx-open-launch-weapp-' + randomStr(8);

    const htmlText = `
      <wx-open-launch-weapp
        id="${id}"
        username="${escapeHTML(wxMiniprogramOriginalId)}"
        path="${wxMiniprogramLink}"
      >
        <script type="text/wxtag-template">
          <style>.plv-watch-${classKey}-wx-btn {width: ${width}px;height: ${height}px;}</style>
          <div class="plv-watch-${classKey}-wx-btn"></div>
        </script>
      </wx-open-launch-weapp>
    `;

    btnElem.innerHTML = htmlText;

    setTimeout(() => {
      const launchElem = document.querySelector(`#${id}`);
      launchElem?.addEventListener('launch', () => {
        if (hookOptions.launchCallback) {
          hookOptions.launchCallback();
        }
      });
      launchElem?.addEventListener('error', e => {
        const error = e as unknown as { detail: unknown };
        console.error('Launch error', error.detail);
      });
    }, 10);
  }

  watch(
    () => [weixinBtnRef.value, supportWxOpenLaunchWebApp.value, buttonOptions.value],
    () => {
      createWxMiniProgramButton();
    },
    {
      immediate: true,
    },
  );

  return {
    isWxMiniProgramWebview,
    supportWxOpenLaunchWebApp,
    checkWxMiniProgramWebview,
    supportWxMiniProgramNavigateTo,
    toWxMiniProgram,
    weixinBtnRef,
    createWxMiniProgramButton,
  };
};
