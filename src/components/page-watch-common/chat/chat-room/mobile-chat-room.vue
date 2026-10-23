<!-- @file 移动端聊天室 -->
<template>
  <div class="c-mobile-chat-room">
    <!-- 聊天室顶部固定区域 -->
    <div
      ref="topicRef"
      class="c-mobile-chat-room__topic"
    >
      <!-- 置顶公告 -->
      <div
        v-if="announcementFunctionVisible && iarSdkLoaded && !notNeedIar"
        class="c-mobile-chat-room__topic__item"
      >
        <bulletin-topping class="c-mobile-chat-room__topic__announcement" />
      </div>

      <!-- 跑道消息 -->
      <chat-loader-helper v-if="!chatRoomLongTimeNotUsed">
        <mobile-runway-effect class="c-mobile-chat-room__topic__item" />
      </chat-loader-helper>

      <!-- 评论氛围 -->
      <chat-loader-helper v-if="isChatUIV2 && !chatRoomLongTimeNotUsed">
        <mobile-comment-atmosphere
          class="c-mobile-chat-room__topic__item c-mobile-chat-room__comment-atmosphere"
          :class="{
            'c-mobile-chat-room__comment-atmosphere--product-bubble': productBubbleVisible,
          }"
        />
      </chat-loader-helper>

      <!-- 打赏动画 -->
      <chat-loader-helper>
        <mobile-donate-animation class="c-mobile-chat-room__topic__item" />
      </chat-loader-helper>
    </div>

    <div class="c-mobile-chat-room__content">
      <!-- 聊天消息列表区域 -->
      <div class="c-mobile-chat-room__msg-list">
        <!-- 消息列表 -->
        <mobile-chat-msg-list v-if="!isChatUIV2" />
        <chat-loader-helper v-else>
          <chat-msg-list-v2 />
        </chat-loader-helper>
      </div>

      <!-- 右下角挂件保持原有位置 -->
      <mobile-chat-room-pendant v-if="chatInputControllerEnable" />

      <!-- 商品库底部卡片；横屏与页面全屏时沿用挂件的 body 渲染机制 -->
      <custom-teleport :to="productBottomCardRenderParent">
        <div
          class="c-mobile-chat-room__product-bottom-card"
          :class="{
            'c-mobile-chat-room__product-bottom-card--page-fullscreen':
              mobilePlayerIsPageFullscreen,
            'c-mobile-chat-room__product-bottom-card--screen-horizontal':
              isHorizontalScreenOrientation,
          }"
        >
          <mobile-product-bottom-card
            v-if="!isPlaybackWatchUrl && interactSetting.liveProductEnabled"
          />
        </div>
      </custom-teleport>

      <!-- 特效动画 -->
      <chat-loader-helper>
        <mobile-special-effect-animation class="c-mobile-chat-room__special-effect-animation" />
      </chat-loader-helper>
    </div>

    <!-- 互动二次入口 -->
    <mobile-interactive-entrance v-if="iarSdkLoaded && chatInputControllerEnable && !notNeedIar" />

    <!-- 底部输入框 -->
    <template v-if="chatInputControllerEnable">
      <mobile-chat-input-controller v-if="!isChatUIV2" />
      <chat-loader-helper v-else>
        <mobile-chat-message-input-v2 />
      </chat-loader-helper>
    </template>

    <!-- 报名观看以及游客登录（参与互动时机） -->
    <mobile-enroll v-if="needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, unref } from 'vue';

import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';
import MobileEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import MobileChatInputController from '@/components/page-watch-common/chat/chat-input-controller/mobile-chat-input-controller/mobile-chat-input-controller.vue';
import MobileDonateAnimation from '@/components/page-watch-common/donate/donate-animation/index.vue';
import BulletinTopping from '@/components/page-watch-common/interactive-receive-v2/bulletin-v2/bulletin-topping.vue';
import MobileInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/mobile-interactive-entrance.vue';
import MobileChatMsgList from '../chat-msg-list/mobile-chat-msg-list.vue';
import MobileChatRoomPendant from '../chat-room-pendant/mobile-chat-room-pendant.vue';

import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import ChatMsgListV2 from '@/components/page-watch-common/chat-v2/chat-msg-list/index.vue';
import MobileCommentAtmosphere from '@/components/page-watch-common/chat-v2/comment-atmosphere/index.vue';
import MobileRunwayEffect from '@/components/page-watch-common/chat-v2/chat-runway-effect/index.vue';
import MobileChatMessageInputV2 from '@/components/page-watch-common/chat-v2/message-input/mobile-chat-message-input.vue';
import MobileSpecialEffectAnimation from '@/components/page-watch-common/chat-v2/special-effect-animation/index.vue';
import MobileProductBottomCard from '@/components/page-watch-common/product/product-bottom-card/mobile-product-bottom-card.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useElementSize } from '@polyv/vue-components';

const { notNeedIar, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatInputControllerEnable, isChatUIV2, chatRoomLongTimeNotUsed } =
  storeDefinitionToRefs(useChatStore);

const { iarSdkLoaded, announcementFunctionVisible, productBubbleVisible, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const {
  mobilePlayerIsPageFullscreen,
  isHorizontalScreenOrientation,
  isPageFullscreenOrHorizontalScreen,
} = storeDefinitionToRefs(useLayoutStore);
const layoutStore = useLayoutStore();

const productBottomCardRenderParent = computed<string | HTMLElement>(() => {
  return unref(isPageFullscreenOrHorizontalScreen) ? document.body : '';
});

const topicRef = ref<HTMLElement>();
useElementSize(topicRef, ({ height }) => {
  layoutStore.$patch({
    chatTopicHeight: height,
  });
});
</script>

<style lang="scss">
.c-mobile-chat-room {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: 100%;
}

// 与消息区右侧 68px / 138px 的避让一致，扣除卡片内置的 12px 留白。
.c-mobile-chat-room .c-mobile-chat-room__comment-atmosphere {
  width: calc(100% - 56px);
}

.c-mobile-chat-room .c-mobile-chat-room__comment-atmosphere--product-bubble {
  width: calc(100% - 126px);
}

.c-mobile-chat-room__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  // padding: 0 0 12px;
  overflow: hidden;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 100%;
  // -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);

  .c-mobile-chat-room__topic__item {
    position: relative;
    z-index: 20;
    margin-top: 4px;

    &:empty {
      display: none;
    }

    // &:last-of-type {
    //   padding-bottom: 12px;
    // }
  }

  .c-mobile-chat-room__topic__announcement {
    pointer-events: initial;
  }

  &:empty {
    display: none;
  }
}

.c-mobile-chat-room__content {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.c-mobile-chat-room__msg-list {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.c-mobile-chat-room__special-effect-animation {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.c-mobile-chat-room__product-bottom-card {
  position: absolute;
  bottom: 8px;
  left: 0;
  z-index: 30;
  box-sizing: border-box;
  width: calc(100% - 56px);
  padding: 0 0 0 12px;
  pointer-events: initial;
}

.c-mobile-chat-room__product-bottom-card--page-fullscreen {
  position: fixed;
  right: initial;
  bottom: calc(100vh - 96px);
  left: 16px;
  z-index: $--zIndex-pendant;
  width: 308px;
  max-width: calc(100vh - 192px);
  padding: 0;
  transform: rotate(90deg);
  transform-origin: bottom left;
}

.c-mobile-chat-room__product-bottom-card--screen-horizontal {
  position: fixed;
  right: 96px;
  bottom: 16px;
  left: 96px;
  z-index: $--zIndex-pendant;
  width: 308px;
  max-width: calc(100vw - 192px);
  padding: 0;
  transform: rotate(0deg);
  transform-origin: bottom center;
}
</style>
