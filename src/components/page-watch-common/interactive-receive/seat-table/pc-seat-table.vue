<!-- @file PC端-云席 -->

<template>
  <div class="c-pc-seat-table">
    <img
      v-if="pcImg"
      :src="pcImg"
    />
  </div>
</template>

<script setup lang="ts">
import { ChannelMenuType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const channelMenuStore = useChannelMenuStore();

const pcImg = computed(() => {
  const menuData = channelMenuStore.getMenuData(ChannelMenuType.Seat);
  return menuData && menuData.content;
});
</script>

<style lang="scss">
.c-pc-seat-table {
  text-align: center;
  img {
    max-width: 100%;
  }
}
</style>
