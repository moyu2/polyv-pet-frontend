<template>
  <div class="c-portrait-carousel-main-topic">
    <!-- 很多的挂件 -->
    <div
      class="c-portrait-carousel-main-topic__row-list"
      @touchstart.stop
      @touchend.stop
      @touchmove.stop
    >
      <!-- 文档开关 -->
      <portrait-doc-switch
        v-if="canRenderDoc"
        class="is-right"
      />

      <!-- 文档位置切换 -->
      <portrait-doc-side-switch
        v-if="portraitDocSideSwitchVisible && !isBuildForFeedMainMode()"
        class="is-right"
      />

      <mobile-feed-layout-back-btn v-if="isBuildForFeedMainMode()" />

      <!-- 主讲信息 -->
      <portrait-channel-info-capsule :mini="channelInfoSeat === 0" />

      <!-- 小程序小窗 -->
      <miniprogram-pip v-if="isWxMiniProgram" />

      <br v-if="channelInfoSeat === 1" />

      <!-- 直播状态 -->
      <portrait-status-tag />

      <!-- 竖屏分会场 -->
      <portrait-multi-meeting-entrance v-if="multiMeetingEnabled" />

      <!-- 邀请榜入口 -->
      <portrait-invite-rank-entrance v-if="inviteRankEnabled" />

      <!-- 互动二次入口 -->
      <portrait-interactive-entrance v-if="iarSdkLoaded && !notNeedIar" />

      <!-- 在线列表入口 -->
      <portrait-online-user-capsule
        v-if="portraitOnlineListEntranceVisible || chatOnlineNumberEnable"
      />

      <!-- 直播广场 -->
      <live-square />
    </div>

    <!-- 倒计时 + 预约 -->
    <div class="c-portrait-carousel-main-topic__row">
      <portrait-count-down-layer />
      <div class="c-portrait-carousel-main-topic__external-trial-countdown"></div>
    </div>

    <!-- 置顶消息 -->
    <div class="c-portrait-carousel-main-topic__row">
      <chat-loader-helper>
        <toping-msg class="c-portrait-carousel-main-topic__toping-msg" />
      </chat-loader-helper>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileFeedLayoutBackBtn from '@/components/page-feed-common/feed-layout-back-btn/mobile-feed-layout-back-btn.vue';
import PortraitOnlineUserCapsule from '@/pages/watch/portrait-watch/components/channel-info/portrait-online-user-capsule.vue';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import PortraitChannelInfoCapsule from '../components/channel-info/portrait-channel-info-capsule.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitStatusTag from '@/components/common-business/status-tag/portrait-status-tag.vue';
import PortraitMultiMeetingEntrance from '@/components/page-watch-common/multi-meeting/portrait-multi-meeting/portrait-multi-meeting-entrance.vue';
import PortraitInviteRankEntrance from '@/components/page-watch-common/invite/portrait-invite-rank/portrait-invite-rank-entrance.vue';
import MiniprogramPip from '@/components/page-watch-common/miniprogram-pip/index.vue';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import PortraitInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/portrait-interactive-entrance.vue';
import { useInviteStore } from '@/store/use-invite-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useChatStore } from '@/store/use-chat-store';
import PortraitDocSideSwitch from '@/components/page-watch-common/doc/doc-side-switch/portrait-doc-side-switch.vue';
import PortraitDocSwitch from '@/components/page-watch-common/doc/doc-switch/portrait-doc-switch.vue';
import { useDocStore } from '@/store/use-doc-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import LiveSquare from '@/components/page-watch-common/live-square/live-square.vue';
import TopingMsg from '@/components/page-watch-common/chat-v2/toping-msg/index.vue';
import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import PortraitCountDownLayer from '@/components/page-watch-common/count-down-layer/portrait-count-down-layer.vue';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { notNeedIar, isWxMiniProgram } = storeDefinitionToRefs(useWatchAppStore);

const { channelInfoSeat, portraitOnlineListEntranceVisible, portraitDocSideSwitchVisible } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { multiMeetingEnabled } = storeDefinitionToRefs(useMultiMeetingStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { chatOnlineNumberEnable } = storeDefinitionToRefs(useChatStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);
</script>

<style lang="scss">
.c-portrait-carousel-main-topic {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: calc(var(--plv-watch-full-screen-vw) - 32px);
}

.c-portrait-carousel-main-topic__row {
  position: relative;
  width: 100%;
  &:empty {
    display: none;
  }
}

.c-portrait-carousel-main-topic__row-list {
  width: 100%;
  margin-bottom: -10px;

  & > * {
    display: inline-flex;
    margin-right: 10px;
    margin-bottom: 10px;
    vertical-align: middle;

    &:last-child {
      margin-right: 0;
    }
  }

  &:empty {
    display: none;
  }

  .is-right {
    float: right;
    margin-right: 0;
    margin-left: 10px;
  }
}

.c-portrait-carousel-main-topic__toping-msg {
  .plv-toping-msg-list {
    position: relative !important;
  }
}
</style>
