/** 独立业务页面类型 */
export enum DirectBusinessPageType {
  /** 错误页 */
  ErrorPage = 'ErrorPage',
  /** 用户系统登录认证页 */
  WatchIdentity = 'WatchIdentity',
  /** 校验一客一码(销售邀请) */
  VerifySaleInvite = 'VerifySaleInvite',
  /** 观看限制-邀请观看-审核中页面 */
  InviteWatchAuditing = 'InviteWatchAuditing',
  /** 添加企微好友 */
  WorkWechatFriend = 'WorkWechatFriend',
  /** 场次选择页面 */
  SessionSelectPage = 'SessionSelectPage',
}

/** 页面异常状态类型 */
export enum PageErrorType {
  /** 频道号异常 */
  ChannelIdError = 'ChannelIdError',
  /** 频道号被关闭 */
  ChannelClosed = 'ChannelClosed',
  /** 直播间暂时不可用 */
  ChannelForbidden = 'ChannelForbidden',
  /** 移动端观看被关闭 */
  MobileChannelClosed = 'MobileChannelClosed',
  /** 外部授权失败 */
  ExternalAuthFail = 'ExternalAuthFail',
  /** 独立授权失败 */
  DirectAuthFail = 'DirectAuthFail',
  /** 授权过期 */
  AuthExpired = 'AuthExpired',
  /** 未知错误 */
  UnknownError = 'UnknownError',
  /** 企微业务错误 */
  WorkWechatBusinessError = 'WorkWechatBusinessError',
  /** 禁止访问 */
  NotAllowAccess = 'NotAllowAccess',
  /** 不存在指定场次 */
  TargetSessionNotExist = 'TargetSessionNotExist',
}

/**
 * 页面异常数据
 */
export interface PageErrorData {
  /** 异常类型 */
  type: PageErrorType;
  /** 标题 */
  title?: string;
  /** 描述 */
  desc?: string;
  /** 是否展示重新加载的按钮 */
  reloadBtnVisible?: true;
  /** 链接 */
  href?: string;
}

export type DirectBusinessPageData =
  | {
      pageType: DirectBusinessPageType.ErrorPage;
      data: PageErrorData;
    }
  | {
      pageType: DirectBusinessPageType.WatchIdentity;
    }
  | {
      pageType: DirectBusinessPageType.VerifySaleInvite;
    }
  | {
      pageType: DirectBusinessPageType.InviteWatchAuditing;
    }
  | {
      pageType: DirectBusinessPageType.WorkWechatFriend;
      data: {
        title?: string;
        desc?: string;
        href?: string;
      };
    }
  | {
      pageType: DirectBusinessPageType.SessionSelectPage;
    };
