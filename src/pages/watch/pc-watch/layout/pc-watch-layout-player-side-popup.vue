<template>
  <div class="c-pc-watch-layout-player-side-popup">
    <!-- 我的奖励弹层 -->
    <pc-personal-reward-dialog />
  </div>
</template>

<script setup lang="ts">
import PcPersonalRewardDialog from '@/components/page-watch-common/personal-reward/pc-personal-reward-dialog.vue';
</script>

<style lang="scss">
.c-pc-watch-layout-player-side-popup {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  pointer-events: initial;
}
</style>
