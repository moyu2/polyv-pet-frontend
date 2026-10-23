import { AreaDataJson } from '@/plugins/polyv-ui/types';
import { PlvDefaultResource, PlvUtilsModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface CommonStoreType {
  /** 中国地区数据 */
  areaData: Ref<AreaDataJson>;
  /** 保利威默认资源 */
  plvDefaultResource: Ref<PlvDefaultResource>;
  /** 同步数据 */
  syncCommonStore: () => void;
}

export const useCommonStore = defineStore<'common', CommonStoreType>('common', () => {
  const watchAppStore = useWatchAppStore();

  /** 中国地区数据 */
  const areaData = ref<AreaDataJson>([]);

  /** 保利威默认资源 */
  const plvDefaultResource = ref<PlvDefaultResource>(PlvUtilsModule.generateDefaultResource());

  /** 同步数据 */
  function syncCommonStore() {
    const watchCore = watchAppStore.getWatchCore();
    plvDefaultResource.value = watchCore.utils.getDefaultResource();
  }

  return {
    areaData,
    plvDefaultResource,
    syncCommonStore,
  };
});
