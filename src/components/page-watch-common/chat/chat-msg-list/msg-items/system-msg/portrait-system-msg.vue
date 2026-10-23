<!-- @file 竖屏端系统消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-system-msg"
    hide-user-info
  >
    <div
      v-if="chatMsg.type === 'chat-room-introduction'"
      class="c-portrait-system-msg-prefix-container"
    >
      <span class="c-portrait-system-msg-prefix pws-light-black-bg-10 pws-dark-white-bg-20">
        <span>{{ $lang('base.notice') }}</span>
      </span>
    </div>
    <div
      v-else
      class="c-portrait-system-msg-prefix-container"
    >
      <span class="c-portrait-system-msg-prefix pws-light-black-bg-10 pws-dark-white-bg-20">
        <span>{{ $lang('base.system.msg.prefix') }}</span>
      </span>
    </div>

    <span class="c-portrait-system-msg__text">{{ chatMsg.content }}</span>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useSystemMsg } from './use-system-msg';

const { chatMsg } = useSystemMsg();
</script>

<style lang="scss">
.c-portrait-system-msg-prefix-container {
  display: inline-flex;
  transform: translateY(-1px);
}

.c-portrait-system-msg-prefix {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 2px 6px;
  margin-right: 4px;
  font-size: 10px;
  line-height: 16px;
  border-radius: 20px;
}
</style>
