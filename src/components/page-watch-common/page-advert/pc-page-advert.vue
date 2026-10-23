<!-- @file PC 端页面广告 -->
<template>
  <div
    v-if="pageAdvertVisible && pageAdvertEnabled && pageAdvertList.length"
    class="c-pc-page-advert pws-page-advert"
  >
    <div class="c-pc-page-advert__content">
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
          <div class="c-pc-page-advert__prev pws-page-advert-arrow">
            <pc-icon-arrow-left class="c-pc-page-advert__prev__icon" />
          </div>
        </template>

        <template #nextArrow>
          <div class="c-pc-page-advert__next pws-page-advert-arrow">
            <pc-icon-arrow-right class="c-pc-page-advert__next__icon" />
          </div>
        </template>
      </plv-carousel>

      <pc-icon-close-round
        v-if="pageAdvertCloseVisible"
        class="c-pc-page-advert__content__close"
        @click="closePageAdvert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PcIconCloseRound,
  PcIconArrowLeft,
  PcIconArrowRight,
} from '@/components/component-icons/pc/map';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/pc-import';
import { useAdvertStore } from '@/store/use-advert-store';
import { storeToRefs } from 'pinia';
import PageAdvertItem from './page-advert-item.vue';

const advertStore = useAdvertStore();
const { closePageAdvert } = advertStore;
const { pageAdvertVisible, pageAdvertEnabled, pageAdvertList, pageAdvertCloseVisible } =
  storeToRefs(advertStore);
</script>

<style lang="scss">
.c-pc-page-advert {
  position: relative;
  z-index: 200;
  flex-shrink: 0;
  width: 100%;
  height: 0;
  padding-bottom: 16%;
  border-radius: inherit;
}

.c-pc-page-advert__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: inherit;

  .plv-carousel {
    border-radius: inherit;
  }
}

.c-pc-page-advert__prev,
.c-pc-page-advert__next {
  position: absolute;
  top: 50%;
  cursor: pointer;
  transform: translateY(-50%);
}
.c-pc-page-advert__prev {
  left: 0;
}
.c-pc-page-advert__next {
  right: 0;
}

.c-pc-page-advert__prev__icon,
.c-pc-page-advert__next__icon {
  display: flex;
  font-size: 30px !important;
}

.c-pc-page-advert__content__close {
  position: absolute;
  top: 50%;
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
