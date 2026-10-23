<template>
  <div
    class="c-portrait-boundary-wrap"
    :class="{
      'c-portrait-boundary-wrap--left': seat === 'left',
      'c-portrait-boundary-wrap--right': seat === 'right',
      'c-portrait-boundary-wrap--top': seat === 'top',
      'c-portrait-boundary-wrap--fullscreen': portraitPlayerIsPageFullscreen,
    }"
    :style="{
      height: `${portraitWatchLayoutHeight}px`,
    }"
  >
    <div class="c-portrait-boundary-wrap__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';

const { portraitPlayerIsPageFullscreen, portraitWatchLayoutHeight } =
  storeDefinitionToRefs(usePortraitLayoutStore);

defineProps({
  /** 位置，左 or 右 */
  seat: PropUtils.oneOf(['left', 'right', 'top'] as const).def('left'),
});
</script>

<style lang="scss">
.c-portrait-boundary-wrap {
  position: absolute;
  bottom: 0;
  z-index: 1;
  width: 0;
}

.c-portrait-boundary-wrap--fullscreen {
  height: $--plv-mobile-watch-full-screen-vw !important;
}

.c-portrait-boundary-wrap--left {
  left: 0;
  .c-portrait-boundary-wrap__content {
    padding-top: 16px;
    padding-left: 16px;
  }
}
.c-portrait-boundary-wrap--right {
  right: 0;
  .c-portrait-boundary-wrap__content {
    display: inline-flex;
    padding-top: 16px;
    padding-right: 16px;
    transform: translateX(-100%);
  }
}
.c-portrait-boundary-wrap--top {
  right: 50%;
  .c-portrait-boundary-wrap__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
  }
}
</style>
