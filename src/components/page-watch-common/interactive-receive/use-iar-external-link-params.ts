import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useShareStore } from '@/store/use-share-store';

import { useGlobalInject } from '@/app/use-global-inject';
import { useQueryParams } from '@/hooks/core/use-query-params';

/** 互动外链跳转参数 hook */
export const useIarExternalLinkParams = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const channelStore = useChannelStore();
  const viewerStore = useViewerStore();
  const inviteStore = useInviteStore();
  const shareStore = useShareStore();
  const { paramGetter } = useQueryParams();

  /** 获取链接参数 */
  const getLinkParams = () => {
    const saleInfo = watchCore.user.getUserSaleInfo();
    const params = watchCore.user.getStatisticsParams();

    const linkParams: Record<string, string | undefined | null> = {
      openId: viewerStore.openId,
      unionId: viewerStore.unionId,
      userId: viewerStore.viewerId,
      nickname: viewerStore.nickname,
      // 邀请人 openId
      inviteOpenId: inviteStore.inviteUserOpenId,
      // 邀请人 unionId
      inviteUnionId: inviteStore.inviteUserUnionId,
      // 渠道 id
      promoteId: channelStore.promoteId,
      // 频道号
      channelId: channelStore.channelId,
      // 当前场次号
      sessionId: channelStore.currentSessionId,
      // 跟进人 id
      saleId: saleInfo.saleId,
      // 邀请观看上级邀请员的inviteWatchSaleId, 这里不建议读取query的inviteWatchSaleId，有可能不准，以后端接口的inviteSalesId为准
      inviteWatchSaleId: shareStore.inviteWatchInviteSalesId,
      // 自定义统计参数param4
      param4: params.param4,
      // 自定义统计参数param5
      param5: params.param5,
      // 身份来源类型，固定 CHANNEL
      sourceType: 'CHANNEL',
    };

    if (paramGetter().linkExt()) {
      linkParams.linkExt = paramGetter().linkExt();
    }

    return linkParams;
  };

  return {
    getLinkParams,
  };
};
