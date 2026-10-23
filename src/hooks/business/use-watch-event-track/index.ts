import { useGlobalInject } from '@/app/use-global-inject';
import { TAB_NAME_PRODUCT } from '@/assets/constants/tab-name';
import { TabNameType } from '@/components/common-base/tabs/hooks/types';
import { RedpackType } from '@polyv/live-watch-sdk';

/**
 * 监听埋点 show 行为
 * @desc 实现 DOM 在页面停留多久后触发回调
 */
export const obverseTrackShowBehavior = async <T extends Element>({
  $el,
  remainTime = 500,
  cb,
  $root,
}: {
  $el?: T;
  remainTime?: number;
  cb: AnyFunc;
  $root?: T;
}) => {
  if (!window.IntersectionObserver || !$el) {
    console.error('不支持监听停留显示行为');
    return;
  }

  await Promise.resolve();

  let timer: number;
  const intersectionObserver = new IntersectionObserver(
    entries => {
      clearTimeout(timer);
      if (entries[0].intersectionRatio <= 0) return;

      timer = window.setTimeout(() => {
        cb();
      }, remainTime);
    },
    {
      root: $root,
    },
  );
  intersectionObserver.observe($el);
};

/**
 * @hook 前端业务埋点处理
 * 点击上报埋点日志时，不需要等待业务接口
 */
export const useWatchEventTrack = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 获取是否需要进行业务埋点 */
  function getWatchEventTrackEnabled() {
    return watchCore.channel.getWatchEventTrackEnabled();
  }

  /** 用户预约直播 */
  function trackUserReservationLive(params: { reservationType: 'code' | 'official_account' }) {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_reservation_live',
      data: {
        reservationType: params.reservationType,
        clickTime: String(Date.now()),
      },
    });
  }

  /** 用户确认预约 */
  function trackUserConfirmReservationLive(params: {
    reservationType: 'code' | 'official_account';
  }) {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_confirm_reservation_live',
      data: {
        reservationType: params.reservationType,
        clickTime: String(Date.now()),
      },
    });
  }

  /** 用户登记报名 */
  function trackUserRegisterApplication() {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_register_application',
      data: {
        clickTime: String(Date.now()),
      },
    });
  }

  /** 商品列表入口点击事件 */
  function trackUserClickProductList() {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_click_product_list',
      data: {
        clickTime: String(Date.now()),
      },
    });
  }

  /** Tab 切换 */
  function trackWatchTabChange(tabName: TabNameType) {
    if (!getWatchEventTrackEnabled()) return;

    if (tabName === TAB_NAME_PRODUCT) {
      trackUserClickProductList();
    }
  }

  /** 用户点击邀请海报 */
  function trackUserClickInvitePoster() {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_click_poster',
      data: {
        clickTime: String(Date.now()),
      },
    });
  }

  /** 用户提现 */
  function trackUserWithdrawal() {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_withdrawal',
      data: {
        clickTime: String(Date.now()),
      },
    });
  }

  /** 用户浏览红包 */
  function trackUserReadRedpack(params: { repackType: RedpackType; redpackId: string }) {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'show',
      eventId: 'user_read_redpack',
      data: {
        redpackId: params.redpackId,
        repackType: params.repackType,
        exposureTime: String(Date.now()),
      },
    });
  }

  /** 用户点击关注按钮 */
  function trackUserClickFollowBtn() {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_click_interest',
      data: {
        clickTime: String(Date.now()),
      },
    });
  }

  /** 用户查看二维码 */
  function trackUserWatchQrCode() {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'show',
      eventId: 'user_watch_qrcode',
      data: {
        watchQrcodeTime: String(Date.now()),
      },
    });
  }

  /** 用户点赞后触发 */
  function trackUserClickLike(params: { likeCount: number }) {
    if (!getWatchEventTrackEnabled()) return;

    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'user_click_live',
      data: {
        clickTime: String(Date.now()),
        clickNumber: String(params.likeCount),
      },
    });
  }

  return {
    trackUserReservationLive,
    trackUserConfirmReservationLive,

    trackUserRegisterApplication,

    trackUserClickProductList,
    trackWatchTabChange,

    trackUserClickInvitePoster,

    trackUserWithdrawal,
    trackUserReadRedpack,

    trackUserClickFollowBtn,
    trackUserWatchQrCode,

    trackUserClickLike,
  };
};
