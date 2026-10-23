import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { computed } from 'vue';
import type { InterceptTriggerSource as ChatInterruptTriggerSource } from '@polyv/chat-ui';

type IarInterruptTriggerSource =
  | 'iar-qa'
  | 'coupon-pendant'
  | 'lottery-pendant'
  | 'before-join-lottery'
  | 'show-lottery-list'
  | 'lucky-lottery-pendant'
  | 'vote-pendant'
  | 'personal-reward'
  | 'mobile-product-pendant'
  | 'pc-product-pendant'
  | 'product-big-card-popup'
  | 'mobile-product-small-card'
  | 'pc-product-small-card'
  | 'mobile-product-bottom-card'
  | 'pc-product-bottom-card'
  | 'before-choose-topic-pk-answer'
  | 'rolling-lottery'
  | 'shake-pk'
  | 'mobile-product-list'
  | 'pc-product-list';

export type WatchInterruptTriggerSource =
  | 'chat-input'
  | 'chat-input-placeholder'
  | 'chat-input-more'
  | 'chat-quote'
  | 'send-image'
  | 'ask-input'
  | 'enroll'
  | 'set-nick'
  | 'like'
  | 'donate'
  | 'reward-msg'
  | 'invite-poster'
  | 'splash-auth-button';

export type InterruptTriggerSource =
  | ChatInterruptTriggerSource
  | IarInterruptTriggerSource
  | WatchInterruptTriggerSource;

/**
 * 用户点击拦截
 * @desc 主要处理当前用户/观众信息不满足的情况，如游客强制登录、观众实名认证、观众昵称设置等，阻断后续业务操作
 */
export const useInterruptUserClick = () => {
  const identityStore = useIdentityStore();
  const viewerStore = useViewerStore();

  const { getEmitter } = useGlobalInject();

  const needInterruptUserClick = computed(() => {
    return identityStore.needIdentityGuestForceLogin || viewerStore.needRealNameAuth;
  });

  /**
   * 拦截用户点击
   * @returns 返回 true，说明已拦截，后续业务不再继续
   */
  function toInterruptUserClick(params: {
    /** 触发点记录 */
    triggerSource: InterruptTriggerSource;
    /** 是否可以忽略观众名称设置 */
    ignoreSetNick: boolean;
  }): boolean {
    const { triggerSource, ignoreSetNick } = params || {};

    // 用户体系-处理游客登录
    if (identityStore.needIdentityGuestForceLogin) {
      getEmitter().emit(appEvents.global.OpenIdentityLoginDialog, {
        triggerSource,
      });
      return true;
    }

    // 观众实名认证
    if (viewerStore.needRealNameAuth) {
      getEmitter().emit(appEvents.global.OpenRealNameDialog, true);
      return true;
    }

    // 观众昵称设置
    if (!viewerStore.hasNickname && !ignoreSetNick) {
      getEmitter().emit(appEvents.chat.OpenSetNick, true);
      return true;
    }

    return false;
  }

  return {
    needInterruptUserClick,
    toInterruptUserClick,
  };
};
