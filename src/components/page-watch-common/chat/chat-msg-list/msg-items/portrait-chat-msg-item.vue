<!-- @file 竖屏端聊天室消息渲染节点 -->
<template>
  <div
    v-show="msgVisible"
    class="c-portrait-chat-msg-item"
  >
    <div
      v-if="showMsgTime && !isPortraitWatchLayout"
      class="c-portrait-chat-msg-item__time pws-secondary-text-color"
    >
      {{ msgTimeText }}
    </div>
    <div class="c-portrait-chat-msg-item__content">
      <template v-if="iarSdkLoaded && iarUIV1Loaded">
        <!-- 红包消息 -->
        <portrait-redpaper-msg v-if="chatMsg.msgSource === ChatMsgSource.Redpaper" />
        <!-- 红包领取消息 -->
        <portrait-redpaper-receive-msg
          v-else-if="chatMsg.msgSource === ChatMsgSource.RedpaperReceive"
        />
      </template>
      <!-- 发言消息 -->
      <portrait-speak-msg v-if="chatMsg.msgSource === ChatMsgSource.Speak" />
      <!-- 自定义消息(服务端) -->
      <portrait-customer-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomerMessage" />
      <!-- 自定义消息(客户端) -->
      <portrait-custom-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomMessage" />
      <!-- 文件分享消息 -->
      <portrait-file-msg v-else-if="chatMsg.msgSource === ChatMsgSource.File" />
      <!-- 系统消息 -->
      <portrait-system-msg v-else-if="chatMsg.msgSource === ChatMsgSource.System" />
      <!-- 打赏消息 -->
      <portrait-reward-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Reward" />
      <!-- 表情消息 -->
      <portrait-emotion-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Emotion" />
      <!-- 图片消息 -->
      <portrait-image-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Image" />
      <!-- 课堂激励点赞消息 -->
      <portrait-motivation-like-msg
        v-else-if="chatMsg.msgSource === ChatMsgSource.MotivationLike"
      />
      <!-- 特效消息 -->
      <portrait-effect-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Effect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PortraitSpeakMsg from './speak-msg/portrait-speak-msg.vue';
import PortraitRedpaperMsg from './redpaper-msg/portrait-redpaper-msg.vue';
import PortraitRedpaperReceiveMsg from './redpaper-receive-msg/portrait-redpaper-receive-msg.vue';
import PortraitCustomerMsg from './customer-msg/portrait-customer-msg.vue';
import PortraitCustomMsg from './custom-msg/portrait-custom-msg.vue';
import PortraitFileMsg from './file-msg/portrait-file-msg.vue';
import PortraitSystemMsg from './system-msg/portrait-system-msg.vue';
import PortraitRewardMsg from './reward-msg/portrait-reward-msg.vue';
import PortraitEmotionMsg from './emotion-msg/portrait-emotion-msg.vue';
import PortraitImageMsg from './image-msg/portrait-image-msg.vue';
import PortraitMotivationLikeMsg from './motivation-like-msg/portrait-motivation-like-msg.vue';
import PortraitEffectMsg from './effect-msg/portrait-effect-msg.vue';
import { chatMsgItemProps, useChatMsgItem } from './use-chat-msg-item';
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';

const props = defineProps(chatMsgItemProps());

const { chatMsg, msgVisible, showMsgTime, msgTimeText } = useChatMsgItem({
  props,
});

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

const { iarSdkLoaded, iarUIV1Loaded } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-portrait-chat-msg-item__time {
  margin: 12px 0;
  font-size: 12px;
  line-height: 17px;
  text-align: center;
}
.c-portrait-chat-msg-item__content {
  margin: 4px 0;
}
</style>
