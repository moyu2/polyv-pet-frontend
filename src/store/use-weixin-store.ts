/**
 * @file 微信 store
 */
import { isWeixin } from '@/assets/utils/browser';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { PlvWeixinModule, WeixinPayType, WxShareInfo, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { defineStore } from 'pinia';
import { ComputedRef, Ref, computed, ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';
import { appendRedirectUrlParams } from '@/assets/utils/url';
import { useInviteStore } from './use-invite-store';
import { useShareStore } from './use-share-store';

/** 微信分享地址中附带的参数 */
export interface WxShareUrlParams {
  /** 企微邀请的员工 id */
  wxInviteId?: string;
  /** 邀请人 id */
  invitePosterId?: string;
  /** 回放分享-回放 Id */
  playBackVid?: string;
  /** 一客一码--销售邀请的客户id */
  inviteCustomerId?: string;
  /** 邀请观看--分销员/邀请人id */
  inviteWatchSaleId?: string;
}

export interface WeixinStoreState {
  /** 是否使用微信 SDK 功能 */
  wxSdkFeatureEnabled: Ref<boolean>;
  /** 是否支持使用企业微信相关功能 */
  workWeixinFunctionEnabled: Ref<boolean>;
  /** 是否进入微信快照页模式 */
  isWeixinSnapshotPageMode: Ref<boolean>;
  /** 是否已进行微信授权 */
  weixinAuthorized: Ref<boolean>;
  /** 是否已进行微信非静默授权 */
  weixinWatchAuthorized: Ref<boolean>;
  /** 是否已进行企业微信授权 */
  workWeixinAuthorized: Ref<boolean>;
  /** 微信分享信息 */
  wxShareInfo: Ref<WxShareInfo>;
  /** 微信分享地址上需要携带的参数 */
  wxShareUrlParams: ComputedRef<WxShareUrlParams>;
  /** 是否开启微信自定义分享地址参数 */
  weixinShareCustomUrlWithParamEnabled: ComputedRef<boolean>;
  /** 微信自定义分享地址 */
  wxCustomShareUrl: ComputedRef<string>;
  /** 微信支付类型 */
  weixinPayType: Ref<WeixinPayType>;
  /** 是否可以在微信中重新设置昵称 */
  weixinResetNickEnabled: Ref<boolean>;
}

export interface WeixinStoreAction {
  syncWeixinStore: () => void;
  /** 保存微信分享信息 */
  saveWxShareInfo: (info: WxShareInfo) => void;
}

export interface WeixinStore extends WeixinStoreState, WeixinStoreAction {}

export const useWeixinStore = defineStore<'weixin', WeixinStore>('weixin', () => {
  const watchAppStore = useWatchAppStore();
  const shareStore = useShareStore();
  const inviteStore = useInviteStore();

  const { paramGetter } = useQueryParams();

  /** 是否使用微信 SDK 功能 */
  const wxSdkFeatureEnabled = ref(ynToBool(paramGetter().wxSdkFeatureEnabled(), YN.Y));

  /** 是否支持使用企业微信相关功能 */
  const workWeixinFunctionEnabled = ref(false);

  /** 是否进入微信快照页模式 */
  const isWeixinSnapshotPageMode = ref(false);

  /** 是否已进行微信授权 */
  const weixinAuthorized = ref(false);

  /** 是否已进行微信非静默授权 */
  const weixinWatchAuthorized = ref(false);

  /** 是否已进行企业微信授权 */
  const workWeixinAuthorized = ref(false);

  /** 微信分享信息 */
  const wxShareInfo = ref<WxShareInfo>({
    isUseWxShareUrl: YN.N,
    weixinShareCustomUrlWithParamEnabled: YN.N,
    wxShareUrl: '',
    weixinShareCoverImg: '',
    shareTitle: '',
    shareDesc: '',
  });

  /** 微信分享地址上需要携带的参数 */
  const wxShareUrlParams = computed(() => {
    const params: WxShareUrlParams = {};

    // 企微邀请的员工 id
    if (inviteStore.wxInviteId) {
      params.wxInviteId = inviteStore.wxInviteId;
    }

    // 针对开启邀请的频道添加邀请参数到微信分享 url
    if (inviteStore.invitePosterId) {
      params.invitePosterId = inviteStore.invitePosterId;
    }

    // 一客一码--销售邀请的客户id
    if (shareStore.saleInviteCustomerId) {
      params.inviteCustomerId = shareStore.saleInviteCustomerId;
    }

    // 邀请观看--分销员/邀请人id
    if (shareStore.inviteWatchSaleId) {
      params.inviteWatchSaleId = shareStore.inviteWatchSaleId;
    }

    return params;
  });

  /** 是否开启微信自定义分享地址参数 */
  const weixinShareCustomUrlWithParamEnabled = computed(() => {
    return ynToBool(wxShareInfo.value.weixinShareCustomUrlWithParamEnabled, YN.N);
  });

  /** 微信自定义分享地址 */
  const wxCustomShareUrl = computed(() => {
    const shareInfo = wxShareInfo.value;

    // 使用后台设置的自定义微信分享地址
    const isUseWxShareUrl = ynToBool(shareInfo.isUseWxShareUrl, YN.N);
    if (!isUseWxShareUrl) return '';

    if (!weixinShareCustomUrlWithParamEnabled.value) {
      return shareInfo.wxShareUrl;
    }

    return appendRedirectUrlParams<WxShareUrlParams>(shareInfo.wxShareUrl, wxShareUrlParams.value, {
      forbiddenFields: ['snapshotPage'],
    });
  });

  /** 保存微信分享信息 */
  function saveWxShareInfo(info: WxShareInfo): void {
    wxShareInfo.value = info;
  }

  const __weixinConfig = PlvWeixinModule.generateDefaultWeixinConfig();

  /** 微信支付类型 */
  const weixinPayType = ref<WeixinPayType>(__weixinConfig.weixinPayType);

  /** 是否可以在微信中重新设置昵称 */
  const weixinResetNickEnabled = ref(__weixinConfig.weixinResetNickEnabled);

  function syncWeixinStore() {
    const watchCore = watchAppStore.getWatchCore();

    workWeixinFunctionEnabled.value = watchCore.weixin.getWorkWeixinFunctionEnabled();

    isWeixinSnapshotPageMode.value = isWeixin && watchCore.weixin.isWeixinSnapshotPageMode();
    weixinAuthorized.value = watchCore.weixin.isWeixinAuthorized();
    weixinWatchAuthorized.value = watchCore.weixin.isWeixinWatchAuthorized();
    workWeixinAuthorized.value = watchCore.weixin.isWorkWeixinAuthorized();

    const weixinConfig = watchCore.weixin.getWeixinConfig();
    weixinPayType.value = weixinConfig.weixinPayType;
    weixinResetNickEnabled.value = weixinConfig.weixinResetNickEnabled;
  }

  return {
    wxSdkFeatureEnabled,
    workWeixinFunctionEnabled,
    isWeixinSnapshotPageMode,
    weixinAuthorized,
    weixinWatchAuthorized,
    workWeixinAuthorized,

    wxShareInfo,
    wxShareUrlParams,
    weixinShareCustomUrlWithParamEnabled,
    wxCustomShareUrl,

    weixinPayType,
    weixinResetNickEnabled,
    saveWxShareInfo,
    syncWeixinStore,
  };
});
