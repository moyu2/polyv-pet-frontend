<!-- @file 移动端横屏-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-mobile-watch-layout-lazyload">
    <!-- 互动功能 -->
    <mobile-iar-render v-if="iarSdkLoaded && iarUIV1Loaded" />
    <mobile-iar-render-v2 v-if="iarSdkLoaded && !notNeedIar" />
    <mobile-live-activity-render v-if="liveActivityLoaded" />
    <mobile-product-render v-if="iarSdkLoaded && !isPlaybackWatchUrl" />

    <!-- 连麦挂件 -->
    <mobile-connect-mic-pendant
      v-if="connectMicPendantRenderEnabled && !isConnectMicUIV2"
      v-show="connectMicPendantVisible"
    />
    <mobile-connect-mic-pendant-v2
      v-if="connectMicPendantRenderEnabled && isConnectMicUIV2"
      v-show="connectMicPendantVisible"
    />

    <!-- 常驻挂件 -->
    <mobile-watch-pendant />

    <!-- 直播开始提示 -->
    <mobile-live-start-tips />

    <!--  取消关联转播提示 -->
    <mobile-transmit-switch-tip />

    <!-- 设置昵称 -->
    <mobile-chat-set-nick v-if="canSetNick" />

    <!-- 文件管理 -->
    <chat-loader-helper>
      <chat-v2-file-share-list />
    </chat-loader-helper>

    <!-- 切换语言弹层 -->
    <mobile-lang-switch v-if="langSwitchEnabled" />

    <!-- 发送红包弹层 -->
    <mobile-send-redpack v-if="sendRedpackVisible" />

    <!-- 提现申请弹层 -->
    <mobile-withdraw-apply v-if="withdrawVisible" />

    <!-- 提现详情弹层 -->
    <mobile-withdraw-detail v-if="withdrawVisible" />

    <!-- 聊天消息全文弹层 -->
    <mobile-chat-full-message v-if="!isChatUIV2" />

    <!-- 更多弹层 -->
    <mobile-more-popup />

    <!-- 打赏弹层 -->
    <mobile-donate-popup v-if="showDonateFunction" />

    <!-- 实名认证弹层 -->
    <mobile-real-name-auth-popup />

    <!-- 邀请明细弹层 -->
    <mobile-invite-detail-popup v-if="inviteDetailEnabled" />

    <template v-if="inviteActivityEnabled">
      <!-- 邀请有礼活动详情弹窗 -->
      <mobile-invite-activity-detail-popup />
      <!-- 邀请有礼中奖领取弹窗 -->
      <mobile-invite-prize-receive-popup v-if="iarSdkLoaded" />
    </template>

    <!-- 固定的聊天消息输入框 -->
    <template v-if="chatInputControllerEnable">
      <!-- 聊天消息输入框弹层 -->
      <template v-if="isChatUIV2">
        <chat-loader-helper>
          <mobile-chat-message-input-popup />
        </chat-loader-helper>
        <chat-loader-helper>
          <mobile-ask-message-input-popup />
        </chat-loader-helper>
      </template>
      <!-- 仅云席开启后可用 -->
      <mobile-chat-input-controller-fixed v-else-if="interactSetting.seatTableEnabled" />
    </template>

    <!-- 绑定用户身份信息弹层 -->
    <mobile-identity-collect-info-dialog v-if="bindMobileVisible" />

    <!-- 任务奖励领取弹层 -->
    <mobile-task-reward-receive-popup v-if="iarSdkLoaded && !notNeedIar" />

    <!-- 任务完成弹层 -->
    <mobile-task-activity-finish-dialog />

    <!-- 在线用户列表规则弹层 -->
    <mobile-member-list-rule-popup />

    <!-- 播放设置弹层 -->
    <mobile-playback-setting />

    <!-- 我的奖励弹层 -->
    <mobile-personal-reward-popup
      v-if="(iarSdkLoaded && !notNeedIar) || liveActivityRewardEntranceVisible"
    />

    <!-- 观看/学习时长统计弹层 -->
    <mobile-learning-stat-dialog v-if="learningStatsDialogEnabled" />

    <!-- 学习详情弹层 -->
    <mobile-learning-detail-popup v-if="learningStatsEnabled" />

    <!-- 播放器设置弹层 -->
    <portrait-player-control-popup />

    <!-- AI 答题卡 -->
    <ai-question-card v-if="aiKnowledgeQuizEnabled" />

    <!-- 主讲详情弹层 -->
    <anchor-popup />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import MobileIdentityCollectInfoDialog from '@/components/common-business/watch-identity/identity-collect-info-dialog/mobile-identity-collect-info-dialog.vue';
import MobileLangSwitch from '@/components/common-business/lang-switch/mobile-lang-switch.vue';
import MobileChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/mobile-chat-full-message.vue';
import MobileChatInputControllerFixed from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller-fixed/mobile-chat-input-controller-fixed.vue';
import MobileChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/mobile-chat-set-nick.vue';
import MobileConnectMicPendant from '@/components/page-watch-common/connect-mic/mobile-connect-mic/mobile-connect-mic-pendant.vue';
import MobileConnectMicPendantV2 from '@/components/page-watch-common/connect-mic/mobile-connect-mic-v2/mobile-connect-mic-pendant-v2.vue';
import MobileDonatePopup from '@/components/page-watch-common/donate/donate-panel/mobile-donate-panel/mobile-donate-popup.vue';
import MobileIarRenderV2 from '@/components/page-watch-common/interactive-receive-v2/mobile-iar-render-v2.vue';
import MobileIarRender from '@/components/page-watch-common/interactive-receive/mobile-iar-render.vue';
import MobileLiveActivityRender from '@/components/page-watch-common/live-activity/mobile-live-activity-render.vue';
import MobileInviteActivityDetailPopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-activity-detail-popup/mobile-invite-activity-detail-popup.vue';
import MobileInvitePrizeReceivePopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-prize-receive-popup/mobile-invite-prize-receive-popup.vue';
import MobileInviteDetailPopup from '@/components/page-watch-common/invite/mobile-invite-detail/mobile-invite-detail-popup.vue';
import MobileLiveStartTips from '@/components/page-watch-common/live-start-tips/mobile-live-start-tips.vue';
import MobileMorePopup from '@/components/page-watch-common/more-popup/mobile-more-popup/mobile-more-popup.vue';
import MobileProductRender from '@/components/page-watch-common/product/mobile-product-render.vue';
import MobileRealNameAuthPopup from '@/components/page-watch-common/real-name-auth/mobile-real-name-auth.vue';
import MobileTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/mobile-transmit-switch-tip.vue';
import MobileWatchPendant from './mobile-watch-pendant.vue';
import AiQuestionCard from '@/components/page-watch-common/polyv-ai/ai-question/ai-question-card.vue';
import AnchorPopup from '@/components/page-watch-common/anchor/anchor-popup/anchor-popup.vue';

import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import MobileChatMessageInputPopup from '@/components/page-watch-common/chat-v2/message-input/mobile-chat-message-input-popup.vue';
import MobileAskMessageInputPopup from '@/components/page-watch-common/ask-v2/mobile-ask-message-input-popup.vue';
import ChatV2FileShareList from '@/components/page-watch-common/chat-v2/file-share-list/index.vue';

import MobileLearningDetailPopup from '@/components/page-watch-common/learning-detail/mobile-learning-detail-popup.vue';
import MobileLearningStatDialog from '@/components/page-watch-common/learning-stat-dialog/mobile-learning-stat-dialog.vue';
import MobileMemberListRulePopup from '@/components/page-watch-common/member-list/member-list-rule.vue';
import MobilePersonalRewardPopup from '@/components/page-watch-common/personal-reward/mobile-personal-reward-popup.vue';
import MobilePlaybackSetting from '@/components/page-watch-common/player/player-control/mobile-player-control/mobile-playback-setting.vue';
import PortraitPlayerControlPopup from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-control-popup.vue';
import MobileTaskActivityFinishDialog from '@/components/page-watch-common/task-activity/mobile-task-activity-finish.vue';
import MobileTaskRewardReceivePopup from '@/components/page-watch-common/task-activity/mobile-task-reward-receive.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';

import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useLangStore } from '@/store/use-lang-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';

const MobileSendRedpack = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-send-pack" */ '@/components/page-watch-common/send-redpack/mobile-send-redpack.vue'
    ),
);
const MobileWithdrawApply = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-withdraw-apply" */ '@/components/page-watch-common/withdraw/mobile-withdraw-apply/mobile-withdraw-apply.vue'
    ),
);
const MobileWithdrawDetail = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "mobile-withdraw-detail" */ '@/components/page-watch-common/withdraw/mobile-withdraw-detail/mobile-withdraw-detail.vue'
    ),
);

const { connectMicPendantRenderEnabled, connectMicPendantVisible, isConnectMicUIV2 } =
  storeDefinitionToRefs(useConnectMicStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { sendRedpackVisible } = storeDefinitionToRefs(useRedpackStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { inviteDetailEnabled, inviteActivityEnabled } = storeDefinitionToRefs(useInviteStore);

const { chatInputControllerEnable, isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { iarSdkLoaded, iarUIV1Loaded, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { learningStatsEnabled, learningStatsDialogEnabled } =
  storeDefinitionToRefs(useChannelInfoStore);

const { aiKnowledgeQuizEnabled } = storeDefinitionToRefs(usePlaybackStore);

const { notNeedIar, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { liveActivityLoaded, liveActivityRewardEntranceVisible } =
  storeDefinitionToRefs(useLiveActivityStore);
</script>
