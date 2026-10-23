import { AuthSettingItem } from '@polyv/live-watch-sdk';
import { ComputedRef } from 'vue';

export interface AuthButtonInject<ItemType extends AuthSettingItem = AuthSettingItem> {
  /** 观看条件数据 */
  authItem: ItemType;
  computedAuthItem: ComputedRef<ItemType>;
  /** 监听点击事件 */
  listenClickAuthButton: (callback: AnyFunc) => void;
  /** 取消监听点击事件 */
  unlistenClickAuthButton: (callback: AnyFunc) => void;
}
