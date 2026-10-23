import { ChatMsgSpeakType } from '@polyv/live-watch-sdk';

/**
 * 完整消息数据类型
 */
export interface FullMsgData {
  /** 完整的内容 */
  fullContent: string;
  /** 消息对象 */
  chatMsg: ChatMsgSpeakType;
}
