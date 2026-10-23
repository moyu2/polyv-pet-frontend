<!-- @file PC 端观看页侧边菜单栏 -->
<template>
  <div class="c-pc-watch-aside-menu">
    <pc-aside-tabs
      v-model="pcAsideTabCurrentName"
      @tab-click="trackWatchTabChange"
      @is-empty-callback="onIsEmptyCallback"
      :header-config="watchThemeStyleConfig?.pc?.menu"
    >
      <!-- 课堂激励特效，跟随"屏蔽特效"开关 -->
      <motivation-like-animation
        v-if="donateAnimationVisible"
        v-show="pcAsideTabCurrentName !== TAB_NAME_MICRO_ACTIVITY"
        class="c-pc-watch-aside-menu__motivation-like-animation"
        :enable-types="[MotivationLikeType.Speak]"
      />

      <!-- ========= 弹层类型组件 End ========= -->

      <!-- PC 端观看页侧边菜单栏顶部固定区域 -->
      <div class="c-pc-watch-aside-menu__topic">
        <!-- 聊天室连接异常提示 -->
        <!-- <pc-chat-connect-error-tips class="c-pc-watch-aside-menu__topic-item" /> -->
      </div>

      <!-- 连麦 tab -->
      <pc-aside-tab-pane
        v-if="connectMicPendantRenderEnabled"
        :label="$lang('call.connect')"
        :name="TAB_NAME_CONNECT_MIC"
      >
        <pc-connect-mic v-if="!isConnectMicUIV2" />
        <pc-connect-mic-v2 v-else />
      </pc-aside-tab-pane>

      <template v-for="(menu, index) in channelMenus">
        <!-- 微活动 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.MicroActivity"
          :key="`micro-activity-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MICRO_ACTIVITY"
        >
          <pc-micro-activity :is-active="pcAsideTabCurrentName === TAB_NAME_MICRO_ACTIVITY" />
        </pc-aside-tab-pane>

        <!-- 直播介绍 tab，PC观看页介绍位置为右侧菜单时显示 -->
        <pc-aside-tab-pane
          v-if="
            menu.menuType === ChannelMenuType.Desc &&
            descShowPosition === DescShowPosition.AsideMenu
          "
          :key="`desc-${index}`"
          :label="menu.name"
          :name="ChannelMenuType.Desc"
          lazy-load
        >
          <div class="c-pc-watch-aside-menu__desc pws-main-tab-body-scrollbar">
            <pc-rich-text-render
              :html-content="channelDescription"
              :should-compress-imgs="compressImageEnabled"
            />
          </div>
        </pc-aside-tab-pane>

        <!-- 聊天室 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Chat"
          :key="`chat-${index}`"
          :label="menu.name"
          :sub-label="chatSubLabel"
          :show-reminder="chatReminderVisible"
          :name="TAB_NAME_CHAT"
        >
          <pc-chat-room />
        </pc-aside-tab-pane>

        <!-- 投票活动 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Vote && voteActiveMenuData.visible"
          :key="`vote-${index}`"
          :label="menu.name"
          :name="TAB_NAME_VOTE"
        >
          <pc-vote-panel-v2 v-if="iarSdkLoaded && !notNeedIar" />
        </pc-aside-tab-pane>

        <!-- 成员列表 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Members"
          :key="`member-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MEMBERS"
          lazy-load
        >
          <chat-loader-helper>
            <pc-member-list-v2 />
          </chat-loader-helper>
        </pc-aside-tab-pane>

        <!-- 提问 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Quiz"
          :key="`quiz-${index}`"
          :label="menu.name"
          :name="TAB_NAME_ASK"
          :show-new-message="askReminderVisible"
          lazy-load
        >
          <pc-ask v-if="!isChatUIV2" />
          <chat-loader-helper v-else>
            <pc-ask-v2 />
          </chat-loader-helper>
        </pc-aside-tab-pane>

        <!-- 问答 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.QA"
          :key="`qa-${index}`"
          :label="menu.name"
          :name="TAB_NAME_QA"
          :show-reminder="qaReminderVisible"
        >
          <pc-question-answer v-if="iarSdkLoaded && iarUIV1Loaded" />
        </pc-aside-tab-pane>

        <!-- 商品库 tab，如果开了「播放器是否悬浮商品列表入口开关」，则不显示 -->
        <pc-aside-tab-pane
          v-if="
            menu.menuType === ChannelMenuType.Buy &&
            interactSetting.productEnabled &&
            interactSetting.productEntryPosition === ProductEntryPosition.MenuBar &&
            !isPlaybackWatchUrl
          "
          :key="`buy-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PRODUCT"
          switch-to-refresh
        >
          <pc-product-list v-if="iarSdkLoaded" />
        </pc-aside-tab-pane>

        <!-- 实时字幕 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Subtitle"
          :key="`subtitle-${index}`"
          :label="menu.name"
          :name="TAB_NAME_SUBTITLE"
        >
          <pc-subtitle />
        </pc-aside-tab-pane>

        <!-- AI助手答疑 -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.AIAssistant"
          :key="`AIAssistant-${index}`"
          :label="menu.name"
          :name="TAB_NAME_AI_ASSISTANT"
          lazy-load
        >
          <pc-ai-assistant-chat />
        </pc-aside-tab-pane>

        <!-- AI 看 -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.AISummary"
          :key="`AISummary-${index}`"
          :label="menu.name"
          :name="TAB_NAME_AI_SUMMARY"
          lazy-load
        >
          <pc-ai-aggregate v-if="watchAICoreSetuped" />
        </pc-aside-tab-pane>
      </template>

      <!-- 章节 tab -->
      <pc-aside-tab-pane
        v-if="chapterVisible"
        :label="$lang('menu.tabName.chapter')"
        :name="TAB_NAME_CHAPTER"
      >
        <pc-chapter />
      </pc-aside-tab-pane>
    </pc-aside-tabs>
  </div>
</template>

<script setup lang="ts">
import PcAsideTabPane from '@/components/common-base/tabs/pc-aside-tabs/pc-aside-tab-pane.vue';
import PcAsideTabs from '@/components/common-base/tabs/pc-aside-tabs/pc-aside-tabs.vue';
import PcRichTextRender from '@/components/common-base/rich-text-render/pc-rich-text-render.vue';
// import PcChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/pc-chat-connect-error-tips.vue';
import PcChatRoom from '@/components/page-watch-common/chat/chat-room/pc-chat-room.vue';
import PcMicroActivity from '@/components/page-watch-common/micro-activity/pc-micro-activity/pc-micro-activity.vue';
import PcConnectMic from '@/components/page-watch-common/connect-mic/pc-connect-mic/pc-connect-mic.vue';
import PcConnectMicV2 from '@/components/page-watch-common/connect-mic/pc-connect-mic-v2/pc-connect-mic-v2.vue';
import PcProductList from '@/components/page-watch-common/product/product-list/pc-product-list.vue';
import PcVotePanelV2 from '@/components/page-watch-common/interactive-receive-v2/vote-v2/pc/pc-vote-panel.vue';
import PcQuestionAnswer from '@/components/page-watch-common/interactive-receive/question-answer/pc-question-answer.vue';
import PcAsk from '@/components/page-watch-common/ask/pc-ask/pc-ask.vue';
import PcChapter from '@/components/page-watch-common/chapter/pc-chapter.vue';
import PcSubtitle from '@/components/page-watch-common/subtitle/pc-subtitle.vue';
import PcAiAssistantChat from '@/components/page-watch-common/polyv-ai/ai-assistant-chat/ai-assistant-chat.vue';
import MotivationLikeAnimation from '@/components/page-watch-common/motivation/motivation-like-animation/motivation-like-animation.vue';
import PcAiAggregate from '@/components/page-watch-common/polyv-ai/ai-aggregate/ai-aggregate.vue';

import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import PcAskV2 from '@/components/page-watch-common/ask-v2/pc-ask.vue';
import PcMemberListV2 from '@/components/page-watch-common/member-list/member-list-v2.vue';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import {
  TAB_NAME_CHAT,
  TAB_NAME_QA,
  TAB_NAME_ASK,
  TAB_NAME_CONNECT_MIC,
  TAB_NAME_VOTE,
  TAB_NAME_MEMBERS,
  TAB_NAME_PRODUCT,
  TAB_NAME_CHAPTER,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_SUBTITLE,
  TAB_NAME_AI_ASSISTANT,
  TAB_NAME_AI_SUMMARY,
} from '@/assets/constants/tab-name';
import { useLayoutStore } from '@/store/use-layout-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useDonateStore } from '@/store/use-donate-store';

import {
  ChannelMenuType,
  DescShowPosition,
  MotivationLikeType,
  ProductEntryPosition,
} from '@polyv/live-watch-sdk';

import { useWatchTabHook } from '@/pages/watch/_hooks/use-watch-tab';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { usePolyvAIStore } from '@/store/use-polyv-ai-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';

const layoutStore = useLayoutStore();

const { watchAICoreSetuped } = storeDefinitionToRefs(usePolyvAIStore);

const { pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { watchThemeStyleConfig } = storeDefinitionToRefs(useThemeStore);

const { connectMicPendantRenderEnabled, isConnectMicUIV2 } =
  storeDefinitionToRefs(useConnectMicStore);

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

const { channelMenus, voteActiveMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { qaReminderVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { chapterVisible } = storeDefinitionToRefs(usePlaybackStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const { iarSdkLoaded, iarUIV1Loaded, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { notNeedIar, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { compressImageEnabled, descShowPosition } = storeDefinitionToRefs(useChannelStore);

const { channelDescription } = storeDefinitionToRefs(useChannelInfoStore);

const { chatSubLabel, chatReminderVisible, askReminderVisible } = useWatchTabHook({
  curActiveTabName: pcAsideTabCurrentName,
});

const { trackWatchTabChange } = useWatchEventTrack();

function onIsEmptyCallback(isEmpty: boolean) {
  layoutStore.$patch({
    pcAsideTabIsEmpty: isEmpty,
  });
}
</script>

<style lang="scss">
.c-pc-watch-aside-menu {
  height: 100%;
  border-radius: inherit;
}

.c-pc-watch-aside-menu__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;

  &:empty {
    display: none;
  }
}
.c-pc-watch-aside-menu__topic-item {
  margin: 8px 8px 0;
}

.c-pc-watch-aside-menu__motivation-like-animation {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;
  height: 100%;
  padding-bottom: 20%;
}

.c-pc-watch-aside-menu__desc {
  box-sizing: border-box;
  height: 100%;
  padding: 12px;
  overflow-y: auto;
  @include scrollbar;
}
</style>
