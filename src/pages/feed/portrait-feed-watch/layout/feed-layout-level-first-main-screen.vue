<!-- @file 轮播屏：主屏 -->
<template>
  <div class="c-feed-layout-level-first-main-screen">
    <!-- 左上角定位内容 -->
    <boundary-wrap>
      <div class="c-feed-layout-level-first-main-screen__top-left">
        <div
          v-if="channelInfoSeat === 1"
          class="c-feed-layout-level-first-main-screen__top-left__item"
        >
          <mobile-feed-layout-back-btn
            v-if="!isWeixin"
            class="c-feed-layout-level-first-main-screen__top-left__item__children"
          />
          <!-- 频道信息 -->
          <portrait-channel-info-capsule />
        </div>
      </div>
    </boundary-wrap>

    <!-- 切换 feed 布局，进入 feed 流第二层入口 -->
    <mobile-feed-layout-switch-entrance
      class="c-feed-layout-level-first-main-screen__switchLayout-entrance"
    />

    <!-- 底部内容 -->
    <div class="c-feed-layout-level-first-main-screen__bottom">
      <div
        class="c-feed-layout-level-first-main-screen__channel-info c-feed-layout-level-first-main-screen__bottom__item--padding"
      >
        <capsule-live-status-tag :live-status="liveStatus" />

        <div class="c-feed-layout-level-first-main-screen__channel-info__title g-multiline">
          {{ channelTitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PortraitChannelInfoCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-channel-info-capsule.vue';
import BoundaryWrap from '@/pages/watch/portrait-watch/layout/boundary-wrap.vue';
import MobileFeedLayoutBackBtn from '@/components/page-feed-common/feed-layout-back-btn/mobile-feed-layout-back-btn.vue';
import CapsuleLiveStatusTag from '@/components/common-business/status-tag/capsule-live-status-tag.vue';
import MobileFeedLayoutSwitchEntrance from '@/components/page-feed-common/feed-layout-switch-entrance/mobile-feed-layout-switch-entrance.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { isWeixin } from '@/assets/utils/browser';

const { channelInfoSeat } = storeDefinitionToRefs(usePortraitLayoutStore);

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

const { channelTitle } = storeDefinitionToRefs(useChannelInfoStore);
</script>

<style lang="scss">
.c-feed-layout-level-first-main-screen__top-left__item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;

  &:empty {
    display: none;
  }
}
.c-feed-layout-level-first-main-screen__top-left__item__children {
  margin-right: 10px;
}

.c-feed-layout-level-first-main-screen__switchLayout-entrance {
  position: absolute;
  top: 70%;
  right: 0;
  left: 0;
  z-index: 1000;
  margin: auto;
}

.c-feed-layout-level-first-main-screen__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  padding-bottom: 16px;
  pointer-events: none;
  @include iphone-x-pb(16px);
}

.c-feed-layout-level-first-main-screen__bottom__item--padding {
  padding: 0 16px;
}

.c-feed-layout-level-first-main-screen__channel-info {
  padding-bottom: 16px;
}

.c-feed-layout-level-first-main-screen__channel-info__title {
  height: 40px;
  margin-top: 8px;
  font-size: 14px;
  line-height: normal;
  color: #fff;
}
</style>
