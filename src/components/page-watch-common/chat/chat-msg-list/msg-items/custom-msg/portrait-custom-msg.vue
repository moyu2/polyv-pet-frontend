<!-- @file 移动端端-竖屏自定义消息（客户端） -->
<template>
  <div class="c-portrait-customer-msg"></div>
</template>

<script setup lang="ts">
import { useCustomMsg } from './use-custom-msg';

const { chatMsg } = useCustomMsg();
console.log(chatMsg.value);
</script>
