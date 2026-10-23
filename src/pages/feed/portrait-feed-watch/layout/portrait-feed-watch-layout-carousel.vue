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
      <plv-carousel-item v-if="inSecondFeedLayout">
        <carousel-page-container click-for-player />
      </plv-carousel-item>

      <!-- 主屏 -->
      <plv-carousel-item>
        <carousel-page-container click-for-player>
          <feed-layout-level-first-main-screen
            v-if="inFirstFeedLayout"
            key="first-feed-layout"
          />
          <carousel-main-screen
            v-if="inSecondFeedLayout"
            key="second-feed-layout"
          />
        </carousel-page-container>
      </plv-carousel-item>

      <!-- 空白屏 -->
      <plv-carousel-item v-if="inSecondFeedLayout">
        <carousel-page-container click-for-player />
      </plv-carousel-item>
    </plv-carousel>
  </div>
</template>

<script setup lang="ts">
import CarouselPageContainer from '@/pages/watch/portrait-watch/layout/carousel-page-container.vue';
import FeedLayoutLevelFirstMainScreen from './feed-layout-level-first-main-screen.vue';
import CarouselMainScreen from '@/pages/watch/portrait-watch/layout/carousel-main-screen.vue';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useDocStore } from '@/store/use-doc-store';
import { nextTick, onBeforeMount, ref, watch } from 'vue';
import { PlvCarouselInstance } from '@/plugins/polyv-ui/types';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';

const feedInjectStore = useFeedInjectStore();
const { inFirstFeedLayout, inSecondFeedLayout } = storeDefinitionToRefs(useFeedInjectStore);

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

onBeforeMount(() => {
  feedInjectStore.setInitCarouselActiveIndex();
});
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
