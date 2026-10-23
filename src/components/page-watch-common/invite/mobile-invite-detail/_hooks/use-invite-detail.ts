import { ref, computed } from 'vue';
import debounce from 'lodash-es/debounce';

import {
  InviteDetailListItem,
  InviteDetailListRequestFailReason,
  InviteDetailLoadStatus,
  InviteDetailLoadStatusData,
  InviteDetailExportErrorReason,
} from '@polyv/live-watch-sdk';
import { useInviteStore } from '@/store/use-invite-store';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

/** 下载明细按钮实例 */
export interface DetailExportButtonInstance {
  init(): void;
  destroy(): void;
}

export const useInviteDetail = () => {
  const page = ref(0);
  const isLoading = ref(false);
  const isNoMore = ref(false);
  const isLoadFailed = ref(false);
  const totalInviteDetailList = ref<InviteDetailListItem[]>([]);
  const inviteDetailList = ref<InviteDetailListItem[]>([]);
  const inviteStore = useInviteStore();

  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  async function initInviteDetail() {
    page.value = 0;
    isLoading.value = false;
    isNoMore.value = false;
    await getInviteDetail(true);
  }

  async function getInviteDetail(isFirst = false) {
    if (isLoading.value || isNoMore.value) return;

    try {
      isLoadFailed.value = false;
      isLoading.value = true;

      const data = await watchCore.invite.getInviteDetailList({
        pageNumber: page.value + 1,
      });

      isLoading.value = false;

      if (!data.success) {
        if (data.failReason === InviteDetailListRequestFailReason.FeatureClose) {
          isNoMore.value = true;
          return;
        }
        throw new Error('getInviteDetailList request failed');
      }

      page.value = data.pageNumber;
      inviteDetailList.value = data.contents;
      if (data.totalPages <= page.value) {
        isNoMore.value = true;
      }

      if (isFirst) {
        totalInviteDetailList.value = [];
      }
      if (inviteDetailList.value.length > 0) {
        const pushedList = isNoMore.value
          ? inviteDetailList.value
          : inviteDetailList.value.splice(0, 20);
        totalInviteDetailList.value.push(...pushedList);
      }
    } catch (err) {
      isLoadFailed.value = true;
      isLoading.value = false;
      console.error('getInviteDetailList', err);
    }
  }

  const debounceTime = 300;
  /** 邀请榜滚动钩子 */
  const handleScroll = debounce(function (e) {
    if (isNoMore.value) {
      return;
    }
    // 获取下一页数据
    const target = e.target;
    const scrollHeight = parseInt(target.scrollHeight);
    const scrollTop = parseInt(target.scrollTop);
    const clientHeight = parseInt(target.clientHeight);
    if (scrollTop >= scrollHeight - clientHeight - 150) {
      if (inviteDetailList.value.length > 0) {
        totalInviteDetailList.value.push(...inviteDetailList.value.splice(0, 20));
      } else {
        getInviteDetail();
      }
    }
  }, debounceTime);

  /** 明细下载按钮实例 */
  const detailExportRef = ref<DetailExportButtonInstance>();

  /** 是否显示邀请下载按钮 */
  const canShowDetailExport = computed(() => {
    return totalInviteDetailList.value.length > 0 && inviteStore.inviteDetailExportEnabled;
  });

  /** 明细更新中 */
  const detailStatusLoading = ref(false);

  /** 明细下载首次查询最新状态 */
  const isWaitStatusFirstGet = ref(true);

  /** 明细下载状态 */
  const detailLoadStatus = ref<InviteDetailLoadStatusData>();

  /** 获取明细下载状态 */
  async function toGetInviteDetailExportStatus(): Promise<void> {
    const data = await watchCore.invite.getInviteDetailLoadStatusInfo();
    detailLoadStatus.value = data;
    if (isWaitStatusFirstGet.value) {
      isWaitStatusFirstGet.value = false;
      if (data.type === InviteDetailLoadStatus.Loading) {
        startPollDetailExportStatus(false);
      } else {
        stopPollDetailExportStatus();
      }
    }
  }

  const getInviteDetailExportStatus = debounce(toGetInviteDetailExportStatus, 300);

  /** 轮询邀请明细状态定时器 */
  let statusInterval: number | null = null;

  function startPollDetailExportStatus(immediate = true) {
    stopPollDetailExportStatus();
    if (immediate) {
      getInviteDetailExportStatus();
    }
    statusInterval = window.setInterval(() => {
      getInviteDetailExportStatus();
    }, 60e3);
  }

  function stopPollDetailExportStatus() {
    if (statusInterval) {
      clearInterval(statusInterval);
      statusInterval = null;
    }
  }

  /**
   * 点击下载明细
   */
  async function handleDownloadDetail() {
    detailStatusLoading.value = true;
    const data = await watchCore.invite.startLoadInviteDetail();
    detailStatusLoading.value = false;

    // 报错toast提示
    if (
      data.type === InviteDetailLoadStatus.Error &&
      data.reason === InviteDetailExportErrorReason.OverLimit
    ) {
      toast.error(translate('invite.detail.limit'));
      return;
    }

    detailLoadStatus.value = data;
    // 防止点击下载按钮，任务下载太快，没有显示下载中loading
    setTimeout(() => {
      startPollDetailExportStatus();
    }, 3000);
  }

  /**
   * 点击保存明细
   */
  function handleSaveDetail() {
    if (detailLoadStatus.value?.content) {
      const link = document.createElement('a');

      link.href = detailLoadStatus.value.content;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return {
    totalInviteDetailList,

    initInviteDetail,
    getInviteDetail,

    handleScroll,

    canShowDetailExport,
    detailExportRef,

    detailLoadStatus,
    detailStatusLoading,
    getInviteDetailExportStatus,
    stopPollDetailExportStatus,
    isWaitStatusFirstGet,
    handleDownloadDetail,
    handleSaveDetail,
  };
};
