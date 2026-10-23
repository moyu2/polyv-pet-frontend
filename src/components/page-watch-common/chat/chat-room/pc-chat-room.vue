<!-- @file PC 端聊天室 -->
<template>
  <div class="c-pc-chat-room">
    <!-- 聊天室顶部固定区域 -->
    <div
      ref="topicRef"
      class="c-pc-chat-room__topic"
    >
      <!-- 置顶公告 -->
      <bulletin-topping
        v-if="announcementFunctionVisible && iarSdkLoaded && !notNeedIar"
        class="c-pc-chat-room__topic__item c-pc-chat-room__topic__announcement"
      />

      <!-- 跑道消息 -->
      <chat-loader-helper v-if="!chatRoomLongTimeNotUsed">
        <pc-runway-effect class="c-pc-chat-room__topic__item" />
      </chat-loader-helper>

      <!-- 评论氛围 -->
      <chat-loader-helper v-if="isChatUIV2 && !chatRoomLongTimeNotUsed">
        <pc-comment-atmosphere
          class="c-pc-chat-room__topic__item c-pc-chat-room__comment-atmosphere"
        />
      </chat-loader-helper>

      <!-- 打赏动画 -->
      <chat-loader-helper>
        <pc-donate-animation class="c-pc-chat-room__topic__item" />
      </chat-loader-helper>
    </div>

    <!-- 聊天消息列表区域 -->
    <div class="c-pc-chat-room__msg-list">
      <!-- 消息列表 -->
      <pc-chat-msg-list v-if="!isChatUIV2" />
      <chat-loader-helper v-else>
        <chat-msg-list-v2 />
      </chat-loader-helper>

      <!-- 右下角挂件 -->
      <pc-chat-room-pendant v-if="chatInputControllerEnable" />

      <!-- 特效动画 -->
      <chat-loader-helper>
        <pc-special-effect-animation class="c-pc-chat-room__special-effect-animation" />
      </chat-loader-helper>
    </div>

    <!-- 互动二次入口 -->
    <pc-interactive-entrance v-if="iarSdkLoaded && chatInputControllerEnable && !notNeedIar" />

    <!-- 底部输入框 -->
    <template v-if="chatInputControllerEnable">
      <template v-if="!isChatUIV2">
        <!-- 消息引用 -->
        <pc-chat-msg-quote />
        <pc-chat-input-controller />
      </template>
      <chat-loader-helper v-else>
        <pc-message-input-v2 />
      </chat-loader-helper>
    </template>

    <!-- 报名观看以及游客登录（参与互动时机） -->
    <pc-enroll v-if="needEnrollByChat" />
  </div>
</template>

<script setup lang="ts">
import PcEnroll from '@/components/common-business/enroll/pc-enroll.vue';
import PcDonateAnimation from '@/components/page-watch-common/donate/donate-animation/index.vue';
import PcSpecialEffectAnimation from '@/components/page-watch-common/chat-v2/special-effect-animation/index.vue';

import PcCommentAtmosphere from '@/components/page-watch-common/chat-v2/comment-atmosphere/index.vue';
import PcRunwayEffect from '@/components/page-watch-common/chat-v2/chat-runway-effect/index.vue';
import BulletinTopping from '@/components/page-watch-common/interactive-receive-v2/bulletin-v2/bulletin-topping.vue';
import PcInteractiveEntrance from '@/components/page-watch-common/interactive-receive/interactive-entrance/pc-interactive-entrance.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { ChatLoaderHelper } from '../../chat-v2/chat-loader-helper';
import ChatMsgListV2 from '../../chat-v2/chat-msg-list/index.vue';
import PcMessageInputV2 from '../../chat-v2/message-input/pc-chat-message-input.vue';
import PcChatInputController from '../chat-input-controller/pc-chat-input-controller/pc-chat-input-controller.vue';
import PcChatMsgList from '../chat-msg-list/pc-chat-msg-list.vue';
import PcChatMsgQuote from '../chat-msg-quote/pc-chat-msg-quote.vue';
import PcChatRoomPendant from '../chat-room-pendant/pc-chat-room-pendant.vue';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useElementSize } from '@polyv/vue-components';
import { ref } from 'vue';
import { useLayoutStore } from '@/store/use-layout-store';

const { notNeedIar } = storeDefinitionToRefs(useWatchAppStore);

const { needEnrollByChat } = storeDefinitionToRefs(useEnrollStore);

const { chatInputControllerEnable, isChatUIV2, chatRoomLongTimeNotUsed } =
  storeDefinitionToRefs(useChatStore);

const { announcementFunctionVisible, iarSdkLoaded } =
  storeDefinitionToRefs(useInteractReceiveStore);

const layoutStore = useLayoutStore();

const topicRef = ref<HTMLElement>();
useElementSize(topicRef, ({ height }) => {
  layoutStore.$patch({
    chatTopicHeight: height,
  });
});
</script>

<style lang="scss">
.c-pc-chat-room {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-chat-room__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  padding: 0 0 12px;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 100%;
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 1) 8px);

  .c-pc-chat-room__topic__item {
    margin-top: 4px;
    &:empty {
      display: none;
    }
  }

  .c-pc-chat-room__topic__announcement {
    pointer-events: initial;
  }

  &:empty {
    display: none;
  }

  .c-bulletin-topping {
    position: relative;
    z-index: 1;
  }
}

// 预留右侧挂件及其外边距；卡片自身的右侧留白作为与挂件的间距。
.c-pc-chat-room .c-pc-chat-room__comment-atmosphere {
  width: calc(100% - #{$pendant-size} - 12px);
}

.c-pc-chat-room__special-effect-animation {
  z-index: 20;
}

.c-pc-chat-room__msg-list {
  position: relative;
  flex: 1;
  overflow: hidden;
}
</style>
