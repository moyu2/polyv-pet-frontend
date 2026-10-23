<template>
  <div class="c-portrait-live-status-tag">
    <mobile-live-signal-icon
      v-if="liveStatus === LiveStatus.Live"
      class="c-portrait-live-status-tag__signal-icon"
    />
    <span>{{ statusTagText }}</span>
  </div>
</template>

<script setup lang="ts">
import { LiveStatus } from '@polyv/live-watch-sdk';
import MobileLiveSignalIcon from '../live-signal-icon/mobile-live-signal-icon.vue';
import { statusTagProps, useStatusTag } from './use-status-tag';

const props = defineProps(statusTagProps());

const { statusTagText, liveStatus } = useStatusTag({
  props,
});
</script>

<style lang="scss">
.c-portrait-live-status-tag {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
}

.c-portrait-live-status-tag__signal-icon {
  width: 12px;
  height: 12px;
  margin-right: 2px;
}
</style>
