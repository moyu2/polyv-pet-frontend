<!-- @file popper 箭头组件 -->
<template>
  <div
    class="c-popper-arrow"
    data-popper-arrow
    :style="arrowStyle"
  ></div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';
import { PropUtils, useProps } from '@polyv/vue-components';

const props = defineProps({
  /** 箭头颜色 */
  color: PropUtils.string.def('#fff'),
  /** 箭头大小 */
  size: PropUtils.number.def(6),
});

const { color, size } = useProps(props);

/** 箭头样式 */
const arrowStyle = computed(() => {
  return {
    color: unref(color),
    borderWidth: `${unref(size)}px`,
  };
});
</script>

<style lang="scss">
.c-popper-arrow {
  border-color: transparent;
  border-style: solid;
}

[data-popper-placement^='top'] > [data-popper-arrow] {
  bottom: 0;
  border-top-color: currentColor;
  transform: translateY(100%);
}
[data-popper-placement^='bottom'] > [data-popper-arrow] {
  top: 0;
  border-bottom-color: currentColor;
  transform: translateY(-100%);
}
[data-popper-placement^='right'] > [data-popper-arrow] {
  left: 0;
  border-right-color: currentColor;
  transform: translateX(-100%);
}
[data-popper-placement^='left'] > [data-popper-arrow] {
  right: 0;
  border-left-color: currentColor;
  transform: translateX(100%);
}
</style>
