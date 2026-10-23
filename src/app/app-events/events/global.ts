/**
 * 和外部容器对接的全局事件
 */
const externalGlobalEvents = {
  /** 页面激活 */
  PageActive: 'PageActive',
  /** 页面不激活 */
  PageInactive: 'PageInactive',
  /** 页面禁止滑动 */
  PageSlideForbidden: 'PageSlideForbidden',
  /** 锁定页面滚动 */
  PageToLockDrag: 'PageToLockDrag',
  /** 解锁页面滚动 */
  PageToUnlockDrag: 'PageToUnlockDrag',
  /** Feed 布局/路由变更 */
  FeedLayoutLevelChange: 'FeedLayoutLevelChange',
  /**
   * 切换 Feed 布局
   * 1、只会切换布局，不会处理其他模块的同步响应，比如 socket 连接，播放器播放之类的，不会触发 FeedLayoutLevelChange 回调
   * 2、理论上 feed 外部容器只需要切换 feed 布局，其他模块由页面激活状态去处理
   * 3、只给到外部容器使用
   */
  ToSwitchFeedLayoutLevel: 'ToSwitchFeedLayoutLevel',
  /**
   * 进入第一层 Feed 布局，会触发 FeedLayoutLevelChange 回调
   */
  EnterFirstFeedLayout: 'EnterFirstFeedLayout',
  /**
   * 进入第二层 Feed 布局，会触发 FeedLayoutLevelChange 回调
   */
  EnterSecondFeedLayout: 'EnterSecondFeedLayout',
  /**
   * 切换到 Feed 流下一个 Swiper
   */
  SlideToNextFeedSwiper: 'SlideToNextFeedSwiper',
  /**
   * 打开外部的登录弹窗
   */
  OpenExternalIdentityLoginDialog: 'OpenExternalIdentityLoginDialog',
  /**
   * 微信分享配置变更
   * feed-inject 模式下，app 在配置微信分享时，将分享信息回调给外部容器，由外部容器自行配置微信分享
   * @param {import('@/hooks/platform/use-weixin/types').WxShareConfigInfo} shareConfigInfo 微信分享配置信息
   */
  WxShareConfigChange: 'WxShareConfigChange',
  /**
   * 获取微信分享配置
   * feed-inject 模式下，外部容器主动请求当前观看页的微信分享信息，app 会通过 WxShareConfigChange 事件回调返回
   */
  GetWxShareConfig: 'GetWxShareConfig',
};

export const globalEvents = {
  ...externalGlobalEvents,
  /**
   * 打开多语言切换
   */
  OpenLanguageSwitch: 'OpenLanguageSwitch',
  /**
   * PC 端侧边菜单栏被切换
   * @param {string} name 菜单栏名
   */
  PcAsideMenuSwitch: 'PcAsideMenuSwitch',
  /**
   * 移动端底部菜单栏切换
   * @param {string} name 菜单栏名
   */
  MobileBottomMenuSwitch: 'MobileBottomMenuSwitch',
  /**
   * 移动端更多弹层打开
   */
  OpenMobileMorePopup: 'OpenMobileMorePopup',
  /**
   * 消息输入框聚焦
   */
  MsgInputFocus: 'MsgInputFocus',
  /**
   * 打开关注弹层
   * @param {boolean} visible 是否显示
   */
  OpenFollowLayer: 'OpenFollowLayer',
  /**
   * 移动端 layout 计算尺寸
   */
  MobileLayoutComputedSize: 'MobileLayoutComputedSize',
  /**
   * 打开手机号实名认证
   */
  OpenRealNameDialog: 'OpenRealNameDialog',
  /**
   * 打开报名观看弹窗
   */
  OpenEnrollDialog: 'OpenEnrollDialog',
  /**
   * 打开绑定用户信息弹窗
   */
  OpenBindIdentityInfoDialog: 'OpenBindIdentityInfoDialog',
  /**
   * 打开任务活动弹层
   */
  OpenTaskActivityDialog: 'OpenTaskActivityDialog',
  /**
   * 刷新任务活动
   */
  RefreshTaskActivity: 'RefreshTaskActivity',
  /**
   * 刷新任务奖励列表
   */
  RefreshTaskRewardList: 'RefreshTaskRewardList',
  /**
   * 打开任务奖励领取弹层
   */
  OpenTaskRewardReceiveDialog: 'OpenTaskRewardReceiveDialog',
  /**
   * 打开答题任务弹层
   */
  OpenTaskActivityQuestionnaire: 'OpenTaskActivityQuestionnaire',
  /**
   * 打开个人奖励弹层
   */
  OpenPersonalRewardDialog: 'OpenPersonalRewardDialog',
  /**
   * 关闭个人奖励弹层
   */
  ClosePersonalRewardDialog: 'ClosePersonalRewardDialog',
  /**
   * 打开二维码分享弹窗
   */
  OpenQrCodeShareDialog: 'OpenQrCodeShareDialog',
  /**
   * 播放设置弹窗
   */
  PlaybackSettingPopup: 'PlaybackSettingPopup',
  /**
   * 打开 AI 看 思维导图
   */
  OpenPlaybackOutlineDialog: 'OpenPlaybackOutlineDialog',

  /** 打开文件管理弹窗 */
  OpenFileManagement: 'OpenFileManagement',

  /** 打开学习时长统计弹窗 */
  OpenLearningStatDialog: 'OpenLearningStatDialog',

  /** 打开学习详情 */
  OpenLearningDetail: 'OpenLearningDetail',

  /** 打开用户体系登录弹窗 */
  OpenIdentityLoginDialog: 'OpenIdentityLoginDialog',

  /**
   * 打开观看条件弹窗（登录回来主动弹，携条件类型 authType）
   */
  OpenAuthConditionDialog: 'OpenAuthConditionDialog',

  /** 打开主讲弹层 */
  OpenAnchorPopup: 'OpenAnchorPopup',
};
