import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import {
  InteractReceiveEventsRelations,
  InteractReceiveEvents,
  ChatMsgSource,
  ChatMsgEffectType,
  ChatEventsRelations,
  ChatEvents,
  ProductClickType,
} from '@polyv/live-watch-sdk';
import { randomStr } from '@polyv/utils/string';
import { onMounted, onBeforeUnmount } from 'vue';
import { MessageEffectData, MessageEffectType } from '../type';
import { useEffectSetting } from './use-effect-setting';

export const useMessageEffect = () => {
  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const chatMsgStore = useChatMsgStore();

  const { getEffectSetting, getProductClickTemplate, getProductBuyTemplate } = useEffectSetting();

  /** 最大间隔时间，3 秒 */
  const maxTime = 3000;

  /**
   * 获取商品消息的下标
   * @param productId 商品 id
   * @param type 特效类型
   */
  function getProductMsgIndex(productId: string, type: MessageEffectType) {
    const historyData = chatMsgStore.getHistoryData();
    return historyData.findIndex(chatMsg => {
      if (chatMsg.msgSource === ChatMsgSource.Effect && Date.now() - chatMsg.time < maxTime) {
        const data = chatMsg.data as MessageEffectData;

        if (data.effectType === type && data.targetId === productId) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * 处理商品点击和购买事件
   * @param effectType 特效类型
   * @param data 商品数据
   */
  function handleProductEvent(
    effectType: MessageEffectType.ProductClick | MessageEffectType.ProductBuy,
    data: {
      type: ProductClickType;
      nickname: string;
      productId: string;
      productName: string;
      nicknameCount: number;
    },
  ) {
    const { type, nickname, productId, productName, nicknameCount } = data;

    const msgIndex = getProductMsgIndex(productId, effectType);
    if (msgIndex !== -1) {
      // 找到要更改的消息
      const historyData = chatMsgStore.getHistoryData();
      const chatMsg = historyData[msgIndex] as ChatMsgEffectType;
      const effectData = chatMsg.data as MessageEffectData;
      effectData.nicknameCount += nicknameCount;
      const eventData: ChatEventsRelations[ChatEvents.ReplaceChatMessage] = {
        id: chatMsg.id,
        chatMsg,
      };
      getEmitter().emit(appEvents.chat.ReplaceChatMessage, eventData);
    } else {
      let strTemplate = '';
      if (effectType === MessageEffectType.ProductClick) {
        strTemplate = getProductClickTemplate(type);
      } else {
        strTemplate = getProductBuyTemplate();
      }
      if (!strTemplate) {
        return;
      }

      const id = randomStr(8);
      const effectData: MessageEffectData = {
        id,
        effectType,
        nicknames: [nickname],
        nicknameCount,
        targetId: productId,
        targetName: productName,
        productType: type,
        strTemplate,
      };

      // 模拟一条消息，插入到本地消息队列
      const chatMsg: ChatMsgEffectType = {
        id,
        msgSource: ChatMsgSource.Effect,
        time: Date.now(),
        data: effectData,
      };
      const eventData: ChatEventsRelations[ChatEvents.ChatMessage] = {
        chatMsg,
      };
      getEmitter().emit(appEvents.chat.JoinMsgQueue, eventData);
    }
  }

  function onProductClickEvent(
    data: InteractReceiveEventsRelations[InteractReceiveEvents.ProductClick],
  ) {
    const type = data.type;
    const nickname = data.nickname;
    const productId = data.productId;
    const productName = data.name;
    handleProductEvent(MessageEffectType.ProductClick, {
      type,
      nickname,
      productId,
      productName,
      nicknameCount: 1,
    });
  }

  function onProductBuyEvent(
    data: InteractReceiveEventsRelations[InteractReceiveEvents.ProductBuyTimes],
  ) {
    const type = data.productType;
    const nickname = data.nickname;
    const productId = data.productId;
    const productName = data.productName;
    const count = data.count;

    handleProductEvent(MessageEffectType.ProductBuy, {
      type,
      nickname,
      productId,
      productName,
      nicknameCount: count,
    });
  }

  onMounted(() => {
    if (getEffectSetting().productEffectEnabled) {
      watchCore.interactReceive.eventEmitter.on(
        InteractReceiveEvents.ProductClick,
        onProductClickEvent,
      );

      watchCore.interactReceive.eventEmitter.on(
        InteractReceiveEvents.ProductBuyTimes,
        onProductBuyEvent,
      );
    }
  });

  onBeforeUnmount(() => {
    if (getEffectSetting().productEffectEnabled) {
      watchCore.interactReceive.eventEmitter.off(
        InteractReceiveEvents.ProductClick,
        onProductClickEvent,
      );

      watchCore.interactReceive.eventEmitter.off(
        InteractReceiveEvents.ProductBuyTimes,
        onProductBuyEvent,
      );
    }
  });
};
