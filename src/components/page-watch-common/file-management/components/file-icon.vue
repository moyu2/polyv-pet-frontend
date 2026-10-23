<!-- @file 文件图标组件 -->
<template>
  <div class="c-file-icon">
    <!-- 图片格式显示图片 -->
    <template v-if="isImageFile && !imageLoadError">
      <img
        :src="fileItem.fileUrl"
        :alt="fileItem.fileName"
        class="c-file-icon__image"
        @error="onImageError"
        @load="onImageLoad"
      />
      <!-- 图片加载状态 -->
      <div
        v-if="imageLoading"
        class="c-file-icon__loading"
      >
        <div class="c-file-icon__loading-spinner"></div>
      </div>
    </template>

    <!-- 其他格式或图片加载失败时显示对应图标 -->
    <img
      v-else
      :src="iconSrc"
      :alt="fileTypeText"
      class="c-file-icon__icon"
      @error="onIconError"
    />

    <!-- 图标加载失败时的降级显示 -->
    <div
      v-if="iconLoadError"
      class="c-file-icon__fallback"
    >
      <span class="c-file-icon__fallback-text">
        {{ fileItem.fileExtension.toUpperCase() || 'FILE' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FileItem } from '../use-file-management';

// 图标资源路径
const getIconPath = (iconName: string) => {
  try {
    return require(`../assets/imgs/${iconName}.png`);
  } catch {
    // 如果图片不存在，返回默认图标路径
    return require('../assets/imgs/file-doc.png');
  }
};

interface Props {
  fileItem: FileItem;
}

const props = defineProps<Props>();

/** 图片加载错误状态 */
const imageLoadError = ref(false);

/** 图片加载中状态 */
const imageLoading = ref(true);

/** 图标加载错误状态 */
const iconLoadError = ref(false);

/** 是否为图片文件 */
const isImageFile = computed(() => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return (
    imageExtensions.includes(props.fileItem.fileExtension.toLowerCase()) && !imageLoadError.value
  );
});

/** 文件类型图标映射 */
const fileTypeIconMap: Record<string, string> = {
  // PDF 文档
  pdf: 'file-pdf',

  // Word 文档
  doc: 'file-doc',
  docx: 'file-doc',
  rtf: 'file-doc',

  // PowerPoint 演示文稿
  ppt: 'file-ppt',
  pptx: 'file-ppt',

  // Excel 表格
  xls: 'file-doc', // 使用doc图标代替
  xlsx: 'file-doc',
  csv: 'file-doc',

  // 其他格式默认图标
  other: 'file-other',
};

/** 获取文件类型图标 */
const iconSrc = computed(() => {
  const extension = props.fileItem.fileExtension.toLowerCase();
  const iconName = fileTypeIconMap[extension] || fileTypeIconMap.other;
  return getIconPath(iconName);
});

/** 文件类型文本 */
const fileTypeText = computed(() => {
  const typeMap: Record<string, string> = {
    // 文档类型
    pdf: 'PDF文档',
    doc: 'Word文档',
    docx: 'Word文档',
    rtf: 'RTF文档',
    ppt: 'PowerPoint演示文稿',
    pptx: 'PowerPoint演示文稿',
    xls: 'Excel表格',
    xlsx: 'Excel表格',
    csv: 'CSV表格',

    // 图片文件
    jpg: 'JPEG图片',
    jpeg: 'JPEG图片',
    png: 'PNG图片',
    gif: 'GIF图片',
    bmp: 'BMP图片',
    webp: 'WebP图片',
    svg: 'SVG图片',
  };

  const extension = props.fileItem.fileExtension.toLowerCase();
  return typeMap[extension] || '文件';
});

/** 图片加载完成处理 */
function onImageLoad() {
  imageLoading.value = false;
}

/** 图片加载错误处理 */
function onImageError() {
  imageLoadError.value = true;
  imageLoading.value = false;
}

/** 图标加载错误处理 */
function onIconError() {
  iconLoadError.value = true;
}
</script>

<style lang="scss">
.c-file-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  background: rgba(#f0f0f0, 0.5);
  border-radius: 4px;
}

.c-file-icon__image,
.c-file-icon__icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.c-file-icon__image {
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.c-file-icon__image:hover {
  opacity: 0.8;
}

.c-file-icon__icon {
  object-fit: contain;
  padding: 2px;
  transition: transform 0.2s ease;
}

.c-file-icon__icon:hover {
  transform: scale(1.05);
}

// 加载状态样式
.c-file-icon__loading {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.c-file-icon__loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 降级显示样式
.c-file-icon__fallback {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240, 240, 240, 0.9);
  border-radius: 4px;
}

.c-file-icon__fallback-text {
  padding: 2px;
  font-size: 8px;
  font-weight: bold;
  line-height: 1;
  color: #666;
  text-align: center;
  word-break: break-all;
}

// 深色模式适配
.c-file-icon {
  position: relative;

  .plv-watch-theme-dark & {
    background: rgba(#ffffff, 0.1);

    .c-file-icon__loading {
      background: rgba(0, 0, 0, 0.8);
    }

    .c-file-icon__fallback {
      background: rgba(0, 0, 0, 0.9);

      .c-file-icon__fallback-text {
        color: #ccc;
      }
    }
  }
}
</style>
