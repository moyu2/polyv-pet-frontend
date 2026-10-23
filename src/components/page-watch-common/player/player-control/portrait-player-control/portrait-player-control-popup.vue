<!-- @file 竖屏播放器控制弹层引入 -->
<template>
  <div class="c-portrait-player-control-popup">
    <!-- 线路切换 -->
    <portrait-line-setting-popup />
    <!-- 清晰度切换 -->
    <portrait-quality-setting-popup />
    <!-- 倍速切换 -->
    <portrait-rate-setting-popup />
    <!-- 延迟模式切换 -->
    <portrait-latency-setting-popup />
  </div>
</template>

<script setup lang="ts">
import PortraitLineSettingPopup from './portrait-line-setting-popup.vue';
import PortraitQualitySettingPopup from './portrait-quality-setting-popup.vue';
import PortraitRateSettingPopup from './portrait-rate-setting-popup.vue';
import PortraitLatencySettingPopup from './portrait-latency-setting-popup.vue';
</script>

<style lang="scss">
.c-portrait-player-control-popup:empty {
  display: none;
}
</style>
