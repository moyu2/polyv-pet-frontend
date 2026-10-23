<!-- @file PC端文件管理 -->
<template>
  <pc-dialog
    :visible.sync="dialogVisible"
    :title="$lang('fileManagement.title')"
    :width="375"
    :hide-header-border="true"
    :body-locked="true"
    class="c-pc-file-management"
  >
    <div
      ref="scrollContainerRef"
      class="c-pc-file-management__content"
    >
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="c-pc-file-management__loading"
      >
        <div class="c-pc-file-management__loading-text">
          {{ $lang('fileManagement.loading') }}
        </div>
      </div>

      <!-- 文件列表 -->
      <div
        v-else-if="fileList.length > 0"
        class="c-pc-file-management__list"
      >
        <div
          v-for="file in fileList"
          :key="file.id"
          class="c-pc-file-management__item"
        >
          <div class="c-pc-file-management__item-icon">
            <file-icon :file-item="file" />
          </div>

          <div class="c-pc-file-management__item-info">
            <div class="c-pc-file-management__item-name">
              {{ file.fileName }}
            </div>
            <div
              class="c-pc-file-management__item-meta"
              v-if="file.fileSize > 0"
            >
              <span class="c-pc-file-management__item-size">
                {{ formatFileSize(file.fileSize) }}
              </span>
            </div>
          </div>

          <div class="c-pc-file-management__item-action">
            <mobile-icon-file-download @click="downloadFile(file)" />
          </div>
        </div>

        <!-- 加载更多状态 -->
        <div
          v-if="loadingMore"
          class="c-pc-file-management__load-more"
        >
          <div class="c-pc-file-management__load-more-text">
            {{ $lang('fileManagement.loadingMore') }}
          </div>
        </div>

        <!-- 没有更多数据提示 -->
        <div
          v-else-if="!hasMore"
          class="c-pc-file-management__no-more"
        >
          <div class="c-pc-file-management__no-more-text">
            {{ $lang('fileManagement.noMore') }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="c-pc-file-management__empty"
      >
        <mobile-icon-empty />
        <div class="c-pc-file-management__empty-text">
          {{ $lang('fileManagement.empty') }}
        </div>
        <div class="c-pc-file-management__empty-tips">
          {{ $lang('fileManagement.empty.tips') }}
        </div>
      </div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog';
import { useFileManagement } from './use-file-management';
import FileIcon from './components/file-icon.vue';
import { MobileIconFileDownload, MobileIconEmpty } from '@/components/component-icons/mobile/map';
import { useScrollLoad } from './hooks/use-scroll-load';

const {
  dialogVisible,

  fileList,
  loading,
  loadingMore,
  hasMore,

  downloadFile,
  loadMoreFiles,
  formatFileSize,
} = useFileManagement();

// 滚动加载
const { scrollContainerRef } = useScrollLoad(loadMoreFiles, {
  threshold: 100,
  disabled: () => loading.value || loadingMore.value || !hasMore.value,
});
</script>

<style lang="scss">
.c-pc-file-management__content {
  height: 500px;
  padding: 16px;
  overflow-y: auto;
  background: #f6f7f9;
}

.c-pc-file-management__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}

.c-pc-file-management__loading-text {
  font-size: 14px;
  color: rgba(#000000, 0.6);
}

.c-pc-file-management__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.c-pc-file-management__item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
}

.c-pc-file-management__item-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.c-pc-file-management__item-info {
  flex: 1;
  min-width: 0;
}

.c-pc-file-management__item-name {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #333333;
  word-break: break-all;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.c-pc-file-management__item-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}

.c-pc-file-management__item-size,
.c-pc-file-management__item-time {
  font-size: 12px;
  line-height: 16px;
  color: rgba(#000000, 0.5);
}

.c-pc-file-management__item-action {
  flex-shrink: 0;
}

.c-pc-file-management__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .polyv-icon-empty {
    font-size: 48px;
    color: rgba(#000000, 0.5);
  }
}

.c-pc-file-management__empty-text {
  font-size: 14px;
  line-height: 20px;
  color: rgba(#000000, 0.6);
}

.c-pc-file-management__empty-tips {
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  color: rgba(#000000, 0.4);
}

// 深色模式适配
.c-pc-file-management__item {
  .plv-watch-theme-dark & {
    background: rgba(#ffffff, 0.08);
    border-color: rgba(#ffffff, 0.1);
  }
}

.c-pc-file-management__item-name {
  .plv-watch-theme-dark & {
    color: #ffffff;
  }
}

.c-pc-file-management__item-icon {
  .plv-watch-theme-dark & {
    background: rgba(#ffffff, 0.1);
  }
}

.c-pc-file-management__item-action {
  margin-left: 16px;

  .polyv-icon-file-download {
    width: 16px;
    height: 16px;
    font-size: 16px;
    cursor: pointer;
  }
}

.c-pc-file-management__load-more,
.c-pc-file-management__no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
}

.c-pc-file-management__load-more-text,
.c-pc-file-management__no-more-text {
  font-size: 12px;
  line-height: 16px;
  color: rgba(#000000, 0.5);
}

.c-pc-file-management__load-more-text {
  color: #1890ff;
}

// 深色模式适配
.c-pc-file-management__load-more-text,
.c-pc-file-management__no-more-text {
  .plv-watch-theme-dark & {
    color: rgba(#ffffff, 0.5);
  }
}

.c-pc-file-management__load-more-text {
  .plv-watch-theme-dark & {
    color: #40a9ff;
  }
}

.c-pc-file-management {
  .g-singleline {
    text-align: center;
  }

  .c-pc-dialog__header {
    background: #f6f7f9;
  }
}
</style>
