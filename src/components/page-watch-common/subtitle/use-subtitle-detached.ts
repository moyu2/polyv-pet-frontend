import { computed, reactive, ref, type Ref } from 'vue';
const dockedCaptionInventory = reactive<{
  defaultSlots: HTMLElement | undefined;
  detachedSlots: HTMLElement | undefined;
}>({
  defaultSlots: undefined,
  detachedSlots: undefined,
});

interface DialogConfig {
  dialogRef: Ref<HTMLElement | null>;
  dialogMoveHandle: Ref<HTMLElement | null>;
  dialogStyle: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
}
const showDetachedWindow = ref(false);
const renderParent = computed(() => {
  return showDetachedWindow.value
    ? dockedCaptionInventory.detachedSlots
    : dockedCaptionInventory.defaultSlots;
});

export const useSubtitleDetached = () => {
  const setDefaultSlots = (slots: HTMLElement | undefined) => {
    dockedCaptionInventory.defaultSlots = slots;
  };
  const setDetachedSlots = (slots: HTMLElement | undefined) => {
    dockedCaptionInventory.detachedSlots = slots;
  };
  const scrollToBottomDetached = () => {
    const scrollEl = document.querySelector('.pc-subtitle-detached-dialog__content--scroll');
    if (!scrollEl) return;

    scrollEl.scrollTo(0, document.querySelector('.c-subtitle__scroll')?.scrollHeight || 0);
  };
  const initDragAndResize = (options: DialogConfig) => {
    const dialog = options.dialogRef.value;
    if (!dialog) return;

    const dialogMoveHandle = options.dialogMoveHandle.value;
    if (!dialogMoveHandle) return;

    let isDragging = false;
    let isResizing = false;
    let resizeDirection = '';
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let startWidth = 0;
    let startHeight = 0;
    const minWidth = 400;
    const minHeight = 500;

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newLeft = startLeft + dx;
        let newTop = startTop + dy;

        // 确保拖动时不会超出视口范围
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dialogWidth = dialog.offsetWidth;
        const dialogHeight = dialog.offsetHeight;

        newLeft = Math.max(0, Math.min(newLeft, viewportWidth - dialogWidth));
        newTop = Math.max(0, Math.min(newTop, viewportHeight - dialogHeight));

        options.dialogStyle.left = `${newLeft}px`;
        options.dialogStyle.top = `${newTop}px`;
      } else if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (resizeDirection.includes('r')) {
          options.dialogStyle.width = `${Math.max(minWidth, startWidth + dx)}px`;
        }
        if (resizeDirection.includes('l')) {
          const newWidth = Math.max(minWidth, startWidth - dx);
          if (newWidth > minWidth) {
            options.dialogStyle.width = `${newWidth}px`;
            options.dialogStyle.left = `${startLeft + dx}px`;
          }
        }
        if (resizeDirection.includes('b')) {
          options.dialogStyle.height = `${Math.max(minHeight, startHeight + dy)}px`;
        }
        if (resizeDirection.includes('t')) {
          const newHeight = Math.max(minHeight, startHeight - dy);
          if (newHeight > minHeight) {
            options.dialogStyle.height = `${newHeight}px`;
            options.dialogStyle.top = `${startTop + dy}px`;
          }
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    const onMouseDown = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const borderSize = 16; // 边框可调整大小的区域

      const onRight = e.clientX > rect.right - borderSize;
      const onLeft = e.clientX < rect.left + borderSize;
      const onBottom = e.clientY > rect.bottom - borderSize;
      const onTop = e.clientY < rect.top + borderSize;

      if (onRight || onLeft || onBottom || onTop) {
        isResizing = true;
        resizeDirection = '';
        if (onTop) resizeDirection += 't';
        if (onBottom) resizeDirection += 'b';
        if (onLeft) resizeDirection += 'l';
        if (onRight) resizeDirection += 'r';
      } else if (dialogMoveHandle.contains(e.target as Node)) {
        isDragging = true;
      } else {
        return;
      }

      e.preventDefault();

      startX = e.clientX;
      startY = e.clientY;
      startLeft = dialog.offsetLeft;
      startTop = dialog.offsetTop;
      startWidth = dialog.offsetWidth;
      startHeight = dialog.offsetHeight;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    dialog.addEventListener('mousedown', onMouseDown);

    const dispose = () => {
      dialog && dialog.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    return {
      dispose,
    };
  };

  return {
    setDefaultSlots,
    setDetachedSlots,

    initDragAndResize,
    scrollToBottomDetached,

    renderParent,
    showDetachedWindow,
    dockedCaptionInventory,
  };
};
