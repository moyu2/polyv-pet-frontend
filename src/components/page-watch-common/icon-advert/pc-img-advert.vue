<!-- @file pc端图标广告 -->
<template>
  <div>
    <div
      class="c-pc-img-advert"
      v-if="imgAdvertEnabled && imgAdvertVisible && imgAdvertList.length"
    >
      <div class="c-pc-icon-advert__content__image">
        <img
          draggable="false"
          onselectstart="return false"
          :src="iconAdvert.advertImage"
          @click="handleAdvertClick"
        />
      </div>
      <div
        class="c-pc-icon-advert__content__close__box"
        v-if="imgCloseVisible"
      >
        <mobile-icon-close
          class="c-pc-icon-advert__content__close"
          @click="closeImgAdvert"
        />
      </div>
    </div>
    <pc-iframe-popup
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="720"
    />
  </div>
</template>

<script lang="ts" setup>
import { useAdvertStore } from '@/store/use-advert-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { MobileIconClose } from '@/components/component-icons/mobile/map';
import { useAdvert } from '@/hooks/business/use-advert';
import { convertIconAdvertItemToLinkData } from './hooks/utils';
import PcIframePopup from '@/components/common-base/iframe-popup/pc-iframe-popup.vue';

const advertStore = useAdvertStore();
const { closeImgAdvert } = advertStore;

const { imgAdvertEnabled, imgAdvertVisible, imgAdvertList, imgCloseVisible } =
  storeToRefs(advertStore);

const iconAdvert = computed(() => imgAdvertList.value[0]);

const { iframeVisible, iframeUrl, handleAdvertClick } = useAdvert({
  getLinkData: () => {
    if (!iconAdvert.value) return null;
    return convertIconAdvertItemToLinkData(iconAdvert.value);
  },
});
</script>

<style lang="scss">
.c-pc-img-advert {
  position: relative;
  z-index: 200;
  flex-shrink: 0;
  .c-pc-icon-advert__content__image {
    cursor: pointer;
    background-color: #d8d8d8;
    border-radius: 4px;
    img {
      width: 36px;
      height: 36px;
    }
  }
  .c-pc-icon-advert__content__close__box {
    position: absolute;
    top: -10px;
    right: -3px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    cursor: pointer;
    background-color: #98989888;
    border-radius: 50%;
    backdrop-filter: saturate(180%) blur(20px);

    .c-pc-icon-advert__content__close {
      margin-top: 1px;
      font-size: 12px !important;
      color: $--color-white;
    }
  }
}
</style>
