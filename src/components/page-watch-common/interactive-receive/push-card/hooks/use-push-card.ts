import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useShareStore } from '@/store/use-share-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { computed } from 'vue';

/** 卡片推送 hook */
export const usePushCard = () => {
  const { getWatchCore } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();
  const identityStore = useIdentityStore();

  const themeStore = useThemeStore();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const watchCore = getWatchCore();
  /** 卡片推送 SDK 实例 */
  const pushCardSdk = watchCore.interactReceive.getPushCard();
  /** 弹窗广告 SDK 实例 */
  const popupAdSdk = watchCore.interactReceive.getPopupAd();

  const labels = computed(() => identityStore.identityUnionInfo?.labels || []);

  /** 处理卡片推送入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.pushCardPendantVisible = visible;
  };

  function onPushCardVisibleChanged(visible: boolean) {
    if (visible) {
      toLockFeedDrag('push-card');
    } else {
      toUnlockFeedDrag();
    }
  }

  const customImgConfig = computed(() => {
    if (!themeStore.watchThemeStyleConfig) {
      return {};
    }

    const pendant = themeStore.watchThemeStyleConfig.common.pendant;
    return {
      iconQrEntry: pendant.pushCardForQrCode,
      giftBox: pendant.pushCardForNormal,
      redpackBox: pendant.pushCardForNormal,
    };
  });

  return {
    pushCardSdk,
    popupAdSdk,
    labels,
    customImgConfig,
    onEntryVisibleChanged,
    onPushCardVisibleChanged,
  };
};

export const usePushCardLinkParams = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const channelStore = useChannelStore();
  const viewerStore = useViewerStore();
  const shareStore = useShareStore();

  /** 获取链接参数 */
  const getLinkParams = () => {
    const saleInfo = watchCore.user.getUserSaleInfo();
    return {
      userId: viewerStore.viewerId,
      // 频道号
      channelId: channelStore.channelId,
      // 跟进人 id
      saleId: saleInfo.saleId,
      // 邀请观看--分销员/邀请人id
      inviteWatchSaleId: shareStore.inviteWatchSaleId,
    };
  };

  return {
    getLinkParams,
  };
};
