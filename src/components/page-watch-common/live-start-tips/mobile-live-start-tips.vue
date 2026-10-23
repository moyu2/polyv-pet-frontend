<!-- @file 移动端直播开始提示 -->
<template>
  <div class="c-mobile-live-start-tips"></div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { unref, watch } from 'vue';
import { useLiveStartTips } from './use-live-start-tips';

const { toast } = useToastManager();

const { tipsVisible, fallbackReloadPage } = useLiveStartTips();

watch(
  () => unref(tipsVisible),
  () => {
    if (unref(tipsVisible)) {
      toast.success(translate('live.goLive'));
      fallbackReloadPage();
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-mobile-live-start-tips {
  display: none;
  pointer-events: none;
}
</style>
