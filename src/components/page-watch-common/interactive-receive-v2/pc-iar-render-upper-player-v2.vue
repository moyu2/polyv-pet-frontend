<!-- @file PC 端互动功能接收端组件渲染入口 (显示位置位于播放器上层右侧) -->
<template>
  <div class="c-pc-iar-render-upper-player-v2">
    <!-- 快速答题卡 -->
    <quick-answer-card />

    <div class="c-pc-iar-render-upper-player-v2__right">
      <!-- 优惠券领取弹层 -->
      <pc-coupon-common-side-popup />

      <!-- 抽奖弹层 -->
      <pc-lottery-dialog />

      <!-- 平台抽奖列表弹层 -->
      <pc-lucky-lottery-list-popup />
      <!-- 平台抽奖详情弹层 -->
      <pc-lucky-lottery-detail-popup />
      <!-- 平台抽奖领取弹层 -->
      <pc-lucky-lottery-receive-popup />

      <!-- 投票规则说明弹层 -->
      <pc-vote-rule-popup />

      <!-- 公告弹层 -->
      <pc-bulletin-popup />

      <!-- 福袋 -->
      <lucky-bag-render />
      <!-- 福袋领取弹层 -->
      <pc-lucky-bag-receive-popup />
    </div>
  </div>
</template>

<script setup lang="ts">
import QuickAnswerCard from './answer-card-v2/quick-answer-card/quick-answer-card.vue';
import PcCouponCommonSidePopup from '../interactive-receive-v2/coupon-v2/pc-coupon-common-side-popup.vue';
import PcLotteryDialog from '@/components/page-watch-common/interactive-receive-v2/lottery-v2/lottery-dialog/pc-lottery-dialog.vue';
import PcLuckyLotteryListPopup from './lucky-lottery/pc/pc-lucky-lottery-list-popup.vue';
import PcLuckyLotteryDetailPopup from './lucky-lottery/pc/pc-lucky-lottery-detail-popup.vue';
import PcLuckyLotteryReceivePopup from './lucky-lottery/pc/pc-lucky-lottery-receive-popup.vue';
import PcVoteRulePopup from './vote-v2/pc/pc-vote-rule-popup.vue';
import PcBulletinPopup from './bulletin-v2/bulletin-popup/pc-bulletin-popup.vue';
import LuckyBagRender from './lucky-bag/lucky-bag-render.vue';
import PcLuckyBagReceivePopup from './lucky-bag/pc-lucky-bag-receive-popup.vue';
</script>

<style lang="scss">
.c-pc-iar-render-upper-player-v2 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-pc-iar-render-upper-player-v2__right {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  pointer-events: initial;
}
</style>
