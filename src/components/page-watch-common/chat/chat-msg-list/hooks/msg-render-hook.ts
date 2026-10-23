/**
 * @file 聊天室消息渲染 hook
 */
import { translate } from '@/assets/lang';
import { isUndefined } from 'lodash-es';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { RenderPosition } from '@polyv/utils/virtual-list';
import { ChatMsgType } from '@polyv/live-watch-sdk';
import Vue, { ComponentOptions } from 'vue';
import { ChatMsgItemPropsType } from '../msg-items/use-chat-msg-item';
import { ChatMsgListHookOptions } from './types';
import { useGlobalInject } from '@/app/use-global-inject';

export type ChatMsgItemComponentOptions = ComponentOptions<Vue>;

export const useMsgRender = (
  ChatMsgItemComponent: ChatMsgItemComponentOptions,
  hookOptions: ChatMsgListHookOptions,
) => {
  const watchAppStore = useWatchAppStore();
  const chatMsgStore = useChatMsgStore();
  const layoutStore = useLayoutStore();

  const { uniqueId, getPinia } = useGlobalInject();

  /**
   * 渲染消息列表
   * @param data 消息列表
   */
  function renderItems(data: ChatMsgType[]): HTMLElement[] {
    const domList: HTMLElement[] = [];

    data.forEach((chatMsg, index) => {
      let prevChatMsg: ChatMsgType | undefined = data[index - 1];
      let nextChatMsg: ChatMsgType | undefined = data[index + 1];

      const historyData = chatMsgStore.getHistoryData();
      let historyIndex = -1;
      if (isUndefined(prevChatMsg) || isUndefined(nextChatMsg)) {
        historyIndex = chatMsgStore.findHistoryIndex(chatMsg.id);
      }
      if (historyIndex !== -1 && isUndefined(prevChatMsg)) {
        prevChatMsg = historyData[historyIndex - 1];
      }
      if (historyIndex !== -1 && isUndefined(nextChatMsg)) {
        nextChatMsg = historyData[historyIndex + 1];
      }

      const propsData: ChatMsgItemPropsType = {
        category: hookOptions.category,
        containerElem: hookOptions.getContainerElem(),
        getVirtualList: hookOptions.getVirtualList,
        chatMsg,
        prevChatMsg,
        nextChatMsg,
      };

      const instance = new Vue({
        render(h) {
          return h(ChatMsgItemComponent, {
            props: propsData,
          });
        },
        provide: {
          uniqueId,
        },
        pinia: getPinia(),
      });

      instance.$mount();

      const domElem = instance.$el as HTMLElement;
      domElem.__vueVm = instance;
      domList.push(domElem);
    });

    return domList;
  }

  /**
   * 渲染边界节点
   * @param position 位置
   */
  function renderBoundary(position: RenderPosition) {
    const virtualList = hookOptions.getVirtualList();

    // 渲染没有更多
    if (
      !layoutStore.isPortraitWatchLayout &&
      position === RenderPosition.Head &&
      chatMsgStore.historyEnd &&
      virtualList.items.length >= chatMsgStore.batchCount
    ) {
      const instance = new Vue({
        render(h) {
          return h(
            'div',
            {
              class: 'c-chat-msg-list__tips pws-secondary-text-color',
            },
            `${translate('chat.norMore')}`,
          );
        },
      });
      instance.$mount();
      return instance.$el as HTMLDivElement;
    }
  }

  /**
   * 渲染空数据提示。
   */
  function renderEmpty() {
    if (!layoutStore.isPortraitWatchLayout && watchAppStore.isPlaybackWatchUrl) {
      const instance = new Vue({
        render(h) {
          return h(
            'div',
            {
              class: 'c-chat-msg-list__tips pws-secondary-text-color',
            },
            `${translate('chat.empty')}`,
          );
        },
      });
      instance.$mount();
      return instance.$el as HTMLDivElement;
    }
  }

  /**
   * 渲染数据加载中
   */
  function renderLoading() {
    const div = document.createElement('div');
    div.className = 'c-chat-msg-list__loading';
    return div;
  }

  /**
   * 渲染数据加载失败
   */
  function renderError(...args: unknown[]) {
    console.error('renderError', args);
    const instance = new Vue({
      render(h) {
        return h(
          'div',
          {
            class: 'c-chat-msg-list__tips pws-secondary-text-color',
          },
          `${translate('chat.loadError')}`,
        );
      },
    });
    instance.$mount();
    return instance.$el as HTMLDivElement;
  }

  return {
    renderItems,
    renderBoundary,
    renderLoading,
    renderError,
    renderEmpty,
  };
};
