<!-- @file 竖屏布局：轮播屏 -->
<template>
  <div class="c-portrait-watch-layout-carousel">
    <plv-carousel
      ref="carouselRef"
      class="c-portrait-watch-layout-carousel__main"
      :slide-index.sync="carouselActiveIndex"
      :css-rotate-angle="portraitPlayerIsPageFullscreen ? 90 : 0"
    >
      <!-- 空白屏 -->
      <plv-carousel-item>
        <carousel-page-container
          click-for-player
          is-blank-screen
        />
      </plv-carousel-item>

      <!-- 主屏 -->
      <plv-carousel-item>
        <carousel-page-container click-for-player>
          <carousel-main-screen />
        </carousel-page-container>
      </plv-carousel-item>
    </plv-carousel>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import { PlvCarouselInstance } from '@/plugins/polyv-ui/types';
import { useDocStore } from '@/store/use-doc-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { nextTick, ref, watch } from 'vue';
import CarouselMainScreen from './carousel-main-screen.vue';
import CarouselPageContainer from './carousel-page-container.vue';

const { carouselActiveIndex, portraitPlayerIsPageFullscreen } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { documentSwitch } = storeDefinitionToRefs(useDocStore);

const carouselRef = ref<PlvCarouselInstance>();

watch(
  () => documentSwitch.value,
  async () => {
    await nextTick();

    if (carouselRef.value?.handleWindowReszie) {
      carouselRef.value.handleWindowReszie();
    }
  },
);
</script>

<style lang="scss">
.c-portrait-watch-layout-carousel {
  width: 100%;
  height: 100%;
  color: $--color-white;
  pointer-events: initial;
  .c-portrait-watch-layout-carousel__main {
    overflow: visible;
  }
}
</style>
