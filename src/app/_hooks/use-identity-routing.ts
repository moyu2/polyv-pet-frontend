import type { SessionIdentityType } from '@/store/use-identity-store';

/**
 * 游客模式关时，无会话身份者是否放行落引导页（登录由引导页按钮拦截承载）
 * @desc false（默认）= 直接整页用户体系登录（与线上逻辑一致）；
 * true = 引导页显示时落引导页弹窗登录。代码级开关（不走配置下发），保留灰度回退能力
 */
const allowNoIdentityToSplashWithoutGuestMode = false;

export interface IdentityRoutingInput {
  /** 强制登录参数（forceUserAuth=Y） */
  forceUserAuth: boolean;
  /** feed 构建模式 */
  isFeedBuild: boolean;
  /** 独立授权参数观众 */
  hasDirectAuthParams: boolean;
  /** 含企微观看条件 */
  hasWorkWeixinCondition: boolean;
  /** 含邀请观看条件 */
  hasInviteWatchCondition: boolean;
  /** 会话身份 */
  sessionIdentity: SessionIdentityType;
  /** 用户体系游客模式开关 */
  guestModeEnabled: boolean;
  /** 引导页会显示（渲染真源 shouldShowSplash） */
  shouldShowSplash: boolean;
  /** 公开观看条件 */
  isPublicWatch: boolean;
  /** 研讨会频道 */
  isSeminarChannel: boolean;
}

export type ToIdentifyReason = 'materialize' | 'login' | 'guest-formalize';

export type IdentityRoutingResult =
  | { action: 'pass' }
  | { action: 'release-to-splash' }
  | { action: 'to-identify'; reason: ToIdentifyReason };

/** 拦进认证页（materialize 游客物化回流 / login 整页登录（现状）/ guest-formalize 游客强制转正） */
function toIdentify(reason: ToIdentifyReason): IdentityRoutingResult {
  return { action: 'to-identify', reason };
}

/**
 * 引导页是否承载登录：准入链点击驱动且可后置于登录才承载；
 * 独立授权/邀请观看为链接或参数驱动的自动验证链且接口要求登录态、企微走认证页
 * OAuth 授权链，均不满足承载前提，维持现状链
 */
function shouldSplashCarryLogin(input: IdentityRoutingInput): boolean {
  return (
    !input.isFeedBuild &&
    !input.hasDirectAuthParams &&
    !input.hasWorkWeixinCondition &&
    !input.hasInviteWatchCondition
  );
}

/**
 * 解析用户体系拦截的路由终点（纯函数、无副作用，调用方负责落地页面动作）
 * @desc 仅用于用户体系开启的频道；pass = 放行下游（分组验证/企微静默授权），
 * release-to-splash = 放行落引导页（登录由引导页按钮拦截承载），
 * to-identify = 拦进认证页（原因见 toIdentify）
 */
export function resolveIdentityRouting(input: IdentityRoutingInput): IdentityRoutingResult {
  // 强制登录参数：URL 显式要求登录，优先于所有路由逻辑，一律整页登录（现状）
  if (input.forceUserAuth) {
    return toIdentify('login');
  }

  const splashCarryLogin = shouldSplashCarryLogin(input);

  if (input.sessionIdentity === 'none') {
    if (splashCarryLogin) {
      // 游客模式开且无会话身份：先去认证页物化游客并重载回流，不放行到引导页
      // （该开关下落引导页的只有已登录游客）；此分支不得被放行条件调整覆盖
      if (input.guestModeEnabled) {
        return toIdentify('materialize');
      }

      // 游客模式关：默认直接整页用户体系登录（与线上逻辑一致）；
      // 打开上方代码开关后，引导页显示时才落引导页承载弹窗登录
      if (allowNoIdentityToSplashWithoutGuestMode && input.shouldShowSplash) {
        return { action: 'release-to-splash' };
      }
    }

    // 现状链（非引导页承载），或引导页承载但不放行（引导页不显示 / 放行开关关闭）：整页登录
    return toIdentify('login');
  }

  if (input.sessionIdentity === 'guest') {
    // 引导页承载且引导页显示时不强制转正——这一趟是路由去引导页，转正由按钮拦截承载
    const toSplash = splashCarryLogin && input.shouldShowSplash;

    // 游客免登录直进 = 公开观看且非研讨会频道、无独立授权、引导页不显示
    const allowGuest =
      input.isPublicWatch &&
      !input.isSeminarChannel &&
      !input.hasDirectAuthParams &&
      !input.shouldShowSplash;

    if (!toSplash && !allowGuest) {
      return toIdentify('guest-formalize');
    }
  }

  return { action: 'pass' };
}
