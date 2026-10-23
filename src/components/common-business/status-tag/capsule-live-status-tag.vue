<template>
  <div
    class="c-capsule-live-status-tag"
    :class="['c-capsule-live-status-tag-' + liveStatus]"
  >
    <mobile-live-signal-icon
      v-if="liveStatus === LiveStatus.Live"
      class="c-capsule-live-status-tag__signal-icon"
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
.c-capsule-live-status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  border-radius: 2px;
}

.c-capsule-live-status-tag__signal-icon {
  width: 12px;
  height: 12px;
}

$--status-configs: (
  'unStart' #23aa4f,
  'waiting' #23aa4f,
  'live' #ff5252,
  'end' #898989,
  'playback' #3f76fc,
  'stop' #ff5252
);

@each $status, $color in $--status-configs {
  .c-capsule-live-status-tag-#{$status} {
    background-color: $color !important;
  }
}
</style>
