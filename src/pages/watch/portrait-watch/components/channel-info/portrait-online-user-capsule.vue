<!-- @file 竖屏在线人数胶囊 -->
<template>
  <div
    class="portrait-online-user-capsule"
    @click="showOnlineUserListPopup"
  >
    {{ shortNumber(onlineUserCount) }}{{ $lang('member.online.userCount') }}
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/store/use-chat-store';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useShortNumber } from '@/hooks/business/use-short-number';

const { shortNumber } = useShortNumber();

const { onlineUserCount } = storeDefinitionToRefs(useChatStore);
const { onlineListEnabled } = storeDefinitionToRefs(useChannelStore);
const { getEmitter } = useGlobalInject();

function showOnlineUserListPopup() {
  // 需要开启在线列表才展示在线列表弹层
  if (onlineListEnabled.value) {
    getEmitter().emit(appEvents.portrait.OpenPortraitOnlineUserListPopup);
  }
}
</script>

<style lang="scss">
.portrait-online-user-capsule {
  box-sizing: border-box;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  height: 20px;
  padding: 3px 8px;

  font-size: 12px;
  color: $--color-white;
  white-space: nowrap;
  background-color: rgba(#000, 0.2);
  border-radius: 18px;
}
</style>
