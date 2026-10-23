import {
  IdentitySetting,
  IdentityUnionInfo,
  IdentityDirectAuthParams,
  PlvIdentityModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export type SessionIdentityType = 'none' | 'guest' | 'formal';

export interface IdentityStore {
  /** 用户系统开关 */
  watchUserSystemEnabled: Ref<boolean>;
  /** 观众身份唯一信息 */
  identityUnionInfo: Ref<IdentityUnionInfo | undefined>;
  /** 身份设置 */
  identitySetting: Ref<IdentitySetting>;
  /** 用户体系游客模式开关 */
  guestModeEnabled: Ref<boolean>;
  /** 绑定用户手机号是否显示 */
  bindMobileVisible: ComputedRef<boolean>;
  /** 是否需要游客强制登录（游客转正式用户） */
  needIdentityGuestForceLogin: ComputedRef<boolean>;
  /** 当前用户标签 id 列表 */
  currentLabelIds: ComputedRef<number[]>;
  /** 会话身份三态 */
  sessionIdentity: ComputedRef<SessionIdentityType>;
  /** 同步 Store 数据 */
  syncIdentityStore(): void;
  /** 当前用户是否是游客 */
  isGuest: Ref<boolean>;
  /** 重置当前用户游客身份 */
  resetGuest(): void;
  /** 获取独立授权参数 */
  getDirectAuthParams(): IdentityDirectAuthParams;
  /** 允许验证独立授权 */
  allowToVerifyDirectAuth(): boolean;
}

export const useIdentityStore = defineStore<'identity', IdentityStore>('identity', () => {
  const watchAppStore = useWatchAppStore();

  const { paramGetter } = useQueryParams();

  /** 用户系统开关 */
  const watchUserSystemEnabled = ref(false);

  /** 用户体系游客模式开关（频道详情下发，配置级） */
  const guestModeEnabled = ref(false);

  /** 当前用户是否是游客 */
  const isGuest = ref(false);

  /** 用户身份唯一信息 */
  const identityUnionInfo = ref<IdentityUnionInfo>();

  const identitySetting = ref(PlvIdentityModule.generateDefaultIdentitySetting());

  /**
   * 是否是外部用户
   */
  const isExternalUser = computed(() => {
    return !!identityUnionInfo.value?.externalViewerId;
  });

  /**
   * 绑定用户手机号是否显示
   */
  const bindMobileVisible = computed(() => {
    if (!watchUserSystemEnabled.value || !identityUnionInfo.value) {
      return false;
    }

    // 游客和外部用户不显示绑定手机号
    if (isGuest.value || isExternalUser.value) {
      return false;
    }

    return !identityUnionInfo.value.phoneNumber;
  });

  /**
   * 是否需要游客强制登录（游客转正式用户）
   */
  const needIdentityGuestForceLogin = computed(() => {
    return isGuest.value && watchUserSystemEnabled.value;
  });

  /**
   * 会话身份三态（游客身份蕴含身份存在，优先判定；快照经整页重载刷新）
   */
  const sessionIdentity = computed<SessionIdentityType>(() => {
    if (isGuest.value) {
      return 'guest';
    }
    if (identityUnionInfo.value) {
      return 'formal';
    }
    return 'none';
  });

  /**
   * 当前用户标签 id 列表
   */
  const currentLabelIds = computed(() => {
    return (identityUnionInfo.value?.labels || []).map(item => item.id);
  });

  function syncIdentityStore() {
    const watchCore = watchAppStore.getWatchCore();

    const setting = watchCore.identity.getIdentitySetting();
    identitySetting.value = setting;

    if (watchAppStore.forceSplashPage) {
      watchUserSystemEnabled.value = false;
    } else {
      watchUserSystemEnabled.value = setting.watchUserSystemEnabled;
    }

    guestModeEnabled.value = setting.guestModeEnabled;

    identityUnionInfo.value = watchCore.identity.getIdentityUnionInfo();
    isGuest.value = identityUnionInfo.value?.isGuest || false;
  }

  function resetGuest() {
    isGuest.value = false;
  }

  function getDirectAuthParams(): IdentityDirectAuthParams {
    return {
      externalViewerId: paramGetter().externalViewerId() || '',
      nickname: paramGetter().nickname() || '',
      ts: paramGetter().ts() as unknown as number,
      param4: paramGetter().param4(),
      param5: paramGetter().param5(),
      sign: paramGetter().sign() || '',
      avatar: paramGetter().avatar(),
    };
  }

  function allowToVerifyDirectAuth() {
    const watchCore = watchAppStore.getWatchCore();
    return watchCore.identity.allowToVerifyDirectAuth(getDirectAuthParams());
  }

  return {
    watchUserSystemEnabled,
    isGuest,
    identityUnionInfo,
    identitySetting,
    guestModeEnabled,
    bindMobileVisible,
    needIdentityGuestForceLogin,
    currentLabelIds,
    sessionIdentity,
    syncIdentityStore,
    resetGuest,
    getDirectAuthParams,
    allowToVerifyDirectAuth,
  };
});
