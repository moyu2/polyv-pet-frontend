<!-- @file 竖屏-邀请榜列表 -->
<template>
  <mobile-popup
    :visible.sync="popupVisible"
    class="c-portrait-invite-rank"
    ignore-content-max-height
    :show-header="false"
    :content-percent-height="0.784"
    :content-style="{
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
    }"
  >
    <mobile-invite-rank :is-active="popupVisible" />
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileInviteRank from '../mobile-invite-rank/mobile-invite-rank.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

const popupVisible = ref(false);

useEventBusListener(appEvents.invite.OpenPortraitInviteRank, () => {
  popupVisible.value = true;
});
</script>

<style lang="scss">
.c-portrait-invite-rank {
  .c-mobile-popup__content {
    border-radius: 8px 8px 0 0;
  }
}
</style>
