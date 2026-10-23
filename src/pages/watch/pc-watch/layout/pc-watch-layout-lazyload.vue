<!-- @file PC端-延迟加载的弹出层类型组件 -->

<template>
  <div class="c-pc-watch-layout-lazyload">
    <!-- 互动功能渲染入口 -->
    <pc-iar-render v-if="iarSdkLoaded && iarUIV1Loaded" />
    <pc-iar-render-v2 v-if="iarSdkLoaded && !notNeedIar" />

    <!-- 商品库大卡片弹层 -->
    <pc-product-big-card-popup v-if="iarSdkLoaded" />

    <!-- 直播开始倒计时提示 -->
    <pc-live-start-tips />

    <!--  取消关联转播提示   -->
    <pc-transmit-switch-tip />

    <!-- 设置昵称 -->
    <pc-chat-set-nick v-if="canSetNick" />

    <!-- 页面右下角固定挂件 -->
    <pc-page-fixed-widgets
      hide-web-share
      hide-lang-switch
    />

    <!-- 聊天消息全文弹层 -->
    <pc-chat-full-message v-if="!isChatUIV2" />

    <!-- 实名认证弹层 -->
    <pc-real-name-dialog />

    <!-- 绑定用户信息 -->
    <pc-identity-collect-info-dialog v-if="bindMobileVisible" />

    <!-- 引导关注弹层 -->
    <pc-follow-dialog />

    <!-- 文件管理 -->
    <chat-loader-helper>
      <chat-v2-file-share-list />
    </chat-loader-helper>

    <!-- 观看/学习时长统计弹层 -->
    <pc-learning-stat-dialog v-if="learningStatsDialogEnabled" />
  </div>
</template>

<script setup lang="ts">
import PcIdentityCollectInfoDialog from '@/components/common-business/watch-identity/identity-collect-info-dialog/pc-identity-collect-info-dialog.vue';

import PcPageFixedWidgets from '@/components/common-business/page-fixed-widgets/page-fixed-widgets.vue';
import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import ChatV2FileShareList from '@/components/page-watch-common/chat-v2/file-share-list/index.vue';
import PcChatFullMessage from '@/components/page-watch-common/chat/chat-full-message/pc-chat-full-message.vue';
import PcChatSetNick from '@/components/page-watch-common/chat/chat-set-nick/pc-chat-set-nick.vue';
import PcIarRenderV2 from '@/components/page-watch-common/interactive-receive-v2/pc-iar-render-v2.vue';
import PcIarRender from '@/components/page-watch-common/interactive-receive/pc-iar-render.vue';
import PcLiveStartTips from '@/components/page-watch-common/live-start-tips/pc-live-start-tips.vue';
import PcRealNameDialog from '@/components/page-watch-common/real-name-auth/pc-real-name-auth.vue';
import PcTransmitSwitchTip from '@/components/page-watch-common/transmit-switch-tip/pc-transmit-switch-tip.vue';

import PcFollowDialog from '@/components/page-watch-common/follow/follow-layer/pc-follow-dialog.vue';
import PcLearningStatDialog from '@/components/page-watch-common/learning-stat-dialog/pc-learning-stat-dialog.vue';

import PcProductBigCardPopup from '@/components/page-watch-common/product/product-big-card-popup/product-big-card-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useIdentityStore } from '@/store/use-identity-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChatStore } from '@/store/use-chat-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { notNeedIar } = useWatchAppStore();

const { iarSdkLoaded, iarUIV1Loaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { learningStatsDialogEnabled } = storeDefinitionToRefs(useChannelInfoStore);

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);
</script>
