<!-- @file 移动端底部菜单栏 -->
<template>
  <div class="c-mobile-watch-mobile-menu">
    <background-section
      v-show="mobileMenuCurrentName === TAB_NAME_CHAT"
      :background-type="themeSetting.mobileChatBackgroundType"
      :default-url="defaultMobileChatRoomBgUrl"
      :custom-url="mobileChatRoomBgUrl"
    />

    <mobile-menu-tabs
      v-model="mobileMenuCurrentName"
      ref="mobileMenuTabsRef"
      :header-config="watchThemeStyleConfig?.mobile.menu"
      :force-show-header="followEnabled"
      @tab-click="onTabClick"
    >
      <template #header-suffix>
        <mobile-follow-btn v-if="followEnabled" />
      </template>

      <!-- ========= 弹层类型组件 Start ========= -->

      <!-- 关注弹层 -->
      <mobile-follow-layer v-if="followEnabled" />

      <!-- 课堂激励点赞动画 -->
      <motivation-like-animation
        v-if="donateAnimationVisible"
        v-show="mobileMenuCurrentName !== TAB_NAME_MICRO_ACTIVITY"
        class="c-mobile-watch-mobile-menu__motivation-like-animation"
      />

      <!-- ========= 弹层类型组件 End ========= -->

      <!-- 移动端底部菜单栏顶部固定区域 -->
      <div class="c-mobile-watch-mobile-menu__topic">
        <!-- 聊天室连接异常提示 -->
        <!-- <mobile-chat-connect-error-tips class="c-mobile-watch-mobile-menu__topic-item" /> -->
      </div>

      <!-- 文档位置切换按钮 -->
      <mobile-doc-side-switch />

      <!-- 文档 -->
      <template v-if="canRenderDoc">
        <mobile-menu-tab-pane
          :label="docOrCameraMenuName"
          :name="TAB_NAME_DOC_OR_VIDEO"
          lazy-load
        />
      </template>

      <!-- 根据后台配置渲染菜单 -->
      <template v-for="(menu, index) in channelMenus">
        <!-- 直播介绍 -->
        <mobile-menu-tab-pane
          v-if="menu.menuType === ChannelMenuType.Desc"
          :key="`desc-${index}`"
          :label="menu.name"
          :name="ChannelMenuType.Desc"
          lazy-load
        >
          <mobile-basic-info
            v-show="!anchorPopupVisible"
            :show-like-count="false"
          />
        </mobile-menu-tab-pane>

        <!-- 聊天室 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Chat"
          :key="`chat-${index}`"
          :label="menu.name"
          :name="TAB_NAME_CHAT"
          :sub-label="chatSubLabel"
          :show-reminder="chatReminderVisible"
        >
          <mobile-chat-room />
        </mobile-menu-tab-pane>

        <!-- 提问 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Quiz"
          :key="`quiz-${index}`"
          :label="menu.name"
          :name="TAB_NAME_ASK"
          :show-new-message="askReminderVisible"
          lazy-load
        >
          <mobile-ask v-if="!isChatUIV2" />
          <chat-loader-helper v-else>
            <mobile-ask-v2 />
          </chat-loader-helper>
        </mobile-menu-tab-pane>

        <!-- 问答 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.QA"
          :key="`qa-${index}`"
          :label="menu.name"
          :name="TAB_NAME_QA"
          lazy-load
        >
          <mobile-question-answer v-if="iarSdkLoaded && iarUIV1Loaded" />
        </mobile-menu-tab-pane>

        <!-- 回放 -->
        <mobile-menu-tab-pane
          v-else-if="
            menu.menuType === ChannelMenuType.Previous &&
            ![LiveStatus.Live, LiveStatus.Stop].includes(liveStatus)
          "
          :key="`playback-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PLAYBACK"
          lazy-load
        >
          <mobile-playback-list />
        </mobile-menu-tab-pane>

        <!-- 商品库 -->
        <mobile-menu-tab-pane
          v-else-if="
            menu.menuType === ChannelMenuType.Buy &&
            productEntryLandscapePosition === 'menuBar' &&
            !isPlaybackWatchUrl
          "
          :key="`buy-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PRODUCT"
          switch-to-refresh
        >
          <mobile-product-list v-if="iarSdkLoaded" />
        </mobile-menu-tab-pane>

        <!-- 图文直播 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Tuwen"
          :key="`tuwen-${index}`"
          :label="menu.name"
          :name="TAB_NAME_TUWEN_LIVE"
          lazy-load
        >
          <mobile-tuwen-live v-if="iarSdkLoaded && iarUIV1Loaded" />
        </mobile-menu-tab-pane>

        <!-- 图文菜单 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Text"
          :key="`text-${index}`"
          :label="menu.name"
          :name="menu.menuId"
          lazy-load
        >
          <mobile-custom-tuwen-text-menu :html-content="menu.content" />
        </mobile-menu-tab-pane>

        <!-- 推广链接(需要 hackWeixinBtn，所以不能懒加载) -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Iframe"
          :key="`iframe-${index}`"
          :label="menu.name"
          :name="menu.menuId"
          hack-weixin-btn
        >
          <template #default="{ weixinBtnId }">
            <mobile-promote-external-link
              :content="menu.content"
              :link-type="menu.linkType"
              :open-type="menu.iframeOpenType"
              :weixin-btn-selector="weixinBtnId"
              :is-active="mobileMenuCurrentName === menu.menuId"
            />
          </template>
        </mobile-menu-tab-pane>

        <!-- 投票 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Vote && voteActiveMenuData.visible"
          :key="`vote-${index}`"
          :label="menu.name"
          :name="TAB_NAME_VOTE"
        >
          <mobile-vote-panel-v2 v-if="iarSdkLoaded && !notNeedIar" />
        </mobile-menu-tab-pane>

        <!-- 云席 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Seat"
          :key="`seat-${index}`"
          :label="menu.name"
          :name="TAB_NAME_SEAT"
          lazy-load
        >
          <mobile-seat-table v-if="iarSdkLoaded && iarUIV1Loaded" />
        </mobile-menu-tab-pane>

        <!-- 邀请榜 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Invite && inviteRankEnabled"
          :key="`invite-${index}`"
          :label="menu.name"
          :name="TAB_NAME_INVITE_RANK"
          lazy-load
        >
          <mobile-invite-rank :is-active="mobileMenuCurrentName === TAB_NAME_INVITE_RANK" />
        </mobile-menu-tab-pane>

        <!-- 成员列表 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Members"
          :key="`member-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MEMBERS"
          lazy-load
        >
          <chat-loader-helper>
            <mobile-member-list-v2 />
          </chat-loader-helper>
        </mobile-menu-tab-pane>

        <!-- 微活动 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.MicroActivity"
          :key="`microActivity-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MICRO_ACTIVITY"
        >
          <mobile-micro-activity :is-active="mobileMenuCurrentName === TAB_NAME_MICRO_ACTIVITY" />
        </mobile-menu-tab-pane>

        <!-- 实时字幕 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Subtitle"
          :key="`subtitle-${index}`"
          :label="menu.name"
          :name="TAB_NAME_SUBTITLE"
        >
          <mobile-subtitle />
        </mobile-menu-tab-pane>

        <!-- AI助手答疑 -->
        <mobile-menu-tab-pane
          v-if="menu.menuType === ChannelMenuType.AIAssistant"
          :key="`AIAssistant-${index}`"
          :label="menu.name"
          :name="TAB_NAME_AI_ASSISTANT"
          lazy-load
        >
          <mobile-ai-assistant-chat />
        </mobile-menu-tab-pane>

        <!-- AI 看 -->
        <mobile-menu-tab-pane
          v-if="menu.menuType === ChannelMenuType.AISummary"
          :key="`AISummary-${index}`"
          :label="menu.name"
          :name="TAB_NAME_AI_SUMMARY"
          lazy-load
        >
          <mobile-ai-aggregate v-if="watchAICoreSetuped" />
        </mobile-menu-tab-pane>

        <!-- 多会场列表（竖向） for 主会场 -->
        <mobile-menu-tab-pane
          v-if="
            menu.menuType === ChannelMenuType.MultiMeeting &&
            multiMeetingMenuData.visible &&
            !isSubChannel
          "
          :key="`MultiMeeting-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MULTI_MEETING"
          lazy-load
        >
          <mobile-multi-meeting-portrait />
        </mobile-menu-tab-pane>
      </template>

      <!-- 回放章节 -->
      <template v-if="chapterVisible">
        <mobile-menu-tab-pane
          :label="$lang('menu.tabName.chapter')"
          :name="TAB_NAME_CHAPTER"
          lazy-load
        >
          <mobile-chapter />
        </mobile-menu-tab-pane>
      </template>

      <!-- 多会场列表（竖向） for 分会场 -->
      <mobile-menu-tab-pane
        v-if="multiMeetingMenuData.visible && isSubChannel"
        :label="multiMeetingMenuData.label"
        :name="TAB_NAME_MULTI_MEETING"
        lazy-load
      >
        <mobile-multi-meeting-portrait />
      </mobile-menu-tab-pane>
    </mobile-menu-tabs>
  </div>
</template>

<script setup lang="ts">
import MobileMenuTabPane from '@/components/common-base/tabs/mobile-menu-tabs/mobile-menu-tab-pane.vue';
import MobileMenuTabs from '@/components/common-base/tabs/mobile-menu-tabs/mobile-menu-tabs.vue';
import MobileBasicInfo from '@/components/common-business/basic-info/mobile-basic-info.vue';
import MobileAsk from '@/components/page-watch-common/ask/mobile-ask/mobile-ask.vue';
import MobileChapter from '@/components/page-watch-common/chapter/mobile-chapter.vue';
// import MobileChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/mobile-chat-connect-error-tips.vue';
import MobileChatRoom from '@/components/page-watch-common/chat/chat-room/mobile-chat-room.vue';
import MobileCustomTuwenTextMenu from '@/components/page-watch-common/custom-tuwen-text-menu/mobile-custom-tuwen-text-menu.vue';
import MobileDocSideSwitch from '@/components/page-watch-common/doc/doc-side-switch/mobile-doc-side-switch.vue';
import MobileFollowBtn from '@/components/page-watch-common/follow/follow-btn/mobile-follow-btn.vue';
import MobileFollowLayer from '@/components/page-watch-common/follow/follow-layer/mobile-follow-layer.vue';
import MobileQuestionAnswer from '@/components/page-watch-common/interactive-receive/question-answer/mobile-question-answer.vue';
import MobileTuwenLive from '@/components/page-watch-common/interactive-receive/tuwen-live/mobile-tuwen-live.vue';
import MobilePromoteExternalLink from '@/components/page-watch-common/promote-external-link/mobile-promote-external-link.vue';
import MobileVotePanelV2 from '@/components/page-watch-common/interactive-receive-v2/vote-v2/mobile-vote-panel.vue';
import MobileInviteRank from '@/components/page-watch-common/invite/mobile-invite-rank/mobile-invite-rank.vue';
import MobileMicroActivity from '@/components/page-watch-common/micro-activity/mobile-micro-activity/mobile-micro-activity.vue';
import MobilePlaybackList from '@/components/page-watch-common/playback-list/mobile-playback-list/mobile-playback-list.vue';
import MobileMultiMeetingPortrait from '@/components/page-watch-common/multi-meeting/mobile-multi-meeting/mobile-multi-meeting-portrait.vue';
import MobileSubtitle from '@/components/page-watch-common/subtitle/mobile-subtitle.vue';
import MobileSeatTable from '@/components/page-watch-common/interactive-receive/seat-table/mobile-seat-table.vue';
import MobileAiAssistantChat from '@/components/page-watch-common/polyv-ai/ai-assistant-chat/ai-assistant-chat.vue';
import MotivationLikeAnimation from '@/components/page-watch-common/motivation/motivation-like-animation/motivation-like-animation.vue';
import BackgroundSection from '@/components/common-business/background-section/background-section.vue';
import MobileAiAggregate from '@/components/page-watch-common/polyv-ai/ai-aggregate/ai-aggregate.vue';

import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import MobileAskV2 from '@/components/page-watch-common/ask-v2/mobile-ask.vue';
import MobileMemberListV2 from '@/components/page-watch-common/member-list/member-list-v2.vue';
import MobileProductList from '@/components/page-watch-common/product/product-list/mobile-product-list.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useInviteStore } from '@/store/use-invite-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { ChannelMenuType, LiveStatus, MainScreenContent } from '@polyv/live-watch-sdk';
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue';

import {
  TAB_NAME_ASK,
  TAB_NAME_CHAPTER,
  TAB_NAME_CHAT,
  TAB_NAME_DOC_OR_VIDEO,
  TAB_NAME_INVITE_RANK,
  TAB_NAME_MEMBERS,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_MULTI_MEETING,
  TAB_NAME_PLAYBACK,
  TAB_NAME_PRODUCT,
  TAB_NAME_QA,
  TAB_NAME_SEAT,
  TAB_NAME_SUBTITLE,
  TAB_NAME_TUWEN_LIVE,
  TAB_NAME_VOTE,
  TAB_NAME_AI_ASSISTANT,
  TAB_NAME_AI_SUMMARY,
} from '@/assets/constants/tab-name';
import { translate } from '@/assets/lang';
import { useFollowSetting } from '@/components/page-watch-common/follow/hooks/use-follow-setting';
import { useWatchTabHook } from '@/pages/watch/_hooks/use-watch-tab';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { TabNameType, TabsInstance } from '@/components/common-base/tabs/hooks/types';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useThemeStore } from '@/store/use-theme-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { usePolyvAIStore } from '@/store/use-polyv-ai-store';

const { paramGetter } = useQueryParams();

const { watchAICoreSetuped } = storeDefinitionToRefs(usePolyvAIStore);

const { mobileMenuCurrentName, mainScreen } = storeDefinitionToRefs(useLayoutStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { channelMenus, multiMeetingMenuData, isSubChannel, voteActiveMenuData } =
  storeDefinitionToRefs(useChannelMenuStore);

const { liveStatus, productEntryLandscapePosition } = storeDefinitionToRefs(useChannelStore);

const { anchorPopupVisible } = storeDefinitionToRefs(useChannelInfoStore);

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { chapterVisible } = storeDefinitionToRefs(usePlaybackStore);

const { inviteRankEnabled } = storeDefinitionToRefs(useInviteStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const { iarSdkLoaded, iarUIV1Loaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { notNeedIar, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { themeSetting, watchThemeStyleConfig, defaultMobileChatRoomBgUrl, mobileChatRoomBgUrl } =
  storeDefinitionToRefs(useThemeStore);

const docOrCameraMenuName = computed(() => {
  if (unref(mainScreen) === MainScreenContent.Doc) {
    return translate('base.camera');
  }

  return translate('doc.name');
});

const { followEnabled } = useFollowSetting();

const { trackWatchTabChange } = useWatchEventTrack();

const { chatSubLabel, chatReminderVisible, askReminderVisible } = useWatchTabHook({
  curActiveTabName: mobileMenuCurrentName,
});

const mobileMenuTabsRef = ref<TabsInstance>();

onMounted(async () => {
  await nextTick();
  const playBackVid = paramGetter().playBackVid();
  if (playBackVid) {
    const hasPlayBack = channelMenus.value.findIndex(
      item => item.menuType === ChannelMenuType.Previous,
    );
    if (hasPlayBack === -1) return;

    if ([LiveStatus.Live, LiveStatus.Stop].includes(liveStatus.value)) {
      return;
    }

    mobileMenuTabsRef.value?.setDefaultTabName(TAB_NAME_PLAYBACK);
  }
});

function onTabClick(tabName: TabNameType) {
  if (mobileMenuTabsRef.value) {
    mobileMenuTabsRef.value.clearDefaultTabName();
  }
  trackWatchTabChange(tabName);
}

watch(liveStatus, () => {
  if ([LiveStatus.Live, LiveStatus.Stop].includes(liveStatus.value)) {
    mobileMenuTabsRef.value?.setDefaultTabName('');
  }
});
</script>

<style lang="scss">
.c-mobile-watch-mobile-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-mobile-watch-mobile-menu__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  &:empty {
    display: none;
  }
}

.c-mobile-watch-mobile-menu__topic-item {
  margin: 4px 12px 0;
}

.c-mobile-watch-mobile-menu__motivation-like-animation {
  z-index: 310;
  width: 80%;
  padding-bottom: 100%;
  margin: 0 10%;
}
</style>
