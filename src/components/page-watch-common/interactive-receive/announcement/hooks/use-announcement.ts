import { computed, ref, unref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';
import { IarAnnouncementInstance } from '../types/announcement-types';
import { useAnnouncementTips } from './use-announcement-tips';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 互动-公告
 */
export const useAnnouncement = () => {
  const { openAnnouncementTips } = useAnnouncementTips();
  const interactReceiveStore = useInteractReceiveStore();

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 公告 SDK 实例 */
  const announcementSdk = watchCore.interactReceive.getAnnouncement();
  /** 公告是否显示 */
  const announcementVisible = ref(false);
  /** 公告列表按钮是否显示 */
  const listBtnVisible = ref(false);
  /** 是否正在显示详情 */
  const isShowDetailing = ref(false);

  const announcementRef = ref<IarAnnouncementInstance>();

  /** 公告标题类型 */
  const announcementTitleType = ref('detail');
  /** 公告标题 */
  const announcementTitle = computed(() => {
    if (announcementTitleType.value === 'list') {
      return translate('interact.announcement.titleList');
    }
    return translate('interact.announcement.titleDetail');
  });
  /** 处理标题更改 */
  function onTitleChange(type: string) {
    announcementTitleType.value = type;
  }

  /** 设置公告显示状态 */
  function setAnnouncementVisible(visible = true) {
    announcementVisible.value = visible;
  }

  /** 显示公告列表 */
  function openAnnouncementList() {
    listBtnVisible.value = false;
    isShowDetailing.value = false;
    setAnnouncementVisible(true);
    const instance = unref(announcementRef);
    instance?.showBulletinList();
  }

  /** 显示某个公告详情 */
  function openAnnouncementDetail(data: unknown) {
    setAnnouncementVisible(true);
    const instance = unref(announcementRef);
    instance?.showBulletinDetail(data);
    listBtnVisible.value = true;
    isShowDetailing.value = true;
  }

  /** 处理显示公告详情（socket 事件） */
  function onShowDetailFromSocket() {
    setAnnouncementVisible(true);
    listBtnVisible.value = true;
  }

  function onLookover() {
    isShowDetailing.value = true;
  }

  /** 点击返回 */
  function onClickBack() {
    openAnnouncementList();
  }

  /** 处理关闭弹层 */
  const onCloseDialog = () => {
    // 设为已读
    const instance = unref(announcementRef);
    instance?.markAnnounceReaded();

    listBtnVisible.value = false;

    if (announcementSdk.content) {
      // 打开公告提示
      openAnnouncementTips();
    }
  };

  function onHasBulletin(hasBulletin = false) {
    interactReceiveStore.$patch({
      hasBulletin,
    });
  }

  useEventBusListener(appEvents.interaction.OpenAnnouncementList, openAnnouncementList);

  useEventBusListener(appEvents.interaction.OpenAnnouncementDetail, openAnnouncementDetail);

  return {
    listBtnVisible,
    isShowDetailing,
    announcementSdk,
    announcementRef,
    announcementVisible,
    announcementTitle,
    onTitleChange,
    setAnnouncementVisible,
    onCloseDialog,
    onShowDetailFromSocket,
    onLookover,
    onClickBack,
    onHasBulletin,
  };
};
