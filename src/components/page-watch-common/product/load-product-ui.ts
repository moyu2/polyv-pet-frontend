import Vue, { ComponentOptions } from 'vue';
import camelCase from 'camelcase';
import { useGlobalInject } from '@/app/use-global-inject';
import { loadScript } from '@polyv/utils/load-script';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';

export type PolyvProductUIType = {
  'mobile-product-pendant': ComponentOptions<Vue>;
  'pc-product-pendant': ComponentOptions<Vue>;
  'product-button': ComponentOptions<Vue>;
  'product-iframe-link-popup': ComponentOptions<Vue>;

  'product-list': ComponentOptions<Vue>;
  'product-item': ComponentOptions<Vue>;
  'product-list-popup': ComponentOptions<Vue>;
  'product-detail': ComponentOptions<Vue>;
  'product-detail-popup': ComponentOptions<Vue>;

  'order-list': ComponentOptions<Vue>;
  'order-item': ComponentOptions<Vue>;
  'order-detail': ComponentOptions<Vue>;
  'order-list-popup': ComponentOptions<Vue>;
  'order-confirm': ComponentOptions<Vue>;
  'order-popup': ComponentOptions<Vue>;

  'address-list': ComponentOptions<Vue>;
  'address-edit': ComponentOptions<Vue>;
  'address-item': ComponentOptions<Vue>;

  'big-card-popup': ComponentOptions<Vue>;
  'small-card': ComponentOptions<Vue>;
  'bottom-card': ComponentOptions<Vue>;
};

type PolyvProductUIComponents = keyof PolyvProductUIType;

function getProductUIVersionConfig() {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const env = WATCH_SDK_ENV;
  const domainInfo = watchCore.domain.getDomainInfo();

  const results: Record<SdkLoaderEnv, { domain: string; version: string }> = {
    [SdkLoaderEnv.Prod]: {
      domain: domainInfo.webSdkDomain,
      version: 'rc-20261015',
    },
    [SdkLoaderEnv.Rc]: {
      domain: domainInfo.webSdkTest1Domain,
      version: 'dev-20261015',
    },
    [SdkLoaderEnv.Test]: {
      domain: domainInfo.webSdkTest1Domain,
      version: 'dev-20261015',
    },
  };

  return results[env];
}

function getScriptUrl(domain: string, version: string, componentName: string) {
  return `${domain}/product-ui/${version}/${componentName}.umd.js`;
}

/**
 * 获取商品 SDK 组件全局变量名
 * @param componentName 组件名
 */
export function getUmdGlobalVariable(componentName: string) {
  return 'PolyvProductUI' + camelCase(componentName, { pascalCase: true });
}

const productUILoader: Record<string, Promise<unknown> | undefined> = {};

export const useProductUILoader = () => {
  const { domain, version } = getProductUIVersionConfig();

  /**
   * 加载商品 SDK
   */
  function loadProductUI(componentName: PolyvProductUIComponents): Promise<unknown> {
    const url = getScriptUrl(domain, version, componentName);
    const backupUrl = getScriptUrl(domain.replace('websdk', 'websdk2'), version, componentName);
    // 全局变量名称
    const globalVariable = getUmdGlobalVariable(componentName);

    if (!productUILoader[url]) {
      productUILoader[url] = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(url, {
              backupURL: backupUrl,
            });
            if (window[globalVariable]) {
              resolve(window[globalVariable]);
            } else {
              reject(new Error(`loadProductUI fail, window.${globalVariable} is undefined`));
            }
          } catch (error) {
            reject(error);
          }
        })();
      });
    }

    return productUILoader[url] as Promise<ComponentOptions<Vue>>;
  }

  return {
    loadProductUI,
  };
};
