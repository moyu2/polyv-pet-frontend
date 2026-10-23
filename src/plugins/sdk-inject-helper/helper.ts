import type { PolyvWatchAppClass } from './class';

/**
 * @warn sdk-inject 模式下不生效
 */
let polyvWatchAppInstance: PolyvWatchAppClass | undefined;

export function setPolyvWatchApp(instance: PolyvWatchAppClass) {
  polyvWatchAppInstance = instance;
}

export function getPolyvWatchApp() {
  try {
    if (window.PolyvWatchAppSdk) {
      return window.PolyvWatchAppSdk.getActivePolyvWatchApp();
    }

    if (!polyvWatchAppInstance) {
      console.warn('not enough info to getPolyvWatchApp');
      return;
    }

    return polyvWatchAppInstance;
  } catch (error) {
    console.error('getPolyvWatchApp error', error);
  }
}

export function getPolyvWatchAppByUniqueId(uniqueId?: string): PolyvWatchAppClass | undefined {
  try {
    if (!uniqueId) {
      throw new Error('getPolyvWatchAppByUniqueId not uniqueId');
    }

    if (window.PolyvWatchAppSdk) {
      return window.PolyvWatchAppSdk.getPolyvWatchApp(uniqueId);
    }

    if (!polyvWatchAppInstance) {
      throw new Error('not enough info to getPolyvWatchApp');
    }

    return polyvWatchAppInstance;
  } catch (error) {
    console.error('getPolyvWatchApp error', error);
  }
}
