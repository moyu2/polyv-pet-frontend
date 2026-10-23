import { onBeforeUnmount, onBeforeMount, ref } from 'vue';

/**
 * @hook PC 页面布局 hook
 */
export const usePageLayoutStyle = () => {
  const pageWidth = ref(0);

  function updatePageWidth(): void {
    const width = document.documentElement.clientWidth;
    pageWidth.value = width;
  }

  onBeforeMount(() => {
    updatePageWidth();
    window.addEventListener('resize', updatePageWidth, false);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePageWidth, false);
    // document.documentElement.style.fontSize = '';
  });

  return {
    pageWidth,
  };
};
