import { useGlobalInject } from '@/app/use-global-inject';
import {
  IarUIComponents,
  IarUIType,
  getUmdEntranceGlobalVariable,
  getUmdGlobalVariable,
  iarUIVersions,
} from './version-config';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import type Vue from 'vue';
import { type ComponentOptions } from 'vue';
import { loadScript } from '@polyv/utils/load-script';

const iarUILoader: Record<string, Promise<unknown> | undefined> = {};

export const useIarUILoader = <T extends IarUIType>(iarUIType: T) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const env = WATCH_SDK_ENV;
  const domainInfo = watchCore.domain.getDomainInfo();

  const domains: Record<SdkLoaderEnv, string> = {
    [SdkLoaderEnv.Prod]: domainInfo.webSdkDomain,
    [SdkLoaderEnv.Rc]: domainInfo.webSdkTest1Domain,
    [SdkLoaderEnv.Test]: domainInfo.webSdkTest1Domain,
  };
  const domain = domains[env];

  const version = iarUIVersions[iarUIType][env];
  const entranceGlobalVariable = getUmdEntranceGlobalVariable(iarUIType);

  function loadIarUI(componentName: IarUIComponents<T>): Promise<unknown> {
    const iarLoaderPath = `${iarUIType}/${version}/${componentName}.umd.js`;
    // 加载地址
    const iarLoaderUrl = `${domain}/${iarLoaderPath}`;
    // 备用加载地址
    const iarLoaderBackupUrl = `${domain.replace('websdk', 'websdk2')}/${iarLoaderPath}`;
    // 全局变量名称
    const globalVariable = getUmdGlobalVariable(componentName);

    if (!iarUILoader[iarLoaderUrl]) {
      iarUILoader[iarLoaderUrl] = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(iarLoaderUrl, {
              backupURL: iarLoaderBackupUrl,
            });
            if (window[globalVariable]) {
              resolve(window[globalVariable]);
            } else {
              reject(new Error(`loadIarUI fail, window.${globalVariable} is undefined`));
            }
          } catch (e) {
            reject(e);
          }
        })();
      });
    }

    return iarUILoader[iarLoaderUrl] as Promise<ComponentOptions<Vue>>;
  }

  function getEntrance<Pkg>(): Pkg {
    if (window[entranceGlobalVariable]) {
      return window[entranceGlobalVariable] as Pkg;
    }

    throw new Error(`getIarUIEntrance fail, window.${entranceGlobalVariable} is undefined`);
  }

  function loadIarUIEntrance<Pkg>(): Promise<Pkg> {
    const iarLoaderPath = `${iarUIType}/${version}/index.umd.js`;
    // 加载地址
    const iarLoaderUrl = `${domain}/${iarLoaderPath}`;
    // 备用加载地址
    const iarLoaderBackupUrl = `${domain.replace('websdk', 'websdk2')}/${iarLoaderPath}`;

    if (!iarUILoader[iarLoaderUrl]) {
      iarUILoader[iarLoaderUrl] = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(iarLoaderUrl, {
              backupURL: iarLoaderBackupUrl,
            });
            resolve(getEntrance<Pkg>());
          } catch (e) {
            reject(e);
          }
        })();
      });
    }

    return iarUILoader[iarLoaderUrl] as Promise<Pkg>;
  }

  return {
    loadIarUI,
    loadIarUIEntrance,
    getEntrance,
  };
};
