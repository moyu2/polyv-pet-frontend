/**
 * @file 拖拽逻辑 Composable
 */
import { computed, onUnmounted, ref, type Ref } from 'vue';

interface Position {
  top: number;
  left: number;
}

interface DragOptions {
  /** 初始位置 */
  initialPosition?: Position;
  /** 最小可见宽度 */
  minVisibleWidth?: number;
  /** 最小可见高度 */
  minVisibleHeight?: number;
  /** 拖拽手的类名，用于限制拖拽区域 */
  dragHandleSelector?: string;
}

/**
 * 拖拽功能 Composable
 * 替代 theme-select.vue 中手写的拖拽逻辑
 */
export function useDraggable(elementRef: Ref<HTMLElement | null>, options: DragOptions = {}) {
  const {
    initialPosition = { top: 0, left: 0 },
    minVisibleWidth = 50,
    minVisibleHeight = 50,
    dragHandleSelector = '.c-theme-select__header',
  } = options;

  const position = ref<Position>(initialPosition);
  const isDragging = ref(false);
  const dragOffset = ref({ x: 0, y: 0 });

  /**
   * 动态计算边界
   * 使用 getBoundingClientRect() 替代硬编码的宽高值
   */
  const bounds = computed(() => {
    if (!elementRef.value) {
      return { width: 200, height: 300 }; // fallback
    }
    const rect = elementRef.value.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });

  /**
   * 拖拽开始
   */
  function onDragStart(e: MouseEvent | TouchEvent) {
    const target = e.target as HTMLElement;
    // 只允许在指定的拖拽手柄区域拖拽
    if (!target.closest(dragHandleSelector)) {
      return;
    }

    e.preventDefault();
    isDragging.value = true;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragOffset.value = {
      x: clientX - position.value.left,
      y: clientY - position.value.top,
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  /**
   * 拖拽中
   */
  function onDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging.value) {
      return;
    }
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const { width, height } = bounds.value;

    // 计算新位置
    let newLeft = clientX - dragOffset.value.x;
    let newTop = clientY - dragOffset.value.y;

    // 限制边界：确保组件至少部分在可视区域内
    newLeft = Math.max(
      -width + minVisibleWidth,
      Math.min(newLeft, viewportWidth - minVisibleWidth),
    );
    newTop = Math.max(
      -height + minVisibleHeight,
      Math.min(newTop, viewportHeight - minVisibleHeight),
    );

    position.value = {
      top: newTop,
      left: newLeft,
    };
  }

  /**
   * 拖拽结束
   */
  function onDragEnd() {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  /**
   * 组件卸载时清理事件监听
   */
  onUnmounted(() => {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  });

  return {
    position,
    isDragging,
    bounds,
    onDragStart,
  };
}
