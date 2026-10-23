<!-- @file 移动端-在线用户列表信息栏 -->
<template>
  <div class="c-mobile-member-desc">
    <div>{{ $lang('member.list.viewer.info') }}</div>
    <div @click="showRulePopup">{{ $lang('member.list.rule') }}</div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

function showRulePopup() {
  getEmitter().emit(appEvents.portrait.OpenPortraitOnlineUserListRulePopup);
}
</script>

<style lang="scss">
.c-mobile-member-desc {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  background: #202127;
}
</style>
