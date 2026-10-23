<!-- @file 移动端布局倒计时层 -->
<template>
  <!-- 会议模式下没有播放器区域，倒计时改由顶部的 mobile-live-count-down-bar 展示 -->
  <div
    v-if="showLiveCountDown && !meetingMode"
    class="c-mobile-count-down-layout pws-normal-button-primary--config-wrapper"
    :class="{
      'c-mobile-count-down-layout--top-right': isTopRightStyle,
    }"
  >
    <div class="c-mobile-count-down-layout__content pws-count-down-layout">
      <!-- 背景层：底层为高斯模糊的直播封面图，顶层为 20% 黑色遮罩 -->
      <div
        v-if="!isTopRightStyle"
        class="c-mobile-count-down-layout__bg"
      >
        <div class="c-mobile-count-down-layout__bg-img">
          <channel-splash-img :show-title="false" />
        </div>
      </div>

      <!-- 直播开始文案 -->
      <div class="c-mobile-count-down-layout__time-text">
        {{ $lang('watch.liveTime') }}：{{ liveStartTimeText }}
      </div>

      <div
        v-if="isTopRightStyle"
        class="c-mobile-count-down-layout__title"
      >
        {{ $lang('liveCountDown.text') }}
      </div>

      <!-- 倒计时 -->
      <mobile-live-count-down
        class="c-mobile-count-down-layout__count-down"
        :theme="isTopRightStyle ? 'text' : 'square'"
      />

      <!-- 直播预约按钮 -->
      <mobile-live-booking-button
        v-if="showLiveBookingButton"
        class="c-mobile-count-down-layout__live-booking"
        :button-position="isTopRightStyle ? 'corner' : 'player'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobileLiveCountDown from '@/components/common-business/live-count-down/mobile-live-count-down.vue';
import MobileLiveBookingButton from '@/components/common-business/live-booking/mobile-live-booking-button.vue';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useCountDownLayer } from './use-count-down-layer';

const { showLiveCountDown, liveStartTimeText } = storeDefinitionToRefs(useChannelInfoStore);

const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);

const { meetingMode } = storeDefinitionToRefs(useWatchAppStore);

const { isTopRightStyle } = useCountDownLayer();
</script>

<style lang="scss">
.c-mobile-count-down-layout {
  height: 100%;
  pointer-events: initial;
}
.c-mobile-count-down-layout__content {
  position: relative;
  z-index: 0; // 建立层叠上下文，让背景层能垫在内容下方
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #2b2c35;
  background-image: linear-gradient(225deg, #2b2c35 0%, rgba(255, 255, 255, 0.1) 100%);
}

.c-mobile-count-down-layout__bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 底层直播封面图，放大以避免模糊后边缘露出底色
.c-mobile-count-down-layout__bg-img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  filter: blur(100px);
  transform: translate(-50%, -50%);
}

// 顶层 20% 黑色遮罩，不参与模糊
.c-mobile-count-down-layout__bg::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: '';
  background: rgba(0, 0, 0, 0.2);
}

.c-mobile-count-down-layout__time-text {
  margin-bottom: 8px;
  font-size: 12px;
  color: #e4e4e4;
}

.c-mobile-count-down-layout__live-booking {
  margin-top: 16px;
}

.c-mobile-count-down-layout--top-right {
  pointer-events: none;

  .c-mobile-count-down-layout__time-text {
    display: none;
  }

  .c-mobile-count-down-layout__title {
    margin-right: 5px;
    font-size: 14px;
    line-height: 21px;
    color: #fff;
  }

  .c-mobile-count-down-layout__content {
    position: absolute;
    top: 8px;
    right: 8px;
    flex-direction: row;
    align-items: center;
    width: initial;
    height: initial;
    padding: 6px 12px;
    pointer-events: initial;
    background: rgba(0, 0, 0, 0.7);
    background-image: none;
    border-radius: 32px;
  }

  .c-mobile-count-down-layout__live-booking {
    margin-top: 0;
    margin-right: -6px;
    margin-left: 6px;
  }
}
</style>
