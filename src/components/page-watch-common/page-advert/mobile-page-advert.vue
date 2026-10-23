<!-- @file 移动端页面广告 -->
<template>
  <div
    v-if="pageAdvertVisible && pageAdvertEnabled && pageAdvertList.length"
    class="c-mobile-page-advert pws-page-advert"
  >
    <div class="c-mobile-page-advert__content">
      <plv-carousel
        autoplay
        loop
      >
        <plv-carousel-item
          v-for="(item, index) in pageAdvertList"
          :key="index"
        >
          <page-advert-item :advert="item" />
        </plv-carousel-item>

        <template #prevArrow>
          <div class="c-mobile-page-advert__prev pws-page-advert-arrow">
            <mobile-icon-arrow-left class="c-mobile-page-advert__next__icon" />
          </div>
        </template>

        <template #nextArrow>
          <div class="c-mobile-page-advert__next pws-page-advert-arrow">
            <mobile-icon-arrow-right class="c-mobile-page-advert__next__icon" />
          </div>
        </template>
      </plv-carousel>

      <mobile-icon-close-round
        v-if="pageAdvertCloseVisible"
        class="c-mobile-page-advert__content__close"
        @click="closePageAdvert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  MobileIconCloseRound,
  MobileIconArrowLeft,
  MobileIconArrowRight,
} from '@/components/component-icons/mobile/map';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import { useAdvertStore } from '@/store/use-advert-store';
import PageAdvertItem from './page-advert-item.vue';

const pageAdvertStore = useAdvertStore();
const { closePageAdvert } = pageAdvertStore;
const { pageAdvertVisible, pageAdvertEnabled, pageAdvertList, pageAdvertCloseVisible } =
  storeToRefs(pageAdvertStore);
</script>

<style lang="scss">
.c-mobile-page-advert {
  position: relative;
  z-index: 140;
  flex-shrink: 0;
  width: 100%;
  height: 0;
  padding-bottom: 16%;
}

.c-mobile-page-advert__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
}

.c-mobile-page-advert__prev,
.c-mobile-page-advert__next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.c-mobile-page-advert__prev {
  left: 0;
}
.c-mobile-page-advert__next {
  right: 0;
}

.c-mobile-page-advert__prev__icon,
.c-mobile-page-advert__next__icon {
  display: flex;
  font-size: 30px !important;
}

.c-mobile-page-advert__content__close {
  position: absolute;
  top: -20px;
  right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px !important;
  color: $--color-white;
  cursor: pointer;
}
</style>
