import { ref, Ref, unref } from 'vue';
import { defineStore } from 'pinia';
import {
  AuthInfoItem,
  AuthSettingItem,
  PickAuthSettingItem,
  AuthType,
} from '@polyv/live-watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';

export interface AuthStoreState {
  /** 观看条件列表 */
  authSettings: Ref<AuthSettingItem[]>;
  /** 观看条件按钮列表 */
  authButtonList: Ref<AuthSettingItem[]>;
  /** 登记观看表单设置 */
  authInfoFields: Ref<AuthInfoItem[]>;
  /** 是否已进行观看条件授权 */
  isAuthorized: Ref<boolean>;
}

export interface AuthStoreActions {
  syncAuthStore(): void;
  /** 是否存在某个观看条件 */
  hasAuth(authType: AuthType): boolean;
  /** 获取某个观看条件 */
  getAuthSettingItem: <T extends AuthType>(authType: T) => PickAuthSettingItem<T> | undefined;
}

export interface AuthStore extends AuthStoreState, AuthStoreActions {}

/** 观看条件 store */
export const useAuthStore = defineStore<'auth', AuthStore>('auth', () => {
  const watchAppStore = useWatchAppStore();

  /** 观看条件列表 */
  const authSettings = ref<AuthSettingItem[]>([]);

  /** 观看条件按钮列表 */
  const authButtonList = ref<AuthSettingItem[]>([]);
  // const authButtonList = computed<AuthSettingItem[]>(() => {
  //   return unref(authSettings).filter(authItem => {
  //     return authItem.authType !== AuthType.Direct;
  //   });
  // });

  /** 登记观看表单设置 */
  const authInfoFields = ref<AuthInfoItem[]>([]);

  /** 是否已进行观看条件授权 */
  const isAuthorized = ref(false);

  /** 是否存在某个观看条件 */
  function hasAuth(authType: AuthType): boolean {
    return unref(authSettings).findIndex(authItem => authItem.authType === authType) !== -1;
  }

  /** 获取某个观看条件 */
  function getAuthSettingItem<T extends AuthType>(authType: T): PickAuthSettingItem<T> | undefined {
    return unref(authSettings).find(authItem => authItem.authType === authType) as
      | PickAuthSettingItem<T>
      | undefined;
  }

  function syncAuthStore() {
    const watchCore = watchAppStore.getWatchCore();
    isAuthorized.value = watchCore.auth.isAuthorized();

    const settings = watchCore.auth.getAuthSettings();
    authSettings.value = settings;
    authButtonList.value = settings.filter(authItem => {
      if (authItem.authType === AuthType.Direct) {
        return false;
      }

      if (
        authItem.authType === AuthType.External &&
        !watchCore.auth.getExternalAuthButtonEnabled()
      ) {
        return false;
      }

      return true;
    });
    authInfoFields.value = watchCore.auth.getAuthInfoFields();
  }

  return {
    authSettings,
    authButtonList,
    authInfoFields,
    isAuthorized,
    hasAuth,
    getAuthSettingItem,
    syncAuthStore,
  };
});
