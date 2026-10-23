<template>
  <div class="c-portrait-iar-render-v2">
    <!-- 公告 -->
    <mobile-bulletin-popup v-if="announcementFunctionVisible" />

    <!-- 签到 -->
    <portrait-check-in-popup />

    <!-- 平台抽奖活动列表 -->
    <mobile-lucky-lottery-list-popup />

    <!-- 平台抽奖活动详情 -->
    <mobile-lucky-lottery-detail-popup />

    <!-- 平台抽奖中奖领取弹层 -->
    <mobile-lucky-lottery-receive-popup />

    <!-- 抽奖弹层 -->
    <mobile-lottery-dialog />

    <!-- 问卷 -->
    <questionnaire-dialog />

    <!-- 答题卡 -->
    <answer-card-dialog />

    <!-- 快速答题卡 -->
    <quick-answer-card />

    <!-- 投票列表弹层 -->
    <mobile-vote-list-popup />

    <!-- 投票规则说明弹层 -->
    <mobile-vote-rule-popup />

    <!-- 优惠券弹窗 -->
    <mobile-coupon-common-popup />
    <!-- 优惠券已领取弹窗 -->
    <mobile-coupon-user-popup />

    <!-- 福袋 -->
    <lucky-bag-render />
    <!-- 福袋领取弹层 -->
    <mobile-lucky-bag-receive-popup />
  </div>
</template>

<script setup lang="ts">
import MobileCouponCommonPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-common-popup.vue';
import MobileCouponUserPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-user-popup.vue';
import MobileBulletinPopup from '../interactive-receive-v2/bulletin-v2/bulletin-popup/mobile-bulletin-popup.vue';
import AnswerCardDialog from './answer-card-v2/answer-card-dialog/answer-card-dialog.vue';
import QuickAnswerCard from './answer-card-v2/quick-answer-card/quick-answer-card.vue';
import PortraitCheckInPopup from './check-in-v2/portrait-check-in-popup.vue';
import LuckyBagRender from './lucky-bag/lucky-bag-render.vue';
import MobileLuckyBagReceivePopup from './lucky-bag/mobile-lucky-bag-receive-popup.vue';
import MobileLotteryDialog from './lottery-v2/lottery-dialog/mobile-lottery-dialog.vue';
import MobileLuckyLotteryDetailPopup from './lucky-lottery/mobile-lucky-lottery-detail-popup.vue';
import MobileLuckyLotteryListPopup from './lucky-lottery/mobile-lucky-lottery-list-popup.vue';
import MobileLuckyLotteryReceivePopup from './lucky-lottery/mobile-lucky-lottery-receive-popup.vue';
import QuestionnaireDialog from './questionnaire-v2/questionnaire-dialog/questionnaire-dialog.vue';
import MobileVoteListPopup from './vote-v2/mobile-vote-list-popup.vue';
import MobileVoteRulePopup from './vote-v2/mobile-vote-rule-popup.vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
