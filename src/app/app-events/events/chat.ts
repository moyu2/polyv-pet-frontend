/**
 * @file 组件通信-聊天室消息控制事件
 */

export const chatEvents = {
  /**
   * 加载初始数据
   */
  LoadInitialData: 'LoadInitialData',

  /**
   * 重建聊天列表
   */
  ResetUpChatMsgList: 'ResetUpChatMsgList',
  /**
   * 打开设置昵称
   * @param {boolean} visible 显示状态
   */
  OpenSetNick: 'OpenSetNick',
  /**
   * 触发发送图片
   */
  ToSendImage: 'ToSendImage',
  /**
   * 显示移动端固定输入框
   */
  ShowMobileFixedChatInput: 'ShowMobileFixedChatInput',

  /**
   * 显示完整消息
   * @param {string} content 完整的消息内容
   */
  ShowFullMessage: 'ShowFullMessage',
  /**
   * 将聊天室输入框聚焦
   */
  FocusToChatInput: 'FocusToChatInput',
  /**
   * 将竖屏提问区输入框聚焦
   */
  FocusToPortraitAskInput: 'FocusToPortraitAskInput',
  /**
   * 滚动到最新的消息
   */
  ScrollToNew: 'ScrollToNew',
  /**
   * 替换聊天消息
   */
  ReplaceChatMessage: 'ReplaceChatMessage',
  /**
   * 插入到聊天消息队列
   */
  JoinMsgQueue: 'JoinMsgQueue',
};
