import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { getSessionStorage, removeSessionStorage, setSessionStorage } from '@/assets/utils/storage';
import { useAuthStore } from '@/store/use-auth-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { AuthType } from '@polyv/live-watch-sdk';
import { onMounted } from 'vue';

/** 登录回访弹窗标记 key（sessionStorage，值 = 频道 id） */
const LOGIN_RETURN_AUTH_POPUP_STORAGE_KEY = 'login-return-auth-popup';

/** 登录回来允许主动弹窗的观看条件类型：白名单 / 密码（验证码）/ 登记 */
const AUTO_POPUP_AUTH_TYPES: AuthType[] = [AuthType.Phone, AuthType.Code, AuthType.Info];

/**
 * 记录登录回访标记（登录弹窗/确认框打开时调用）
 * @desc 仅覆盖弹窗链（矛盾点 = 引导页触发弹窗登录、回来又落引导页）；认证页
 * （整页登录/物化）不写。sessionStorage 同 tab 跨导航存活——跳转型登录
 * （微信 OAuth/外链）回跳后标记仍可读；未登录成功的残留由消费侧「正式身份」
 * 判定天然清理
 */
export function markLoginReturnPopup(channelId: string) {
  if (!channelId) return;
  setSessionStorage(LOGIN_RETURN_AUTH_POPUP_STORAGE_KEY, channelId);
}

/** 消费回访标记：存在且指向当前频道返回 true（读取即删除，保证只弹一次；残留顺带清理） */
function consumeLoginReturnMark(channelId: string): boolean {
  const markedChannelId = getSessionStorage(LOGIN_RETURN_AUTH_POPUP_STORAGE_KEY);
  if (!markedChannelId) return false;
  removeSessionStorage(LOGIN_RETURN_AUTH_POPUP_STORAGE_KEY);
  return markedChannelId === channelId;
}

/**
 * 登录回来主动弹观看条件弹窗（引导页挂载时消费，仅一次、手动刷新不弹）
 * @desc 纯报名频道让位给 useLoginReturnEnrollPopup（报名区载体晚挂载）；
 * 「单条件+报名」组合在此弹条件窗（先过条件，报名收尾不主动弹）
 */
export function useLoginReturnAuthPopup() {
  const { getEmitter } = useGlobalInject();
  const channelStore = useChannelStore();
  const identityStore = useIdentityStore();
  const authStore = useAuthStore();
  const enrollStore = useEnrollStore();
  const watchAppStore = useWatchAppStore();

  /** 是否用户体系登录回来的正式身份者（GUEST 物化回流、未登录残留、引导页未显示均不弹） */
  function isFormalViewerOnSplash(): boolean {
    return (
      identityStore.watchUserSystemEnabled &&
      identityStore.sessionIdentity === 'formal' &&
      watchAppStore.shouldShowSplash
    );
  }

  /** 单条件频道主动弹：全部准入条件（除公开观看）合计 = 1 才弹，多条件一律不弹 */
  function popupSingleEntryCondition() {
    const entryAuthTypes = authStore.authSettings
      .map(authItem => authItem.authType)
      .filter(authType => authType !== AuthType.None);
    if (entryAuthTypes.length !== 1) return;

    const [authType] = entryAuthTypes;
    // 付费/自定义/企微等类型与已过条件（引导页因 forceSplashPage 等显示）不弹
    if (!AUTO_POPUP_AUTH_TYPES.includes(authType) || authStore.isAuthorized) return;

    getEmitter().emit(appEvents.global.OpenAuthConditionDialog, { authType });
  }

  onMounted(() => {
    // 纯报名让位（报名区在 auth-none 自动建权后才渲染，由报名入口自查消费）
    const isPureEnrollChannel =
      enrollStore.needEnrollByEnter &&
      authStore.authSettings.every(authItem => authItem.authType === AuthType.None);
    if (isPureEnrollChannel) return;

    if (!consumeLoginReturnMark(channelStore.channelId)) return;
    if (!isFormalViewerOnSplash()) return;
    popupSingleEntryCondition();
  });
}

/**
 * 报名入口挂载时自查：登录回来主动弹报名表单（纯报名频道专用）
 * @desc 报名区载体挂载时点即消费时点，不依赖事件时序；消费前置（无论判定
 * 结果都清理标记）保证多条件等场景的残留不滞留；自查通过后执行调用方
 * 传入的动作（onClickEnter，其既有守卫链天然生效）
 */
export function useLoginReturnEnrollPopup(onPopup: () => void) {
  const channelStore = useChannelStore();
  const identityStore = useIdentityStore();
  const authStore = useAuthStore();
  const enrollStore = useEnrollStore();
  const watchAppStore = useWatchAppStore();

  onMounted(() => {
    if (!consumeLoginReturnMark(channelStore.channelId)) return;

    if (
      !identityStore.watchUserSystemEnabled ||
      identityStore.sessionIdentity !== 'formal' ||
      !watchAppStore.shouldShowSplash
    ) {
      return;
    }

    // 纯报名频道（无其他准入条件）才弹——「条件+报名」组合属多条件不弹
    const hasOtherEntryAuth = authStore.authSettings.some(
      authItem => authItem.authType !== AuthType.None,
    );
    if (enrollStore.needEnrollByEnter && !hasOtherEntryAuth) {
      onPopup();
    }
  });
}
