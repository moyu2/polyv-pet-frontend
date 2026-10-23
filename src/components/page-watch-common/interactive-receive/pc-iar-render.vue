<!-- @file PC 端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-pc-iar-render">
    <!-- 反馈 -->
    <pc-feedback-dialog v-if="feedbackEnabled" />

    <!-- 红包弹窗 -->
    <pc-redpack-dialog />
    <!-- 红包雨组件 -->
    <pc-redpack-rain />
    <!-- 报名抽奖 -->
    <pc-enroll-lottery-dialog />
    <!-- 二维码分弹窗 -->
    <pc-qr-code-share-dialog />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { onMounted } from 'vue';
import PcQrCodeShareDialog from '../../common-business/qrcode-share-dialog/pc-qrcode-share-dialog.vue';
import PcEnrollLotteryDialog from './enroll-lottery/pc-enroll-lottery-dialog.vue';
import PcFeedbackDialog from './feedback/pc-feedback-dialog.vue';
import PcRedpackRain from './redpack-rain/pc-redpack-rain.vue';
import PcRedpackDialog from './redpack/pc-redpack-dialog.vue';

const { feedbackEnabled } = storeDefinitionToRefs(useInteractReceiveStore);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-pc-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-pc-interact-receive.scss'
  );
});
</script>
