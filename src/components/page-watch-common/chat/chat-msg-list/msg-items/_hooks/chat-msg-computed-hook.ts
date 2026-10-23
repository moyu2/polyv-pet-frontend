import { ComputedRef, inject, InjectionKey, provide } from 'vue';
import { VirtualListInstance } from '../../hooks/types';

export interface ChatMsgComputedContext {
  /** 滚动容器 */
  containerRef: ComputedRef<HTMLDivElement | undefined>;
  /** 是否为同一个人连续发送的消息 */
  isContinuityMsg: ComputedRef<boolean>;
  /** 是否为连续相同的消息来源 */
  isContinuitySourceMsg: ComputedRef<boolean>;
  /** 获取虚拟列表 */
  getVirtualList(): VirtualListInstance | undefined;
}

const MSG_COMPUTED_INJECT_KEY: InjectionKey<ChatMsgComputedContext> = Symbol('MsgComputed');

export const useChatMsgComputedProvide = (context: ChatMsgComputedContext) => {
  provide(MSG_COMPUTED_INJECT_KEY, context);
};

export const useChatMsgComputedInject = () => {
  return inject(MSG_COMPUTED_INJECT_KEY) as ChatMsgComputedContext;
};
