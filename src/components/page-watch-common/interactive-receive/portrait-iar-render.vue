<!-- @file 竖屏端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-portrait-iar-render">
    <!--  举报/投诉反馈 -->
    <mobile-feedback-popup v-if="feedbackEnabled" />

    <!-- 红包弹窗 -->
    <mobile-redpack-popup />
    <!-- 红包雨组件 -->
    <mobile-redpack-rain />
    <!-- 积分红包记录弹层 -->
    <mobile-score-record-popup v-if="scoreRedpackEnabled" />
    <!-- 报名抽奖 -->
    <mobile-enroll-lottery-popup />
    <!-- 问答 -->
    <portrait-question-answer v-if="qaMenuData.visible" />
    <!-- 二维码分弹窗 -->
    <mobile-qr-code-share-dialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import MobileQrCodeShareDialog from '../../common-business/qrcode-share-dialog/mobile-qrcode-share-dialog.vue';
import MobileEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import MobileFeedbackPopup from './feedback/mobile-feedback-popup.vue';
import PortraitQuestionAnswer from './question-answer/portrait-question-answer.vue';
import MobileRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import MobileRedpackPopup from './redpack/mobile-redpack-popup.vue';
import MobileScoreRecordPopup from './score/mobile-score-record-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useRedpackStore } from '@/store/use-redpack-store';

const { feedbackEnabled } = storeDefinitionToRefs(useInteractReceiveStore);

const { scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-portrait-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-portrait-interact-receive.scss'
  );
});
</script>
