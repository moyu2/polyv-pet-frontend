import { appEvents } from '@/app/app-events';
import { local } from '@polyv/utils/storage';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { getStorageKey } from '@/assets/utils/storage';
import { useGlobalInject } from '@/app/use-global-inject';

/** 公告的提示状态 */
export enum AnnouncementTipsStatus {
  /** 显示中、未关闭提示 */
  Showing = 'showing',
  /** 已显示过、已点击关闭 */
  Closed = 'closed',
}

/** localStorage 记录的 key */
export const tipsStorageKey = getStorageKey('announcement-tips-status');

/** 获取 storage 中的状态值 */
export const getStorageTipsStatus = (): AnnouncementTipsStatus | undefined => {
  return local.get(tipsStorageKey) as AnnouncementTipsStatus;
};

/** 设置 storage 中的状态值 */
export const setStorageTipsStatus = (status: AnnouncementTipsStatus) => {
  local.set(tipsStorageKey, status);
};

/**
 * @hook 互动-公告-公告提示
 */
export const useAnnouncementTips = () => {
  const { getEmitter } = useGlobalInject();

  /** 公告提示是否显示 */
  const { announcementTipsVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  /** 设置公告提示显示状态 */
  const setAnnouncementTipsVisible = (visible = true) => {
    announcementTipsVisible.value = visible;
  };

  /** 显示公告提示，如果 storage 中记录的是 closed 则不响应 */
  const openAnnouncementTips = () => {
    const tipsStatus = getStorageTipsStatus();
    if (tipsStatus !== AnnouncementTipsStatus.Closed) {
      setAnnouncementTipsVisible(true);
      setStorageTipsStatus(AnnouncementTipsStatus.Showing);
    }
  };

  /** 关闭提示 */
  const closeAnnouncementTips = () => {
    // 设为提示关闭
    setStorageTipsStatus(AnnouncementTipsStatus.Closed);
    setAnnouncementTipsVisible(false);
  };

  /** 处理点击公告提示 */
  const onClickAnnouncementTips = () => {
    // 打开公告弹层
    getEmitter().emit(appEvents.interaction.OpenAnnouncementList, true);
    closeAnnouncementTips();
  };

  /** 处理点击公告提示关闭 */
  const onClickAnnouncementTipsClose = () => {
    closeAnnouncementTips();
  };

  return {
    AnnouncementTipsStatus,
    announcementTipsVisible,
    getStorageTipsStatus,
    setStorageTipsStatus,

    setAnnouncementTipsVisible,

    openAnnouncementTips,
    closeAnnouncementTips,

    onClickAnnouncementTips,
    onClickAnnouncementTipsClose,
  };
};
