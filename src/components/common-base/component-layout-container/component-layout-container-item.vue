<template>
  <div class="c-component-layout-container__item">
    <slot ref="slotRef"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { PropUtils } from '@polyv/vue-components';
import { debounce } from 'lodash-es';
import { ResizeObserver } from '@juggle/resize-observer';

const props = defineProps({
  id: PropUtils.oneOfType([String, Number]).isRequired,
  // 监听slot的变化，并触发resize事件重新渲染瀑布流的行跨度
  monitorSlotResize: PropUtils.bool.def(false),
});

const slotRef = ref<HTMLElement | null>(null);

// eslint-disable-next-line no-unused-vars
const useItemLoad = (cb: (el?: HTMLElement) => void) => {
  let resizeObserver: ResizeObserver | null = null;

  const vm = getCurrentInstance()?.proxy;

  const onResize = debounce(() => {
    nextTick(() => {
      cb(vm?.$el as HTMLElement);
    });
  }, 300);

  // 获取slot的目标el
  const getTargetSlotEl = () => {
    return vm?.$slots.default?.[0]?.componentInstance?.$el;
  };

  onMounted(() => {
    cb(vm?.$el as HTMLElement);
    window.addEventListener('resize', onResize);

    // 比如图文组件，图片加载完会影响item的高度，所以需要监听slot的变化，并触发一次onResize
    if (props.monitorSlotResize) {
      const slotEl = getTargetSlotEl();

      if (slotEl) {
        resizeObserver = new ResizeObserver(() => {
          onResize();
        });
        resizeObserver.observe(slotEl);
      }
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
};

const emit = defineEmits(['load']);

useItemLoad(el => {
  emit('load', {
    height: el ? el.clientHeight : 0,
    id: props.id,
  });
});
</script>

<style lang="scss">
.c-component-layout-container__item {
  box-sizing: border-box;
  width: 100%;
}
</style>
