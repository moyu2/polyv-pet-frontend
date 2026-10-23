import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export interface PageStoreState {
  /** 页面显示状态 */
  visibilityState: Ref<boolean>;
  /** 页面宽度 */
  pageClientWidth: Ref<number>;
  /** 页面高度 */
  pageClientHeight: Ref<number>;
}

export interface PageStoreAction {
  /** 重新获取页面尺寸 */
  resetUpPageSize: () => void;
}

export interface PageStore extends PageStoreState, PageStoreAction {}

/**
 * 页面相关的 store
 */
export const usePageStore = defineStore<'page', PageStore>('page', () => {
  /** 页面显示状态 */
  const visibilityState = ref(true);

  /** 页面宽度 */
  const pageClientWidth = ref(document.documentElement.clientWidth);

  /** 页面高度 */
  const pageClientHeight = ref(document.documentElement.clientHeight);

  /** 重新获取页面尺寸 */
  function resetUpPageSize() {
    pageClientWidth.value = document.documentElement.clientWidth;
    pageClientHeight.value = document.documentElement.clientHeight;
  }

  return {
    visibilityState,
    pageClientWidth,
    pageClientHeight,

    resetUpPageSize,
  };
});
