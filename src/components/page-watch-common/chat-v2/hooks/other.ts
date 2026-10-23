import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { TAB_NAME_PRODUCT } from '@/assets/constants/tab-name';
import { translate } from '@/assets/lang';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import type { ChatMsgSource } from '@polyv/chat';
import type { MessageConfig, MessageEffectData, MessageLayout } from '@polyv/chat-ui';
import {
  ChannelMenuType,
  ChatMessageLayout,
  LikeEffectType,
  ProductEntryPosition,
} from '@polyv/live-watch-sdk';
import { useBrowser } from '@polyv/vue-components';
import { useChatTarget } from './use-chat-target';
import { useIdentityStore } from '@/store/use-identity-store';

/**
 * 消息隐藏相关
 */
export const useHideChatMsg = () => {
  const chatStore = useChatStore();
  const { ChatMsgSource } = useChatTarget();

  function getHideSources(): ChatMsgSource[] {
    const hideSources: ChatMsgSource[] = [];

    /** ---------- 自定义消息是否显示 ---------- */
    if (!chatStore.chatSetting.showCustomMessageEnabled) {
      hideSources.push(ChatMsgSource.CustomServer);
    }

    return hideSources;
  }

  return {
    getHideSources,
  };
};

/**
 * 消息布局相关
 */
export const useMessageLayout = () => {
  const { isPortraitWatchLayout, chatTopicHeight } = storeDefinitionToRefs(useLayoutStore);
  const { chatSetting } = storeDefinitionToRefs(useChatStore);
  const { isMobile } = useBrowser();

  function __formatLayout(target: ChatMessageLayout): MessageLayout {
    return target === ChatMessageLayout.Loose ? 'loose' : 'compact';
  }

  /**
   * 获取消息布局
   */
  function getMessageLayout(): MessageLayout {
    if (isPortraitWatchLayout.value) {
      return __formatLayout(chatSetting.value.portraitChatMessageLayout);
    }
    return __formatLayout(chatSetting.value.chatMessageLayout);
  }

  /**
   * 获取是否显示用户头像
   */
  function getShowUserAvatar(): boolean {
    if (isPortraitWatchLayout.value) {
      return chatSetting.value.portraitChatMessageAvatarDisplay;
    }
    return chatSetting.value.chatMessageAvatarDisplay;
  }

  function getMessageHorizontalSpacing(): MessageConfig['messageHorizontalSpacing'] {
    return isPortraitWatchLayout.value
      ? {
          left: 0,
          right: 0,
        }
      : {
          left: 16,
          right: 64,
        };
  }

  function getMessageContainerBoundaryPadding(): MessageConfig['messageContainerBoundaryPadding'] {
    if (isPortraitWatchLayout.value) {
      return {
        top: 0,
        bottom: 0,
      };
    }
    return isMobile
      ? {
          top: 14,
          bottom: 0,
        }
      : {
          top: 16,
          bottom: 16,
        };
  }

  function getMessageContainerBoundaryShadow(): MessageConfig['messageContainerBoundaryShadow'] {
    if (isPortraitWatchLayout.value) {
      return {
        topHeight: 0,
      };
    }

    if (chatTopicHeight.value <= 12) {
      return {
        topHeight: 0,
      };
    }

    return {
      topHeight: chatTopicHeight.value,
    };
  }

  return {
    getMessageLayout,
    getShowUserAvatar,
    getMessageHorizontalSpacing,
    getMessageContainerBoundaryPadding,
    getMessageContainerBoundaryShadow,
  };
};

/**
 * 复制发言消息相关
 */
export const useCopySpeakMsg = () => {
  const { chatSetting } = storeDefinitionToRefs(useChatStore);

  /**
   * 获取是否可以复制发言消息
   */
  function getCopySpeakEnabled(): boolean {
    return chatSetting.value.chatTranslateEnabled || chatSetting.value.quoteReplyEnabled;
  }

  return {
    getCopySpeakEnabled,
  };
};

/**
 * 聊天室输入框相关
 */
export const useChatMessageInput = () => {
  const channelMenuStore = useChannelMenuStore();
  const chatStore = useChatStore();
  const identityStore = useIdentityStore();

  const { needInterruptUserClick } = useInterruptUserClick();

  /**
   * 聊天室输入框占位符
   */
  function getChatInputPlaceholder() {
    let placeholder = translate('chat.input.placeholder');

    // 后台中聊天室的占位设置
    const chatMenu = channelMenuStore.getMenuData(ChannelMenuType.Chat);
    if (chatMenu && chatMenu.content) {
      placeholder = chatMenu.content;
    }

    if (chatStore.chatRoomLongTimeNotUsed || chatStore.chatExited) {
      placeholder = translate('chat.roomClosed');
    }

    if (identityStore.isGuest) {
      placeholder = translate('auth.login.tips.interaction');
    }

    return placeholder;
  }

  /**
   * 获取是否禁用聊天室输入框
   */
  function getDisabledInput() {
    // 需要中断用户点击
    if (needInterruptUserClick.value) {
      return true;
    }

    // 聊天室被退出
    if (chatStore.chatExited) {
      return true;
    }

    // 聊天室长时间未使用
    if (chatStore.chatRoomLongTimeNotUsed) {
      return true;
    }

    return false;
  }

  return {
    getChatInputPlaceholder,
    getDisabledInput,
  };
};

export function getAskMessageInput() {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();
  const chatStore = useChatStore();
  const askSetting = watchCore.ask.getAskSetting();

  function getAskInputPlaceholder() {
    if (chatStore.chatRoomLongTimeNotUsed || chatStore.chatExited) {
      return translate('chat.roomClosed');
    }

    if (askSetting.questionPlaceholder) {
      return askSetting.questionPlaceholder;
    }

    return translate('ask.input.placeholder');
  }

  return {
    getAskInputPlaceholder,
  };
}

/**
 * 消息点击回调相关
 */
export function useClickMsgCallback() {
  const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);
  const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
  const layoutStore = useLayoutStore();

  const { toInterruptUserClick } = useInterruptUserClick();

  const { ChatMsgSource } = useChatTarget();
  const PolyvChatUI = getChatUIV2Pkg();
  const { isMobile } = useBrowser();

  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const MessageEffectType = PolyvChatUI.MessageEffectType;

  const clickMsgCallback: MessageConfig['clickMsgCallback'] = {
    [ChatMsgSource.Effect]: async chatMsg => {
      const effectData = chatMsg.data as MessageEffectData;
      const { effectType, targetId } = effectData;
      // 仅商品点击、商品购买才有点击交互
      if (
        [MessageEffectType.ProductBuy, MessageEffectType.ProductClick].includes(effectType) &&
        targetId
      ) {
        const productTarget = await watchCore.product.getProductTarget();
        const productDetail = await productTarget.getProductData(Number(targetId));
        if (!productDetail) return;

        // 普通、职位商品打开商品详情
        if (
          [productTarget.ProductType.Normal, productTarget.ProductType.Position].includes(
            productDetail.productType,
          )
        ) {
          getEmitter().emit(appEvents.product.OpenProductDetailPopup, productDetail.productId);
          return;
        }
        if (!isMobile) {
          // PC 端，开启「播放器是否悬浮商品列表入口开关」，打开商品列表弹层
          if (interactSetting.value.productEntryPosition === ProductEntryPosition.Player) {
            getEmitter().emit(appEvents.product.OpenProductListPopup);
            return;
          }
          // 切换到商品列表的 tab
          layoutStore.$patch({
            pcAsideTabCurrentName: TAB_NAME_PRODUCT,
          });
        } else {
          // 横/竖屏观看页，打开商品列表
          getEmitter().emit(appEvents.product.OpenProductListPopup);
        }
      }
    },
    [ChatMsgSource.Reward]: () => {
      if (!showDonateFunction.value) {
        return;
      }

      const intercepted = toInterruptUserClick({
        triggerSource: 'reward-msg',
        ignoreSetNick: true,
      });
      if (intercepted) {
        return;
      }

      getEmitter().emit(appEvents.donate.OpenDonatePopup);
    },
  };

  return {
    clickMsgCallback,
  };
}

export const useChatLikeConfig = () => {
  const { getWatchCore } = useGlobalInject();
  const { chatSetting } = storeDefinitionToRefs(useChatStore);

  const watchCore = getWatchCore();

  function getLikeEffectIcons(): string[] {
    const domainInfo = watchCore.domain.getDomainInfo();
    const likeEffectType = chatSetting.value.likeEffectType;
    const likeEffectIcons = chatSetting.value.likeEffectIcons;

    switch (likeEffectType) {
      case LikeEffectType.Festival:
        return [
          `${domainInfo.resourceDomain}/default-img/like/festival/1.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/2.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/3.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/4.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/5.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/6.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/7.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/8.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/9.png`,
          `${domainInfo.resourceDomain}/default-img/like/festival/10.png`,
        ];
      case LikeEffectType.Custom:
        return likeEffectIcons;
      default:
        return [
          `${domainInfo.resourceDomain}/default-img/like/system/1.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/2.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/3.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/4.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/5.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/6.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/7.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/8.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/9.png`,
          `${domainInfo.resourceDomain}/default-img/like/system/10.png`,
        ];
    }
  }

  return {
    getLikeEffectIcons,
  };
};
