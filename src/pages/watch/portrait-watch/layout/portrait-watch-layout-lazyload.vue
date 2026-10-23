<!-- @file 移动端竖屏-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-portrait-watch-layout-lazyload">
    <!-- 连麦挂件 -->
    <portrait-connect-mic-pendant
      v-if="connectMicPendantRenderEnabled && !isConnectMicUIV2"
      v-show="connectMicPendantVisible"
    />
    <mobile-connect-mic-pendant-v2
      v-if="connectMicPendantRenderEnabled && isConnectMicUIV2"
      v-show="connectMicPendantVisible"
    />

    <!-- 互动功能 -->
    <portrait-iar-render v-if="iarSdkLoaded && iarUIV1Loaded" />
    <portrait-iar-render-v2 v-if="iarSdkLoaded && !notNeedIar" />
    <mobile-live-activity-render v-if="liveActivityLoaded" />
    <portrait-product-render v-if="iarSdkLoaded && !isPlaybackWatchUrl" />

    <!-- 邀请榜弹层 -->
    <portrait-invite-rank-popup v-if="inviteRankEnabled" />

    <!-- 打赏弹层 -->
    <mobile-donate-popup v-if="showDonateFunction" />

    <!-- 提现申请弹层 -->
    <mobile-withdraw-apply v-if="withdrawVisible" />

    <!-- 提现详情弹层 -->
    <mobile-withdraw-detail v-if="withdrawVisible" />

    <!-- 切换语言弹层 -->
    <mobile-lang-switch v-if="langSwitchEnabled" />

    <!-- 微活动弹层 -->
    <portrait-micro-activity v-if="microActivityEnabled" />

    <!-- 设置昵称 -->
    <portrait-chat-set-nick v-if="canSetNick" />

    <!-- 聊天室消息输入框 -->
    <portrait-chat-input-controller v-if="chatInputControllerEnable" />

    <!-- 聊天消息全文弹层 -->
    <portrait-chat-full-message v-if="!isChatUIV2" />

    <!-- 播放器设置弹层 -->
    <portrait-player-control-popup />

    <!-- 流多轨切换 -->
    <portrait-player-stream-track-popup v-if="supportMultiStreamTrack" />

    <!-- 直播开始提示 -->
    <mobile-live-start-tips />

    <!--  取消关联转播提示 -->
    <mobile-transmit-switch-tip />

    <!-- 回放 + 章节弹层 -->
    <portrait-playback-chapter-popup
      v-if="isPlaybacking && (playbackListVisible || chapterVisible)"
    />

    <!-- 实名认证弹层 -->
    <mobile-real-name-auth-popup />

    <!-- 邀请明细弹层 -->
    <portrait-invite-detail-popup v-if="inviteDetailEnabled" />

    <template v-if="inviteActivityEnabled">
      <!-- 邀请有礼活动详情弹窗 -->
      <mobile-invite-activity-detail-popup />
      <!-- 邀请有礼中奖领取弹窗 -->
      <mobile-invite-prize-receive-popup v-if="iarSdkLoaded" />
    </template>

    <!-- 绑定用户身份信息弹层 -->
    <mobile-identity-collect-info-dialog v-if="bindMobileVisible" />

    <!-- 任务奖励领取弹层 -->
    <mobile-task-reward-receive-popup v-if="iarSdkLoaded && !notNeedIar" />

    <!-- 任务完成弹层 -->
    <mobile-task-activity-finish-dialog />

    <!-- 在线用户列表弹层 -->
    <!-- <portrait-member-list-popup /> -->
    <chat-loader-helper>
      <mobile-member-list-popup-v2 />
    </chat-loader-helper>

    <!-- 在线用户列表规则弹层 -->
    <mobile-member-list-rule-popup />

    <!-- 播放设置弹层 -->
    <portrait-player-playback-setting />

    <!-- 多会场弹层 -->
    <portrait-multi-meeting-popup v-if="multiMeetingEnabled" />

    <!-- 我的奖励弹层 -->
    <mobile-personal-reward-popup
      v-if="(iarSdkLoaded && !notNeedIar) || liveActivityRewardEntranceVisible"
    />

    <!-- 文件管理 -->
    <chat-loader-helper>
      <chat-v2-file-share-list />
    </chat-loader-helper>

    <!-- 观看/学习时长统计弹层 -->
    <mobile-learning-stat-dialog v-if="learningStatsDialogEnabled" />

    <!-- 学习详情弹层 -->
    <mobile-learning-detail-popup v-if="learningStatsEnabled" />

    <!-- 更多弹层 -->
    <mobile-more-panel-popup />

    <!-- 聊天消息输入框弹层 -->
    <template v-if="isChatUIV2">
      <chat-loader-helper>
        <mobile-chat-message-input-popup />
      </chat-loader-helper>
      <chat-loader-helper>
        <mobile-ask-message-input-popup />
      </chat-loader-helper>
    </template>

    <!-- 主讲详情 -->
    <anchor-popup />

    <!-- 提问弹层 -->
    <chat-loader-helper v-if="isChatUIV2">
      <mobile-ask-popup />
    </chat-loader-helper>
  </div>
</template>

<script setup lang="ts">
import MobileLangSwitch from '@/components/common-business/lang-switch/mobile-lang-switch.vue';
import PortraitChatInputController from '@/components/page-watch-common/chat/chat-input-controller/portrait-chat-input-controller/portrait-chat-input-controller.vue';
import PortraitChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/mobile-chat-set-nick.vue';
import MobileDonatePopup from '@/components/page-watch-common/donate/donate-panel/mobile-donate-panel/mobile-donate-popup.vue';
import PortraitIarRender from '@/components/page-watch-common/interactive-receive/portrait-iar-render.vue';
import PortraitIarRenderV2 from '@/components/page-watch-common/interactive-receive-v2/portrait-iar-render-v2.vue';
import MobileLiveActivityRender from '@/components/page-watch-common/live-activity/mobile-live-activity-render.vue';
import PortraitProductRender from '@/components/page-watch-common/product/portrait-product-render.vue';
import PortraitInviteRankPopup from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank.vue';
import MobileLiveStartTips from '@/components/page-watch-common/live-start-tips/mobile-live-start-tips.vue';
import MobileTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/mobile-transmit-switch-tip.vue';
import PortraitMicroActivity from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity.vue';
import MobileWithdrawApply from '@/components/page-watch-common/withdraw/mobile-withdraw-apply/mobile-withdraw-apply.vue';
import MobileWithdrawDetail from '@/components/page-watch-common/withdraw/mobile-withdraw-detail/mobile-withdraw-detail.vue';
import PortraitPlaybackChapterPopup from '@/pages/watch/portrait-watch/components/playback-chapter-popup/portrait-playback-chapter-popup.vue';
import MobileRealNameAuthPopup from '@/components/page-watch-common/real-name-auth/mobile-real-name-auth.vue';
import MobileIdentityCollectInfoDialog from '@/components/common-business/watch-identity/identity-collect-info-dialog/mobile-identity-collect-info-dialog.vue';
import MobileMorePanelPopup from '@/components/page-watch-common/more-popup/mobile-more-popup/mobile-more-popup.vue';
import MobileAskPopup from '@/components/page-watch-common/ask-v2/mobile-ask-popup.vue';

import PortraitChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/portrait-chat-full-message.vue';
import PortraitConnectMicPendant from '@/components/page-watch-common/connect-mic/portrait-connect-mic/portrait-connect-mic-pendant.vue';
import MobileConnectMicPendantV2 from '@/components/page-watch-common/connect-mic/mobile-connect-mic-v2/mobile-connect-mic-pendant-v2.vue';
import PortraitPlayerControlPopup from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-player-control-popup.vue';
import PortraitPlayerStreamTrackPopup from '@/components/page-watch-common/player/player-stream-track/portrait-player-stream-track-popup.vue';
import PortraitInviteDetailPopup from '@/components/page-watch-common/invite/mobile-invite-detail/mobile-invite-detail-popup.vue';
import MobileInviteActivityDetailPopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-activity-detail-popup/mobile-invite-activity-detail-popup.vue';
import MobileInvitePrizeReceivePopup from '@/components/page-watch-common/invite/mobile-invite-activity/mobile-invite-prize-receive-popup/mobile-invite-prize-receive-popup.vue';
import MobileTaskRewardReceivePopup from '@/components/page-watch-common/task-activity/mobile-task-reward-receive.vue';
import MobileTaskActivityFinishDialog from '@/components/page-watch-common/task-activity/mobile-task-activity-finish.vue';
import MobileMemberListRulePopup from '@/components/page-watch-common/member-list/member-list-rule.vue';
import portraitPlayerPlaybackSetting from '@/components/page-watch-common/player/player-control/portrait-player-control/portrait-playback-setting.vue';
import PortraitMultiMeetingPopup from '@/components/page-watch-common/multi-meeting/portrait-multi-meeting/portrait-multi-meeting-popup.vue';
import MobilePersonalRewardPopup from '@/components/page-watch-common/personal-reward/mobile-personal-reward-popup.vue';
import MobileLearningStatDialog from '@/components/page-watch-common/learning-stat-dialog/mobile-learning-stat-dialog.vue';
import MobileLearningDetailPopup from '@/components/page-watch-common/learning-detail/mobile-learning-detail-popup.vue';
import AnchorPopup from '@/components/page-watch-common/anchor/anchor-popup/anchor-popup.vue';

import MobileChatMessageInputPopup from '@/components/page-watch-common/chat-v2/message-input/mobile-chat-message-input-popup.vue';
import MobileAskMessageInputPopup from '@/components/page-watch-common/ask-v2/mobile-ask-message-input-popup.vue';
import MobileMemberListPopupV2 from '@/components/page-watch-common/member-list/member-popup-v2.vue';
import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import ChatV2FileShareList from '@/components/page-watch-common/chat-v2/file-share-list/index.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useLangStore } from '@/store/use-lang-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';

const { chatInputControllerEnable, isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { inviteRankEnabled, inviteDetailEnabled, inviteActivityEnabled } =
  storeDefinitionToRefs(useInviteStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { connectMicPendantRenderEnabled, connectMicPendantVisible, isConnectMicUIV2 } =
  storeDefinitionToRefs(useConnectMicStore);

const { isPlaybacking, playbackListVisible, chapterVisible } =
  storeDefinitionToRefs(usePlaybackStore);

const { supportMultiStreamTrack } = storeDefinitionToRefs(useChannelStore);

const { iarSdkLoaded, iarUIV1Loaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { multiMeetingEnabled } = storeDefinitionToRefs(useMultiMeetingStore);

const { learningStatsEnabled, learningStatsDialogEnabled } =
  storeDefinitionToRefs(useChannelInfoStore);

const { notNeedIar, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { liveActivityLoaded, liveActivityRewardEntranceVisible } =
  storeDefinitionToRefs(useLiveActivityStore);
</script>
