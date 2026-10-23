import { loadScript } from '@polyv/utils/load-script';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import type { Captcha, ICaptchaOptions } from '@polyv/captcha-sdk';

function getScriptURLByWatchSdkEnv() {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();

  const env = WATCH_SDK_ENV;
  const domainInfo = watchCore.domain.getDomainInfo();

  const urlInfo = {
    [SdkLoaderEnv.Prod]: {
      domain: domainInfo.webSdkDomain,
      version: 'v1-latest',
    },
    [SdkLoaderEnv.Rc]: {
      domain: domainInfo.webSdkTest1Domain,
      version: 'beta',
    },
    [SdkLoaderEnv.Test]: {
      domain: domainInfo.webSdkTest1Domain,
      version: 'beta',
    },
  }[env];

  return `${urlInfo.domain}/captcha-sdk/${urlInfo.version}/lib/plv-captcha.umd.js`;
}

let scriptLoader: Promise<void>;

export async function loadCaptcha(): Promise<void> {
  if (!scriptLoader) {
    scriptLoader = loadScript(getScriptURLByWatchSdkEnv());
  }
  await scriptLoader;
}

export async function createCaptcha(options: ICaptchaOptions): Promise<Captcha> {
  await loadCaptcha();
  const PlvCaptcha = window.PlvCaptcha;
  if (!PlvCaptcha) {
    throw new Error('load captcha fail, window.PlvCaptcha is undefined');
  }

  return await PlvCaptcha.createWatchCaptcha({
    ...options,
  });
}
