import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { PageAdvertItem, IconAdvertItem, PlvChannelModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface AdvertStoreState {
  /** 图标广告开关 */
  imgAdvertEnabled: Ref<boolean>;
  /** 图标广告列表 */
  imgAdvertList: Ref<IconAdvertItem[]>;
  /** 图标广告关闭按钮是否显示 */
  imgCloseVisible: Ref<boolean>;
  /** 图标广告是否显示 */
  imgAdvertVisible: Ref<boolean>;
  /** 页面广告开关 */
  pageAdvertEnabled: Ref<boolean>;
  /** 页面广告列表 */
  pageAdvertList: Ref<PageAdvertItem[]>;
  /** 页面广告关闭按钮是否显示 */
  pageAdvertCloseVisible: Ref<boolean>;
  /** 页面广告是否显示 */
  pageAdvertVisible: Ref<boolean>;
}

export interface AdvertStoreActions {
  /** 同步广告 store */
  syncAdvertStore(): void;
  /** 关闭页面广告 */
  closePageAdvert(): void;
  /** 关闭图标广告 */
  closeImgAdvert(): void;
}

export type AdvertStore = AdvertStoreState & AdvertStoreActions;

/**
 * 广告信息 Store
 */
export const useAdvertStore = defineStore<'advert', AdvertStore>('advert', () => {
  const watchAppStore = useWatchAppStore();

  // 获取默认的图标广告设置
  const __imgAdvertSetting = PlvChannelModule.generateDefaultImgAdvertSetting();

  /** 图标广告开关 */
  const imgAdvertEnabled = ref(__imgAdvertSetting.imgAdvertEnabled);

  /** 图标广告列表 */
  const imgAdvertList = ref<IconAdvertItem[]>(__imgAdvertSetting.imgAdvertList);

  /** 图标广告开关 */
  const imgCloseVisible = ref(__imgAdvertSetting.closeImgAdvertEnabled);

  // 获取默认的页面广告设置
  const __pageAdvertSetting = PlvChannelModule.generateDefaultPageAdvertSetting();

  /** 页面广告开关 */
  const pageAdvertEnabled = ref(__pageAdvertSetting.pageAdvertEnabled);

  /** 页面广告列表 */
  const pageAdvertList = ref<PageAdvertItem[]>(__pageAdvertSetting.pageAdvertList);

  /** 页面广告-关闭按钮是否显示 */
  const pageAdvertCloseVisible = ref(__pageAdvertSetting.closeAdvertEnabled);

  /** 页面广告是否显示 */
  const { visible: pageAdvertVisible, close: closePageAdvert } = useSimpleVisible(true);

  /** 图标广告是否显示 */
  const { visible: imgAdvertVisible, close: closeImgAdvert } = useSimpleVisible(true);

  function syncPageAdvertSetting() {
    const watchCore = watchAppStore.getWatchCore();
    const advertSetting = watchCore.channel.getPageAdvertSetting();

    pageAdvertEnabled.value = advertSetting.pageAdvertEnabled;
    pageAdvertCloseVisible.value = advertSetting.closeAdvertEnabled;
    pageAdvertList.value = advertSetting.pageAdvertList;

    if (!advertSetting.pageAdvertEnabled || advertSetting.pageAdvertList.length === 0) {
      closePageAdvert();
    }
  }

  function syncImgAdvertSetting() {
    const watchCore = watchAppStore.getWatchCore();
    const imgAdvertSetting = watchCore.channel.getImgAdvertSetting();
    console.info('图标广告数据', imgAdvertSetting);

    imgAdvertEnabled.value = imgAdvertSetting.imgAdvertEnabled;
    imgCloseVisible.value = imgAdvertSetting.closeImgAdvertEnabled;
    imgAdvertList.value = imgAdvertSetting.imgAdvertList;

    if (!imgAdvertSetting.imgAdvertEnabled || imgAdvertSetting.imgAdvertList.length === 0) {
      closeImgAdvert();
    }
  }

  function syncAdvertStore() {
    syncPageAdvertSetting();
    syncImgAdvertSetting();
  }

  return {
    imgAdvertEnabled,
    imgAdvertList,
    imgCloseVisible,
    imgAdvertVisible,
    closeImgAdvert,

    pageAdvertVisible,
    pageAdvertEnabled,
    pageAdvertList,
    pageAdvertCloseVisible,
    closePageAdvert,

    syncAdvertStore,
  };
});
