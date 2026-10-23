import { getLocalStorage, setLocalStorage } from '@/assets/utils/storage';
import { load as fingerPrintJsLoad } from '@fingerprintjs/fingerprintjs';
import { onMounted } from 'vue';

let fingerPrintPromise: Promise<string | undefined> | undefined;

const VISITOR_ID_STORAGE_KEY = 'visitor-id';

/**
 * 浏览器指纹 hook
 */
export const useFingerPrint = () => {
  /**
   * 初始化指纹
   */
  function initFingerPrint() {
    if (!fingerPrintPromise) {
      fingerPrintPromise = new Promise<string | undefined>(resolve => {
        const storageVal = getLocalStorage(VISITOR_ID_STORAGE_KEY);
        if (storageVal) {
          resolve(storageVal);
          return;
        }

        (async () => {
          try {
            const fp = await fingerPrintJsLoad();
            const result = await fp.get();
            const visitorId = result.visitorId;

            setLocalStorage(VISITOR_ID_STORAGE_KEY, visitorId);

            resolve(visitorId);
          } catch (e) {
            resolve(undefined);
          }
        })();
      });
    }
    return fingerPrintPromise;
  }

  onMounted(() => {
    initFingerPrint();
  });

  /**
   * 获取访客 id
   */
  function getVisitorId(): Promise<string | undefined> {
    return initFingerPrint();
  }

  return {
    getVisitorId,
  };
};
