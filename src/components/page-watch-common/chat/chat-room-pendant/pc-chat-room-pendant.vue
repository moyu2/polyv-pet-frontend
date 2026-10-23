<!-- @file PC 端聊天室右下角挂件 -->
<template>
  <div class="c-pc-chat-room-pendant">
    <template v-if="iarSdkLoaded && !notNeedIar">
      <template v-if="iarUIV1Loaded">
        <!-- 风险测评 -->
        <risk-evaluation-entrance
          v-if="riskEvaluationEntranceEnabled"
          class="c-pc-chat-room-pendant__item"
        />

        <!-- 卡片推送 -->
        <pc-push-card class="c-pc-chat-room-pendant__item" />

        <!-- 红包 -->
        <pc-redpack-pendant class="c-pc-chat-room-pendant__item" />

        <!-- 报名抽奖 -->
        <pc-enroll-lottery-pendant class="c-pc-chat-room-pendant__item" />

        <!-- 话题 PK -->
        <pc-topic-pk class="c-pc-chat-room-pendant__item" />

        <!-- 抢答 -->
        <pc-rush-answer class="c-pc-chat-room-pendant__item" />
      </template>

      <!-- 抽奖 -->
      <lottery-pendant-v2 class="c-pc-chat-room-pendant__item" />

      <!-- 优惠券 -->
      <pc-coupon-pendant class="c-pc-chat-room-pendant__item" />

      <!-- 情绪反馈 -->
      <pc-emotional-feedback
        v-if="!likeFeatureEnabled && chatSetting.emotionalFeedbackEnabled"
        class="c-pc-chat-room-pendant__item"
      />

      <!-- 平台抽奖 -->
      <pc-lucky-lottery-pendant class="c-pc-chat-room-pendant__item" />

      <!-- 福袋 -->
      <lucky-bag-pendant class="c-pc-chat-room-pendant__item" />
    </template>

    <!-- 滚动抽奖与竞技 PK 共用入口 -->
    <rolling-lottery-pendant
      v-if="liveActivityLoaded"
      class="c-pc-chat-room-pendant__item"
    />

    <!-- 图标广告 -->
    <pc-img-advert class="c-pc-chat-room-pendant__item" />

    <template v-if="!isPlaybackWatchUrl">
      <!-- 点赞 -->
      <chat-loader-helper v-if="likeFeatureEnabled">
        <pc-chat-like
          class="c-pc-chat-room-pendant__item"
          :upper-has-icon="hasOtherPendant"
        />
      </chat-loader-helper>
    </template>

    <lucky-bag-animation class="c-pc-chat-room-pendant__lucky-bag-animation" />
    <rolling-lottery-animation
      v-if="liveActivityLoaded"
      class="c-pc-chat-room-pendant__rolling-lottery-animation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';

import PcCouponPendant from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/coupon-pendant.vue';
import LuckyBagPendant from '@/components/page-watch-common/interactive-receive-v2/lucky-bag/lucky-bag-pendant.vue';
import LuckyBagAnimation from '@/components/page-watch-common/interactive-receive-v2/lucky-bag/lucky-bag-animation.vue';
import PcLuckyLotteryPendant from '@/components/page-watch-common/interactive-receive-v2/lucky-lottery/pc/pc-lucky-lottery-pendant.vue';
import RollingLotteryAnimation from '@/components/page-watch-common/live-activity/rolling-lottery/rolling-lottery-animation.vue';
import RollingLotteryPendant from '@/components/page-watch-common/live-activity/rolling-lottery/rolling-lottery-pendant.vue';
import PcEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import PcPushCard from '@/components/page-watch-common/interactive-receive/push-card/pc-push-card.vue';
import PcRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import PcTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/pc-topic-pk.vue';
import LotteryPendantV2 from '../../interactive-receive-v2/lottery-v2/lottery-pendant/lottery-pendant.vue';
import PcRushAnswer from '../../interactive-receive/rush-answer/pc-rush-answer.vue';
import PcEmotionalFeedback from '../chat-emotional-feedback/pc-emotional-feedback.vue';

import PcImgAdvert from '@/components/page-watch-common/icon-advert/pc-img-advert.vue';
import { RiskEvaluationEntrance } from '@/components/page-watch-common/interactive-receive/risk-evaluation';
import PcChatLike from '@/components/page-watch-common/chat-v2/chat-like/index.vue';
import { ChatLoaderHelper } from '../../chat-v2/chat-loader-helper';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useFinanceStore } from '@/store/use-finance-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { notNeedIar, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);
const { chatSetting, likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);
const { riskEvaluationEntranceEnabled } = storeDefinitionToRefs(useFinanceStore);

const {
  iarSdkLoaded,
  iarUIV1Loaded,

  pushCardPendantVisible,
  redpackPendantVisible,
  enrollLotteryPendantVisible,
  welfareLotteryPendantVisible,
  lotteryPendantVisible,
  rushAnswerPendantVisible,
  couponPendantVisible,
} = storeDefinitionToRefs(useInteractReceiveStore);
const { liveActivityLoaded } = storeDefinitionToRefs(useLiveActivityStore);

/** 点赞上方是否有其他挂件 */
const hasOtherPendant = computed<boolean>(() => {
  return (
    unref(pushCardPendantVisible) ||
    unref(redpackPendantVisible) ||
    unref(enrollLotteryPendantVisible) ||
    unref(lotteryPendantVisible) ||
    unref(welfareLotteryPendantVisible) ||
    unref(rushAnswerPendantVisible) ||
    unref(couponPendantVisible)
  );
});
</script>

<style lang="scss">
.c-pc-chat-room-pendant {
  position: absolute;
  right: 12px;
  bottom: 21px;
  z-index: $--zIndex-pendant;
  width: $pendant-size;
}

.c-pc-chat-room-pendant__item:empty {
  display: none;
}

.c-pc-chat-room-pendant__item + .c-pc-chat-room-pendant__item {
  margin-top: 12px;
}

.c-pc-chat-room-pendant__lucky-bag-animation {
  position: absolute;
  right: -12px;
  bottom: 0;
  z-index: 300;
}

.c-pc-chat-room-pendant__rolling-lottery-animation {
  position: absolute;
  right: -12px;
  bottom: 0;
  z-index: 300;
}
</style>
