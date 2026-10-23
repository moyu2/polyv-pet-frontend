<!-- @file 移动端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-mobile-iar-render">
    <!-- 反馈 -->
    <mobile-feedback-popup v-if="feedbackEnabled" />

    <!-- 红包弹窗 -->
    <mobile-redpack-popup />
    <!-- 红包雨组件 -->
    <mobile-redpack-rain />
    <!-- 积分红包记录弹层 -->
    <mobile-score-record-popup v-if="scoreRedpackEnabled" />
    <!-- 报名抽奖 -->
    <mobile-enroll-lottery-popup />
    <!-- 云席相关提示弹窗 -->
    <mobile-seat-table-tips
      v-if="seatTableVisible && isMeetingSeatTableTemplate && seatTableMenuData.visible"
    />
    <!-- 二维码分弹窗 -->
    <mobile-qr-code-share-dialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { $ } from '@polyv/utils/dom';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import MobileFeedbackPopup from './feedback/mobile-feedback-popup.vue';
import MobileRedpackPopup from './redpack/mobile-redpack-popup.vue';
import MobileRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import MobileScoreRecordPopup from './score/mobile-score-record-popup.vue';
import MobileEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import MobileSeatTableTips from './seat-table/seat-table-tips/mobile-seat-table-tips.vue';
import MobileQrCodeShareDialog from '../../common-business/qrcode-share-dialog/mobile-qrcode-share-dialog.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const {
  isIarFullScreen,

  seatTableVisible,
  isMeetingSeatTableTemplate,

  feedbackEnabled,
} = storeDefinitionToRefs(useInteractReceiveStore);

const { scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { seatTableMenuData } = storeDefinitionToRefs(useChannelMenuStore);

watch(
  () => isIarFullScreen.value,
  () => {
    if (isIarFullScreen.value) {
      $(document.documentElement).addClass('plv-mobile-watch-iar--fullscreen');
    } else {
      $(document.documentElement).removeClass('plv-mobile-watch-iar--fullscreen');
    }
  },
);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-mobile-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-mobile-interact-receive.scss'
  );
});
</script>
