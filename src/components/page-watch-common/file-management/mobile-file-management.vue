<!-- @file 移动端文件管理 -->
<template>
  <mobile-popup
    class="c-mobile-file-management"
    :visible.sync="dialogVisible"
    :title="$lang('fileManagement.title')"
    :force-show-body-scrollbar="false"
    @after-enter="updateContentStyle"
  >
    <div
      ref="scrollContainerRef"
      class="c-mobile-file-management__content"
      :class="{
        'c-mobile-file-management__content--ios': isIOS,
      }"
      :style="contentStyle"
    >
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="c-mobile-file-management__loading"
      >
        <div class="c-mobile-file-management__loading-text">
          {{ $lang('fileManagement.loading') }}
        </div>
      </div>

      <!-- 文件列表 -->
      <div
        v-else-if="fileList.length > 0"
        class="c-mobile-file-management__list"
      >
        <div
          v-for="file in fileList"
          :key="file.id"
          class="c-mobile-file-management__item"
        >
          <div class="c-mobile-file-management__item-icon">
            <file-icon :file-item="file" />
          </div>

          <div class="c-mobile-file-management__item-info">
            <div class="c-mobile-file-management__item-name">
              {{ file.fileName }}
            </div>
            <div
              class="c-mobile-file-management__item-meta"
              v-if="file.fileSize > 0"
            >
              <span class="c-mobile-file-management__item-size">
                {{ formatFileSize(file.fileSize) }}
              </span>
            </div>
          </div>

          <div class="c-mobile-file-management__item-action">
            <mobile-icon-file-download @click="downloadFile(file)" />
          </div>
        </div>

        <!-- 加载更多状态 -->
        <div
          v-if="loadingMore"
          class="c-mobile-file-management__load-more"
        >
          <div class="c-mobile-file-management__load-more-text">
            {{ $lang('fileManagement.loadingMore') }}
          </div>
        </div>

        <!-- 没有更多数据提示 -->
        <div
          v-else-if="!hasMore"
          class="c-mobile-file-management__no-more"
        >
          <div class="c-mobile-file-management__no-more-text">
            {{ $lang('fileManagement.noMore') }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="c-mobile-file-management__empty"
      >
        <mobile-icon-empty />
        <div class="c-mobile-file-management__empty-text">
          {{ $lang('fileManagement.empty') }}
        </div>

        <div class="c-mobile-file-management__empty-tips">
          {{ $lang('fileManagement.empty.tips') }}
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useFileManagement } from './use-file-management';
import FileIcon from './components/file-icon.vue';
import { MobileIconFileDownload, MobileIconEmpty } from '@/components/component-icons/mobile/map';
import { useScrollLoad } from './hooks/use-scroll-load';
import { isIOS } from '@/assets/utils/browser';

const {
  dialogVisible,

  fileList,
  loading,
  loadingMore,
  hasMore,
  contentStyle,

  downloadFile,
  loadMoreFiles,
  formatFileSize,

  updateContentStyle,
} = useFileManagement();

// 滚动加载 - 简化版本
const { scrollContainerRef } = useScrollLoad(loadMoreFiles, {
  threshold: 50,
  disabled: () => loading.value || loadingMore.value || !hasMore.value,
});
</script>

<style lang="scss">
.c-mobile-file-management {
  .c-mobile-popup__body {
    overflow: hidden !important; // 强制禁用popup的滚动
  }
}

.c-mobile-file-management__content {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 16px 16px 0;
  overflow-y: scroll;
  background: #f6f7f9;
  transform: translateZ(0);

  -webkit-overflow-scrolling: touch;
}

.c-mobile-file-management__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}

.c-mobile-file-management__loading-text {
  font-size: 14px;
  color: rgba(#000000, 0.6);
}

.c-mobile-file-management__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.c-mobile-file-management__item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
}

.c-mobile-file-management__item-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.c-mobile-file-management__item-info {
  flex: 1;
  min-width: 0;
}

.c-mobile-file-management__item-name {
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

.c-mobile-file-management__item-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}

.c-mobile-file-management__item-size,
.c-mobile-file-management__item-time {
  font-size: 12px;
  line-height: 16px;
  color: rgba(#000000, 0.5);
}

.c-mobile-file-management__item-action {
  flex-shrink: 0;
}

.c-mobile-file-management__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  // iOS底部安全区域支持
  padding-bottom: calc(60px + env(safe-area-inset-bottom, 0));
  text-align: center;

  .polyv-icon-empty {
    font-size: 48px;
    color: rgba(#000000, 0.5);
  }
}
.c-mobile-file-management__empty-text {
  font-size: 14px;
  line-height: 20px;
  color: rgba(#000000, 0.6);
}

.c-mobile-file-management__empty-tips {
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  color: rgba(#000000, 0.4);
}

// 深色模式适配
.c-mobile-file-management__item {
  .plv-watch-theme-dark & {
    background: rgba(#ffffff, 0.08);
    border-color: rgba(#ffffff, 0.1);
  }
}

.c-mobile-file-management__item-name {
  .plv-watch-theme-dark & {
    color: #ffffff;
  }
}

.c-mobile-file-management__item-icon {
  .plv-watch-theme-dark & {
    background: rgba(#ffffff, 0.1);
  }
}

.c-mobile-file-management__item-action {
  margin-left: 16px;

  .polyv-icon-file-download {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
}

.c-mobile-file-management__load-more,
.c-mobile-file-management__no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  // iOS底部安全区域支持
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
  text-align: center;
}

.c-mobile-file-management__load-more-text,
.c-mobile-file-management__no-more-text {
  font-size: 12px;
  line-height: 16px;
  color: rgba(#000000, 0.5);
}

.c-mobile-file-management__load-more-text {
  color: #1890ff;
}

// 深色模式适配
.c-mobile-file-management__load-more-text,
.c-mobile-file-management__no-more-text {
  .plv-watch-theme-dark & {
    color: rgba(#ffffff, 0.5);
  }
}

.c-mobile-file-management__load-more-text {
  .plv-watch-theme-dark & {
    color: #40a9ff;
  }
}
</style>
