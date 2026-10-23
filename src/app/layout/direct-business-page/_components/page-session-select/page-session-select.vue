<template>
  <div
    class="c-page-session-select"
    ref="scrollRef"
  >
    <div class="c-page-session-select__content">
      <channel-splash-img
        base-info-visible
        blur-background-enabled
        :style="splashImageStyle"
      />
      <session-select :get-scroll-ref="getScrollRef" />
      <mobile-page-footer
        :content-style="{
          color: '#333 !important',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageSizeSetup } from '@/app/layout/main-enter/_hooks/use-main-enter';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';
import SessionSelect from '@/components/common-business/session-select/session-select.vue';
import { usePageStore } from '@/store/use-page-store';
import { storeToRefs } from 'pinia';
import { CSSProperties, computed, ref } from 'vue';

const scrollRef = ref<HTMLElement>();

function getScrollRef() {
  return scrollRef;
}

const { pageClientWidth, pageClientHeight } = storeToRefs(usePageStore());

const splashImageStyle = computed<CSSProperties>(() => {
  return {
    height: `${pageClientWidth.value * 0.5625}px`,
    maxHeight: `${pageClientHeight.value * 0.5}px`,
  };
});

usePageSizeSetup();
</script>

<style lang="scss">
.c-page-session-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f5f6;
}

.c-page-session-select__content {
  width: 100%;
  max-width: 1024px;
  height: 100%;
  background-color: #f5f5f6;
  @include iphone-x-pb(20px);
}
</style>
