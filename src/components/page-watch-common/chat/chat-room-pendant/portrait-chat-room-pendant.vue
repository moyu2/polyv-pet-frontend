<!-- @file 竖屏端右下角挂件 -->
<template>
  <div class="c-portrait-chat-room-pendant">
    <template v-if="iarSdkLoaded && !notNeedIar">
      <template v-if="iarUIV1Loaded">
        <!-- 风险测评 -->
        <risk-evaluation-entrance
          v-if="riskEvaluationEntranceEnabled"
          class="c-portrait-chat-room-pendant__item"
        />

        <!-- 卡片推送 -->
        <portrait-push-card class="c-portrait-chat-room-pendant__item" />

        <!-- 红包 -->
        <mobile-redpack-pendant class="c-portrait-chat-room-pendant__item" />

        <!-- 报名抽奖 -->
        <mobile-enroll-lottery-pendant class="c-portrait-chat-room-pendant__item" />

        <!-- 话题 PK -->
        <mobile-topic-pk class="c-portrait-chat-room-pendant__item" />

        <!-- 抢答 -->
        <mobile-rush-answer class="c-portrait-chat-room-pendant__item" />
      </template>

      <!-- 微活动 -->
      <portrait-micro-activity-pendant
        v-if="microActivityEnabled"
        class="c-portrait-chat-room-pendant__item"
      />

      <!-- 邀请海报 -->
      <mobile-invite-poster-entry
        v-if="mobileChatInvitePendantVisible"
        class="c-portrait-chat-room-pendant__item"
      />

      <!-- 抽奖 -->
      <lottery-pendant-v2 class="c-portrait-chat-room-pendant__item" />

      <!-- 平台抽奖 -->
      <mobile-lucky-lottery-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 福袋 -->
      <lucky-bag-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 投票 -->
      <mobile-vote-pendant
        v-if="voteActiveMenuData.visible"
        class="c-portrait-chat-room-pendant__item"
      />

      <!-- 任务活动 -->
      <mobile-task-activity-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 优惠券 -->
      <mobile-coupon-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 情绪反馈 -->
      <mobile-emotional-feedback
        v-if="!likeFeatureEnabled && chatSetting.emotionalFeedbackEnabled && !isPlaybacking"
        class="c-portrait-chat-room-pendant__item"
      />
    </template>

    <!-- 滚动抽奖与竞技 PK 共用入口 -->
    <rolling-lottery-pendant
      v-if="liveActivityLoaded"
      class="c-portrait-chat-room-pendant__item"
    />

    <!-- 图标广告 -->
    <mobile-img-advert class="c-portrait-chat-room-pendant__item" />

    <!-- 产品设计的图标顺序，所以这里再多加了一个 v-if 处理 -->
    <template v-if="iarSdkLoaded">
      <!-- 举报/投诉反馈 -->
      <mobile-feedback-pendant
        v-if="feedbackPendantVisible"
        class="c-portrait-chat-room-pendant__item"
      />

      <!-- 商品库小卡片 -->
      <mobile-product-small-card class="c-portrait-chat-room-pendant__product-small-card" />
    </template>

    <lucky-bag-animation class="c-portrait-chat-room-pendant__lucky-bag-animation" />
    <rolling-lottery-animation
      v-if="liveActivityLoaded"
      class="c-portrait-chat-room-pendant__rolling-lottery-animation"
    />
  </div>
</template>

<script setup lang="ts">
import mobileImgAdvert from '@/components/page-watch-common/icon-advert/mobile-img-advert.vue';
import MobileCouponPendant from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/coupon-pendant.vue';
import LuckyBagPendant from '@/components/page-watch-common/interactive-receive-v2/lucky-bag/lucky-bag-pendant.vue';
import LuckyBagAnimation from '@/components/page-watch-common/interactive-receive-v2/lucky-bag/lucky-bag-animation.vue';
import MobileLuckyLotteryPendant from '@/components/page-watch-common/interactive-receive-v2/lucky-lottery/mobile-lucky-lottery-entrance.vue';
import MobileVotePendant from '@/components/page-watch-common/interactive-receive-v2/vote-v2/mobile-vote-pendant.vue';
import RollingLotteryAnimation from '@/components/page-watch-common/live-activity/rolling-lottery/rolling-lottery-animation.vue';
import RollingLotteryPendant from '@/components/page-watch-common/live-activity/rolling-lottery/rolling-lottery-pendant.vue';
import MobileEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import MobileFeedbackPendant from '@/components/page-watch-common/interactive-receive/feedback/mobile-feedback-pendant.vue';
import PortraitPushCard from '@/components/page-watch-common/interactive-receive/push-card/mobile-push-card.vue';
import MobileRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import { RiskEvaluationEntrance } from '@/components/page-watch-common/interactive-receive/risk-evaluation';
import MobileTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/mobile-topic-pk.vue';
import PortraitMicroActivityPendant from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity-pendant.vue';
import MobileProductSmallCard from '@/components/page-watch-common/product/product-small-card/mobile-product-small-card.vue';
import LotteryPendantV2 from '../../interactive-receive-v2/lottery-v2/lottery-pendant/lottery-pendant.vue';
import MobileRushAnswer from '../../interactive-receive/rush-answer/mobile-rush-answer.vue';
import MobileTaskActivityPendant from '../../task-activity/mobile-task-activity-pendant.vue';
import MobileEmotionalFeedback from '../chat-emotional-feedback/mobile-emotional-feedback.vue';
import MobileInvitePosterEntry from '@/components/page-watch-common/invite/mobile-invite-poster-entry/mobile-invite-poster-entry.vue';

import { useChatStore } from '@/store/use-chat-store';
import { useFinanceStore } from '@/store/use-finance-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useInviteStore } from '@/store/use-invite-store';

const { chatSetting, likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);
const { riskEvaluationEntranceEnabled } = storeDefinitionToRefs(useFinanceStore);
const { voteActiveMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { notNeedIar } = storeDefinitionToRefs(useWatchAppStore);

const { iarSdkLoaded, iarUIV1Loaded, feedbackPendantVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);
const { liveActivityLoaded } = storeDefinitionToRefs(useLiveActivityStore);

const { mobileChatInvitePendantVisible } = storeDefinitionToRefs(useInviteStore);

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { isPlaybacking } = storeDefinitionToRefs(usePlaybackStore);
</script>

<style lang="scss">
.c-portrait-chat-room-pendant {
  position: absolute;
  right: 16px;
  bottom: 6px;
  width: $pendant-size;
}

.c-portrait-chat-room-pendant__item + .c-portrait-chat-room-pendant__item {
  margin-top: 12px;
}

.c-portrait-chat-room-pendant__product-small-card {
  margin-bottom: 16px;
  transform: translateX(-70px);
}

.c-portrait-chat-room-pendant__lucky-bag-animation {
  position: absolute;
  right: -16px;
  bottom: 0;
  z-index: 300;
}

.c-portrait-chat-room-pendant__rolling-lottery-animation {
  position: absolute;
  right: -16px;
  bottom: 0;
  z-index: 300;
}
</style>
