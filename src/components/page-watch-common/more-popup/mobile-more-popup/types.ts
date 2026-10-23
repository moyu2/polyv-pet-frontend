import { InjectionKey } from 'vue';

export interface MorePopupInjectData {
  /**
   * 关闭更多
   */
  closeMore: () => void;
}

export const MORE_POPUP_INJECT_KEY: InjectionKey<MorePopupInjectData> =
  Symbol('MORE_POPUP_INJECT_KEY');
