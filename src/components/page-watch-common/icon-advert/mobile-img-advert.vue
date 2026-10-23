<!-- @file 移动端图标广告 -->
<template>
  <div>
    <div
      class="c-mobile-img-advert"
      v-if="imgAdvertEnabled && imgAdvertVisible && iconAdvert"
    >
      <div class="c-mobile-icon-advert__content__image">
        <img
          :src="iconAdvert.advertImage"
          @click="handleAdvertClick"
        />
        <div
          v-if="shouldShowWeixinBtn"
          ref="wxBtn"
          class="c-mobile-icon-advert__content__wx-btn"
          :style="{ 'z-index': hasWxJumpDom ? '99' : '-1' }"
        ></div>
      </div>
      <div
        class="c-mobile-icon-advert__content__close__box"
        v-if="imgCloseVisible"
      >
        <mobile-icon-close
          class="c-mobile-icon-advert__content__close"
          @click="closeImgAdvert"
        />
      </div>
    </div>

    <mobile-iframe-popup
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="460"
    />
  </div>
</template>

<script lang="ts" setup>
import { useAdvertStore } from '@/store/use-advert-store';
import { storeToRefs } from 'pinia';
import { computed, ref, nextTick, watch, onMounted } from 'vue';
import { useIconAdvert } from './hooks/use-icon-advert';
import { MobileIconClose } from '@/components/component-icons/mobile/map';
import { useAdvert } from '@/hooks/business/use-advert';
import { convertIconAdvertItemToLinkData } from './hooks/utils';
import MobileIframePopup from '@/components/common-base/iframe-popup/mobile-iframe-popup.vue';

const advertStore = useAdvertStore();
const { closeImgAdvert } = advertStore;

const { imgAdvertEnabled, imgAdvertVisible, imgAdvertList, imgCloseVisible } =
  storeToRefs(advertStore);

const iconAdvert = computed(() => (imgAdvertList.value.length > 0 ? imgAdvertList.value[0] : null));

const { init, hasWxJumpDom } = useIconAdvert();

const { iframeVisible, iframeUrl, isWeixinButton, handleAdvertClick } = useAdvert({
  getLinkData: () => {
    if (!iconAdvert.value) return null;
    return convertIconAdvertItemToLinkData(iconAdvert.value);
  },
});

const wxBtn = ref<HTMLElement | null>(null);
const shouldShowWeixinBtn = ref(false);

watch(
  () => [iconAdvert.value, wxBtn.value],
  () => {
    nextTick(() => {
      if (!iconAdvert.value) return;

      const { wxMiniprogramLink, wxMiniprogramOriginalId, wxMiniprogramAppId } = iconAdvert.value;
      const width = wxBtn.value?.clientWidth || 36;
      const height = wxBtn.value?.clientHeight || 36;
      init({
        wrapDom: wxBtn.value,
        wxMiniprogramAppId,
        wxMiniprogramLink,
        wxMiniprogramOriginalId,
        width,
        height,
      });
    });
  },
  { immediate: true },
);

onMounted(async () => {
  shouldShowWeixinBtn.value = await isWeixinButton();
});
</script>

<style lang="scss">
.c-mobile-img-advert {
  position: relative;
  z-index: 200;
  flex-shrink: 0;
  .c-mobile-icon-advert__content__wx-btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .c-mobile-icon-advert__content__image {
    cursor: pointer;
    border-radius: 4px;
    img {
      width: $pendant-size;
      height: $pendant-size;
    }
  }
  .c-mobile-icon-advert__content__close__box {
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

    .c-mobile-icon-advert__content__close {
      margin-top: 1px;
      font-size: 12px !important;
      color: $--color-white;
    }
  }
}
</style>
