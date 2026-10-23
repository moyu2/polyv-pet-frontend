/**
 * @file 邀请 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { isWeixin } from '@/assets/utils/browser';

import {
  TAB_NAME_CHAT,
  TAB_NAME_DOC_OR_VIDEO,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_SEAT,
} from '@/assets/constants/tab-name';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useLayoutStore } from './use-layout-store';
import {
  InviteActivityInfo,
  InviteActivityStatus,
  InvitePrizeWinnerInfo,
  PlvInviteModule,
} from '@polyv/live-watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';

export interface InviteStoreState {
  /** 企业微信分享海报的企微员工 ID */
  wxInviteId: Ref<string | undefined>;
  /** 邀请海报唯一ID */
  invitePosterId: Ref<string | undefined>;
  /** 当前用户邀请者 openId */
  inviteUserOpenId: Ref<string | undefined>;
  /** 当前用户邀请者 unionId */
  inviteUserUnionId: Ref<string | undefined>;
  /** 邀请海报开关 */
  invitePosterEnabled: Ref<boolean>;
  /** 邀请榜开关 */
  inviteRankEnabled: Ref<boolean>;
  /** 邀请明细开关 */
  inviteDetailEnabled: Ref<boolean>;
  /** 邀请明细下载开关 */
  inviteDetailExportEnabled: Ref<boolean>;
  /** 邀请有礼活动信息 */
  inviteActivityInfo: Ref<InviteActivityInfo>;
  /** 邀请有礼活动即将结束提示 */
  inviteActivityWillEndTipVisible: Ref<boolean>;
  /** 邀请有礼中奖信息 */
  invitePrizeWinnerInfo: Ref<InvitePrizeWinnerInfo | null>;
  /** 邀请有礼活动开关 */
  inviteActivityEnabled: ComputedRef<boolean>;
  /** 邀请有礼活动状态 */
  inviteActivityStatus: ComputedRef<InviteActivityStatus>;
  /** 移动端聊天室 Tab 中邀请挂件是否显示 */
  mobileChatInvitePendantVisible: ComputedRef<boolean>;
  /** 移动端页面中常驻的邀请挂件是否显示 */
  mobileWatchInvitePendantVisible: ComputedRef<boolean>;
  /** 邀请海报选择页地址 */
  generatePosterUrl: Ref<string>;
}

export interface InviteStoreAction {
  /** 同步邀请信息 */
  syncInviteInfo: () => void;
  /** 同步邀请有礼活动信息 */
  syncInviteActivityInfo: () => void;
  /** 同步邀请有礼中奖信息 */
  syncInvitePrizeWinnerInfo: () => Promise<void>;
  /** 补充邀请参数到当前链接 */
  appendInviteQueueParams: () => void;
}

export interface InviteStore extends InviteStoreState, InviteStoreAction {}

export const useInviteStore = defineStore<'invite', InviteStore>('invite', () => {
  const watchAppStore = useWatchAppStore();
  const channelMenuStore = useChannelMenuStore();
  const layoutStore = useLayoutStore();
  const identityStore = useIdentityStore();

  const { appendQueryParam, paramGetter } = useQueryParams();

  /** 企业微信分享海报的企微员工 ID */
  const wxInviteId = ref(paramGetter().wxInviteId());

  /** 邀请海报唯一ID */
  const invitePosterId = ref(paramGetter().invitePosterId());

  /** 邀请者 openId */
  const inviteUserOpenId = ref<string>();

  /** 邀请者 unionId */
  const inviteUserUnionId = ref<string>();

  /** 邀请海报开关 */
  const invitePosterEnabled = ref(false);

  /** 邀请榜配置开关 */
  const inviteRankConfigEnabled = ref(true);

  /**
   * 邀请榜开关
   * 游客状态下开关为关
   */
  const inviteRankEnabled = computed(() => {
    return (
      inviteRankConfigEnabled.value &&
      channelMenuStore.inviteRankMenuData.visible &&
      !identityStore.isGuest
    );
  });

  /** 邀请明细开关 */
  const inviteDetailEnabled = ref(false);

  /** 邀请明细下载开关 */
  const inviteDetailExportEnabled = ref(false);

  /** 邀请有礼活动信息 */
  const inviteActivityInfo = ref<InviteActivityInfo>(
    PlvInviteModule.generateDefaultInviteActivityInfo(),
  );

  const inviteActivityWillEndTipVisible = ref(false);

  /** 邀请有礼中奖信息 */
  const invitePrizeWinnerInfo = ref<InvitePrizeWinnerInfo | null>(null);

  /** 邀请有礼活动开关 */
  const inviteActivityEnabled = computed(() => {
    return inviteActivityInfo.value.enabled;
  });

  /** 邀请有礼活动状态 */
  const inviteActivityStatus = computed(() => {
    return inviteActivityInfo.value.status;
  });

  /** 移动端聊天室 Tab 中邀请挂件是否显示 */
  const mobileChatInvitePendantVisible = computed<boolean>(() => {
    // 非微信环境下并且没有用户信息时不显示
    if (!isWeixin && !identityStore.identityUnionInfo) {
      return false;
    }
    // 如果存在邀请榜的 tab 则不显示邀请榜挂件
    if (channelMenuStore.inviteRankMenuData.visible) {
      return false;
    }

    return unref(invitePosterEnabled);
  });

  /** 移动端页面中常驻的邀请挂件是否显示 */
  const mobileWatchInvitePendantVisible = computed<boolean>(() => {
    // 非微信环境下并且没有用户信息时不显示
    if (!isWeixin && !!identityStore.identityUnionInfo) {
      return false;
    }

    // 如果存在邀请榜的 tab 则不显示邀请榜挂件
    if (channelMenuStore.inviteRankMenuData.visible) {
      return false;
    }

    if (layoutStore.isPageFullscreenOrHorizontalScreen) {
      return false;
    }

    // 当前在以下的 tabName 不显示
    const excludeTabName: string[] = [
      TAB_NAME_CHAT,
      TAB_NAME_SEAT,
      TAB_NAME_MICRO_ACTIVITY,
      TAB_NAME_DOC_OR_VIDEO,
    ];
    if (excludeTabName.includes(layoutStore.mobileMenuCurrentName)) {
      return false;
    }

    return unref(invitePosterEnabled);
  });

  /** 邀请海报选择页地址 */
  const generatePosterUrl = ref<string>('');

  /** 同步邀请信息 */
  function syncInviteInfo() {
    const watchCore = watchAppStore.getWatchCore();

    invitePosterEnabled.value = watchCore.invite.getInvitePosterEnabled();
    inviteRankConfigEnabled.value = watchCore.invite.getInviteRankEnabled();

    const inviteUserInfo = watchCore.invite.getInviteUserInfo(false);
    inviteUserOpenId.value = inviteUserInfo?.inviteOpenId;
    inviteUserUnionId.value = inviteUserInfo?.inviteUnionId;

    wxInviteId.value = watchCore.invite.getWorkWxInviteId();
    generatePosterUrl.value = watchCore.invite.getInviteGeneratePosterUrl();

    inviteDetailEnabled.value = watchCore.invite.getInviteDetailEnabled();
    inviteDetailExportEnabled.value = watchCore.invite.getInviteDetailExportEnabled();

    if (invitePosterEnabled.value) {
      invitePosterId.value = watchCore.invite.getInvitePosterId();
    }
  }

  /**
   * 补充邀请参数到当前链接
   */
  function appendInviteQueueParams() {
    const params: Parameters<typeof appendQueryParam>[0] = {};

    if (invitePosterId.value) {
      params.invitePosterId = invitePosterId.value;
    }

    appendQueryParam(params);
  }

  /** 同步邀请有礼活动信息 */
  function syncInviteActivityInfo() {
    const watchCore = watchAppStore.getWatchCore();
    inviteActivityInfo.value = watchCore.invite.getInviteActivityInfo();
  }

  /** 同步邀请有礼中奖信息 */
  async function syncInvitePrizeWinnerInfo() {
    const watchCore = watchAppStore.getWatchCore();
    invitePrizeWinnerInfo.value = await watchCore.invite.getInvitePrizeWinnerInfo();
  }

  return {
    wxInviteId,
    invitePosterId,
    inviteUserOpenId,
    inviteUserUnionId,
    invitePosterEnabled,
    inviteRankEnabled,
    inviteDetailEnabled,
    inviteDetailExportEnabled,

    inviteActivityInfo,
    inviteActivityWillEndTipVisible,
    invitePrizeWinnerInfo,
    inviteActivityEnabled,
    inviteActivityStatus,

    mobileChatInvitePendantVisible,
    mobileWatchInvitePendantVisible,
    generatePosterUrl,

    syncInviteInfo,
    syncInviteActivityInfo,
    syncInvitePrizeWinnerInfo,

    appendInviteQueueParams,
  };
});
