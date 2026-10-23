<!-- @file 竖屏端自定义消息(服务端) -->
<template>
  <portrait-msg-container
    class="c-portrait-customer-msg"
    hide-user-info
  >
    {{ chatMsg.content }}
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useCustomerMsg } from './use-customer-msg';

const { chatMsg } = useCustomerMsg();
</script>
