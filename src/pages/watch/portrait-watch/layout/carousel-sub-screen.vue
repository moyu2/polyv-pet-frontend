<!-- @file 轮播屏：副屏 -->
<template>
  <div class="c-portrait-carousel-sub-screen">
    <boundary-wrap>
      <div class="c-portrait-carousel-sub-screen__top-left">
        <div
          v-if="channelInfoSeat === 0"
          class="c-portrait-carousel-sub-screen__top-left__item"
        >
          <!-- 频道信息 -->
          <portrait-channel-info-capsule />
        </div>
      </div>
    </boundary-wrap>
  </div>
</template>

<script setup lang="ts">
import PortraitChannelInfoCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-channel-info-capsule.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import BoundaryWrap from './boundary-wrap.vue';

const { channelInfoSeat } = storeDefinitionToRefs(usePortraitLayoutStore);
</script>
