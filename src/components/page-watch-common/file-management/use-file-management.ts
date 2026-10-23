import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { computed, ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { ChannelFileListItem } from '@polyv/live-watch-sdk';
import { previewImage } from '@/hooks/components/use-image-preview';
import { isMobile } from '@/assets/utils/browser';
import {
  formatFileSize,
  getFileTypeFromExtension,
  downloadFile as utilDownloadFile,
} from '@/assets/utils/file';

export interface FileItem {
  /** 文件ID */
  id: string;
  /** 文件名 */
  fileName: string;
  /** 文件类型 */
  fileType: 'pdf' | 'word' | 'ppt' | 'excel' | 'image' | 'other';
  /** 文件大小(字节) */
  fileSize: number;
  /** 文件URL */
  fileUrl: string;
  /** 发布时间 */
  publishTime: number;
  /** 文件扩展名 */
  fileExtension: string;
}

/**
 * 文件管理 hook
 */
export const useFileManagement = () => {
  const { getWatchCore } = useGlobalInject();
  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  /** 显示状态 */
  const dialogVisible = ref(false);

  /** 文件列表 */
  const fileList = ref<FileItem[]>([]);

  /** 加载状态 */
  const loading = ref(false);

  /** 加载更多状态 */
  const loadingMore = ref(false);

  /** 当前页码 */
  const currentPage = ref(1);

  /** 每页数量 */
  const pageSize = ref(10);

  /** 是否还有更多数据 */
  const hasMore = ref(true);

  /** 内容样式 */
  const contentStyle = ref({
    height: '100%',
  });

  // 删除重复的工具函数实现，使用通用工具函数

  /** 将后端文件数据转换为前端FileItem格式 */
  const convertToFileItem = (item: ChannelFileListItem): FileItem => {
    // 确保文件名有效
    const fileName = item.name?.trim() || '未知文件';
    // 安全获取文件扩展名
    const fileExtension = fileName.includes('.')
      ? fileName.split('.').pop()?.toLowerCase() || ''
      : '';

    return {
      id: item.id || `file_${Date.now()}_${Math.random().toString(36)}`,
      fileName,
      fileType: getFileTypeFromExtension(fileExtension),
      fileSize: Math.max(0, item.fileSize || 0), // 确保文件大小不为负数
      fileUrl: item.url || '',
      publishTime: item.time && item.time > 0 ? item.time : Date.now(),
      fileExtension,
    };
  };

  /** 文件列表(不进行排序，假设后端已按时间倒序返回) */
  const sortedFileList = computed(() => {
    return fileList.value;
  });

  /** 设置弹层状态 */
  function setDialogVisible(visible = true) {
    dialogVisible.value = visible;
    if (visible) {
      resetAndLoadFileList();
    }
  }

  /** 重置并加载文件列表 */
  function resetAndLoadFileList() {
    currentPage.value = 1;
    hasMore.value = true;
    fileList.value = [];
    loadFileList();
  }

  /** 加载文件列表 */
  async function loadFileList(isLoadMore = false) {
    // 如果是加载更多，设置loadingMore状态，否则设置loading状态
    if (isLoadMore) {
      if (loadingMore.value || !hasMore.value) return;
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    try {
      const response = await watchCore.chat.getChannelFileList({
        pageNumber: currentPage.value,
        pageSize: pageSize.value,
      });

      // 转换数据格式
      const convertedFiles = response.list.map(convertToFileItem);

      if (isLoadMore) {
        // 加载更多：追加到现有列表
        fileList.value = [...fileList.value, ...convertedFiles];
      } else {
        // 首次加载：替换列表
        fileList.value = convertedFiles;
      }

      // 判断是否还有更多数据
      // 如果当前页返回的数据少于每页大小，说明已经是最后一页
      const isLastPage = convertedFiles.length < pageSize.value;
      hasMore.value = !isLastPage && fileList.value.length < response.totalCount;

      if (hasMore.value) {
        currentPage.value++;
      }
    } catch (error) {
      console.error('加载文件列表失败:', error);
      toast.error(translate('fileManagement.loadError'));
      if (!isLoadMore) {
        fileList.value = [];
      }
    } finally {
      if (isLoadMore) {
        loadingMore.value = false;
      } else {
        loading.value = false;
      }
    }
  }

  /** 加载更多文件 */
  function loadMoreFiles() {
    loadFileList(true);
  }

  /** 下载文件 */
  async function downloadFile(file: FileItem) {
    // 检查文件参数有效性
    if (!file || !file.id) {
      toast.error(translate('fileManagement.downloadError') || '下载失败，请重试');
      return;
    }

    try {
      // 检查文件URL是否有效
      if (!file.fileUrl || !file.fileUrl.trim()) {
        throw new Error('文件URL无效');
      }

      if (file.fileType === 'image' && isMobile) {
        previewImage(file.fileUrl);
        return;
      }

      // 检查文件名是否有效
      const fileName = file.fileName?.trim() || `download_${Date.now()}`;

      // 使用通用的下载工具函数
      utilDownloadFile(file.fileUrl, fileName);
    } catch (error) {
      console.error('文件下载失败:', error);
      toast.error(translate('fileManagement.downloadError') || '下载失败，请重试');
    }
  }

  useEventBusListener(appEvents.global.OpenFileManagement, () => {
    setDialogVisible(true);
  });

  function updateContentStyle() {
    const popupRef = document.querySelector(
      '.c-mobile-file-management .c-mobile-popup__content',
    ) as HTMLDivElement;
    if (popupRef) {
      contentStyle.value = {
        height: `calc(${popupRef.style.maxHeight} - 50px)`, // 减去header高度
      };
    }
  }

  return {
    dialogVisible,
    setDialogVisible,

    fileList: sortedFileList,
    loading,
    loadingMore,
    hasMore,
    contentStyle,

    downloadFile,
    formatFileSize,

    loadFileList,
    loadMoreFiles,
    resetAndLoadFileList,

    updateContentStyle,
  };
};
