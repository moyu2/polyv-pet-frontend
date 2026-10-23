import { ref } from 'vue';
import { escapeHTML, randomStr } from '@polyv/utils/string';
import { isWeixin } from '@/assets/utils/browser';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { compareVersions, getWeixinVersion } from './utils';

type Options = {
  wrapDom: HTMLElement | null;
  wxMiniprogramAppId: string;
  wxMiniprogramOriginalId: string;
  wxMiniprogramLink: string;
  width: number;
  height: number;
  launchCallback?: () => void;
};
export const useIconAdvert = () => {
  const { getWeixinSdk } = useWeixinSdk();

  const isWxMiniProgramWebview = ref(false);
  const isHighWeixinVersion = compareVersions(getWeixinVersion(), '7.0.12') >= 0;
  const hasWxJumpDom = ref(false);

  async function supportWxMiniProgramNavigateTo(): Promise<boolean> {
    if (!isWeixin) {
      return false;
    }

    const wx = await getWeixinSdk();
    if (!wx) {
      throw new Error('Failed to get getWeixinSdk');
    }

    if (wx?.miniProgram?.getEnv) {
      return new Promise((resolve, reject) => {
        wx.miniProgram?.getEnv(res => {
          if (res) {
            resolve(res.miniprogram === true);
          } else {
            reject(new Error('Failed to get environment'));
          }
        });
      });
    }

    return false;
  }

  const createGotoWxDom = (options: Options) => {
    const {
      wrapDom,
      wxMiniprogramAppId,
      wxMiniprogramOriginalId,
      wxMiniprogramLink,
      width,
      height,
      launchCallback,
    } = options;

    const id = randomStr(8);

    const htmlText = `
        <wx-open-launch-weapp
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: inline-block; border: none;"
          id="${id}"
          appid="${wxMiniprogramAppId}"
          username="${escapeHTML(wxMiniprogramOriginalId)}"
          path="${wxMiniprogramLink}"
        >
          <script type="text/wxtag-template"">
            <style>.plv-icon-advert-wx-ad-btn {width: ${width}px;height: ${height}px;}</style>
            <div class="plv-icon-advert-wx-ad-btn"></div>
          </script>
        </wx-open-launch-weapp>
      `;
    if (wrapDom) {
      wrapDom.innerHTML = htmlText;
      hasWxJumpDom.value = true;
      setTimeout(() => {
        document.getElementById(`#${id}`)?.addEventListener('launch', () => {
          console.log(id, 'launch');
          launchCallback && launchCallback();
        });
        document.getElementById(`#${id}`)?.addEventListener('ready', () => {
          console.log(id, 'ready');
        });
        document.getElementById(`#${id}`)?.addEventListener('error', e => {
          console.log(id, 'error', e);
        });
      }, 10);
    }
  };

  async function init(options: Options) {
    const checkWxMiniProgramWebview = await supportWxMiniProgramNavigateTo();
    isWxMiniProgramWebview.value = checkWxMiniProgramWebview;
    if (isHighWeixinVersion && (options.wxMiniprogramAppId || options.wxMiniprogramOriginalId)) {
      createGotoWxDom(options);
    }
  }

  const openWxLink = (wxMiniprogramLink: string, preCallback?: () => void) => {
    if (!isHighWeixinVersion) {
      return;
    }
    preCallback && preCallback();
    if (isWxMiniProgramWebview.value && wxMiniprogramLink) {
      wx.miniProgram?.navigateTo({ url: wxMiniprogramLink });
      return true;
    }
    return false;
  };

  return {
    init,
    openWxLink,
    isWxMiniProgramWebview,
    isWeixin,
    hasWxJumpDom,
  };
};
