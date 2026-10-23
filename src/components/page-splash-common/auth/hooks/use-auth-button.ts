import { translate } from '@/assets/lang';
import { PropUtils, VueProps } from '@polyv/vue-components';
import { useChannelStore } from '@/store/use-channel-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { AuthSettingItem, AuthType, LiveStatus } from '@polyv/live-watch-sdk';
import {
  computed,
  getCurrentInstance,
  inject,
  InjectionKey,
  onBeforeUnmount,
  provide,
  unref,
} from 'vue';
import { AuthButtonInject } from '../types/auth-type';
import { useToastManager } from '@/hooks/components/use-toast';

/**
 * 观看页条件按钮 props 配置
 */
export const authButtonProps = () => ({
  authItem: PropUtils.object<AuthSettingItem>().isRequired,
});

const AUTH_BUTTON_INJECT_KEY: InjectionKey<AuthButtonInject> = Symbol('authButtonInjectKey');

/**
 * 观看条件按钮注入
 * @param data 注入数据
 */
export const useAuthButtonProvide = (data: AuthButtonInject) => {
  provide(AUTH_BUTTON_INJECT_KEY, data);
};

/**
 * 获取观看条件注入信息
 */
export const useAuthButtonInject = <ItemType extends AuthSettingItem>(
  clickButtonCallback?: AnyFunc,
): AuthButtonInject<ItemType> => {
  const injectData = inject(AUTH_BUTTON_INJECT_KEY) as AuthButtonInject<ItemType>;

  if (clickButtonCallback) {
    injectData.listenClickAuthButton(clickButtonCallback);
  }

  onBeforeUnmount(() => {
    if (clickButtonCallback) {
      injectData.unlistenClickAuthButton(clickButtonCallback);
    }
  });

  return injectData;
};

/**
 * 观看条件按钮 hook
 */
export const useAuthButton = (options: { props: VueProps<typeof authButtonProps> }) => {
  const { props } = options;
  const channelStore = useChannelStore();
  const enrollStore = useEnrollStore();
  const identityStore = useIdentityStore();

  const { getEmitter } = useGlobalInject();

  const { toast } = useToastManager();

  const thisInstance = getCurrentInstance()?.proxy;

  const computedAuthItem = computed(() => props.authItem);

  useAuthButtonProvide({
    authItem: props.authItem,
    computedAuthItem,
    listenClickAuthButton,
    unlistenClickAuthButton,
  });

  /** 当前的观看条件类型 */
  const currentAuthType = computed<AuthType>(() => {
    return props.authItem.authType;
  });

  /** 默认的按钮文本 */
  const defaultButtonText = computed<string>(() => {
    const defaultTexts: Record<AuthType, string> = {
      [AuthType.None]: translate('auth.button.none'),
      [AuthType.Phone]: translate('auth.button.phone'),
      [AuthType.Pay]: translate('auth.button.pay'),
      [AuthType.Info]: translate('auth.button.info'),
      [AuthType.Code]: translate('auth.button.code'),
      [AuthType.Custom]: translate('auth.button.login'),
      [AuthType.External]: translate('auth.button.login'),
      [AuthType.Direct]: translate('auth.button.login'),
      [AuthType.EnterpriseWeChat]: translate('auth.button.workWx'),
      /** @warn 实际上一客一码并不会作为观看条件，而是作为一种单独的授权方式 */
      [AuthType.SaleShare]: translate('auth.button.none'),
      /** @warn 邀请观看实际并无入口，而是直接跟随观看页主流程 */
      [AuthType.InviteWatch]: translate('auth.button.none'),
    };

    return defaultTexts[unref(currentAuthType)];
  });

  /** 按钮文本 */
  const buttonText = computed<string>(() => {
    const authItem = props.authItem;

    let text = unref(defaultButtonText);

    // 白名单观看入口文本
    if (
      authItem.authType === AuthType.Phone &&
      authItem.whiteListEntryText &&
      !['会员观看', '会员入口'].includes(authItem.whiteListEntryText)
    ) {
      text = authItem.whiteListEntryText;
    }

    // 付费观看入口文本
    if (
      authItem.authType === AuthType.Pay &&
      authItem.payEntryText &&
      !['付费观看'].includes(authItem.payEntryText)
    ) {
      text = authItem.payEntryText;
    }

    // 验证码观看入口文本
    if (
      authItem.authType === AuthType.Code &&
      authItem.codeEntryText &&
      !['验证码观看'].includes(authItem.codeEntryText)
    ) {
      text = authItem.codeEntryText;
    }

    // 登记观看入口文本
    if (
      authItem.authType === AuthType.Info &&
      authItem.infoEntryText &&
      !['登记观看'].includes(authItem.infoEntryText)
    ) {
      text = authItem.infoEntryText;
    }

    // 外部授权入口文本
    if (authItem.authType === AuthType.External && authItem.externalEntryText) {
      text = authItem.externalEntryText;
    }

    // 自定义授权入口文本
    if (authItem.authType === AuthType.Custom && authItem.customEntryText) {
      text = authItem.customEntryText;
    }

    // 无条件入口文本
    if (authItem.authType === AuthType.None && channelStore.liveStatus === LiveStatus.Playback) {
      text = translate('auth.button.playback');
    }

    return text;
  });

  /** 按钮是否显示 */
  const buttonVisible = computed<boolean>(() => {
    const authItem = props.authItem;

    // 仅无条件且需入口报名时：报名由自动建权后出现的报名组件承载，按钮隐藏；
    // 用户体系开启的无身份会话自动建权失败，显示按钮兜底登录（转正后恢复隐藏）
    if (authItem.authType === AuthType.None && enrollStore.needEnrollByEnter) {
      return identityStore.watchUserSystemEnabled && !identityStore.identityUnionInfo;
    }

    return true;
  });

  /** 点击时回调的事件 */
  const clickCallbackEvent = 'click-auth-button';
  /** 处理点击观看条件按钮 */
  function onClickAuthButton(): void {
    const authItem = props.authItem;
    if (authItem.authType === AuthType.InviteWatch) {
      // 客户开启平台用户体系后，已存在的直播间并不会同步开启，如果客户配置了邀请观看限制，则需要让客户去调整
      toast.warning(translate('inviteWatch.prepare.tips'));
      return;
    }

    // 用户体系开启时，两类点击先弹窗登录且不执行原按钮动作（登录成功整页重载，回来再走原动作）：
    // 无会话身份者、需转正的游客（点观看条件按钮，或研讨会频道的进入按钮——研讨会游客须先转正）。
    // 游客点公开观看的进入按钮（免登录为原有需求，点进入即建权进入）与正式身份放行原动作；
    // 企微观看条件维持从认证页登录，不拦截；用户体系关频道无弹窗可调，不拦截。
    // 身份判定用 identityUnionInfo（UI 层唯一真源；身份变化均经整页重载，快照随之刷新）

    const needSplashAuthIntercept =
      !identityStore.identityUnionInfo ||
      (identityStore.isGuest &&
        (authItem.authType !== AuthType.None || channelStore.isSeminarChannel));

    if (
      identityStore.watchUserSystemEnabled &&
      authItem.authType !== AuthType.EnterpriseWeChat &&
      needSplashAuthIntercept
    ) {
      getEmitter().emit(appEvents.global.OpenIdentityLoginDialog, {
        triggerSource: 'splash-auth-button',
      });
      return;
    }

    thisInstance?.$emit(clickCallbackEvent);
  }
  /** 监听点击按钮事件 */
  function listenClickAuthButton(callback: AnyFunc): void {
    thisInstance?.$on(clickCallbackEvent, callback);
  }
  /** 取消监听事件 */
  function unlistenClickAuthButton(callback: AnyFunc): void {
    thisInstance?.$off(clickCallbackEvent, callback);
  }

  return {
    currentAuthType,
    defaultButtonText,
    buttonText,
    buttonVisible,
    onClickAuthButton,
  };
};
