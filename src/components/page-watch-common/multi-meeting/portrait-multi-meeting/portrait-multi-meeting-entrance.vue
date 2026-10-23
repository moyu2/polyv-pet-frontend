<template>
  <div
    class="c-portrait-multi-meeting-entrance"
    @click="showMultiMeeting"
  >
    <div class="c-portrait-multi-meeting-entrance__content">
      {{ multiMeetingMenuData.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { onMounted } from 'vue';
import { useMultiMeeting } from '../hooks/use-multi-meeting';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const { getEmitter } = useGlobalInject();

function showMultiMeeting() {
  getEmitter().emit(appEvents.portrait.OpenPortraitMultiMeeting, true);
}

const { initMultiMeeting } = useMultiMeeting(false);

const { multiMeetingMenuData } = storeDefinitionToRefs(useChannelMenuStore);

onMounted(() => {
  initMultiMeeting();
});
</script>

<style lang="scss">
.c-portrait-multi-meeting-entrance {
  white-space: nowrap;
}
.c-portrait-multi-meeting-entrance__content {
  display: inline-block;
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  &::before {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-top: -3px;
    margin-right: 2px;
    vertical-align: middle;
    content: '';
    background-image: url('../imgs/icon-portrait-top.png');
    background-repeat: no-repeat;
    background-size: contain;
  }
}
</style>
