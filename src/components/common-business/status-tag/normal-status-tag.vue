<template>
  <div
    class="c-normal-status-tag"
    :class="[
      'c-normal-status-tag--' + liveStatus,
      {
        'is-dark': isDarkStyle,
      },
    ]"
  >
    <mobile-live-signal-icon
      v-if="[LiveStatus.Live, LiveStatus.Playback].includes(liveStatus)"
      class="c-normal-live-status-tag__signal-icon"
      background="currentColor"
    />
    <span
      class="c-normal-status-tag__text"
      data-testid="live-status-tag-text"
      >{{ statusTagText }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { statusTagProps, useStatusTag } from './use-status-tag';
import { useThemeStore } from '@/store/use-theme-store';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';
import { computed } from 'vue';
import { PropUtils } from '@polyv/vue-components';
import MobileLiveSignalIcon from '../live-signal-icon/mobile-live-signal-icon.vue';
import { LiveStatus } from '@polyv/live-watch-sdk';

const props = defineProps({
  ...statusTagProps(),
  forceDark: PropUtils.bool.def(false),
});

const { statusTagText, liveStatus } = useStatusTag({
  props,
});

const { currentSkinColorMode } = storeDefinitionToRefs(useThemeStore);

const isDarkStyle = computed(() => {
  if (props.forceDark || currentSkinColorMode.value === ThemeColorMode.Dark) {
    return true;
  }
  return false;
});
</script>

<style lang="scss">
.c-normal-status-tag {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 4px;
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
  vertical-align: middle;
  cursor: default;
  border-radius: 2px;

  span {
    position: relative;
    z-index: 2;
    line-height: 1.6;
    zoom: 0.833;
  }
}

.c-normal-status-tag::before {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  content: '';
  background: currentColor;
  border-radius: 2px;
  opacity: 0.1;
}

.c-normal-live-status-tag__signal-icon {
  position: relative;
  z-index: 2;
}

.c-normal-status-tag.is-dark {
  span,
  .c-normal-live-status-tag__signal-icon {
    color: #fff;
  }
  &::before {
    opacity: 1;
  }
}

$--status-configs: (
  'unStart' #23aa4f,
  'waiting' #23aa4f,
  'live' #ff5252,
  'end' rgba(#000, 0.6),
  'playback' #3f76fc,
  'stop' #ff5252
);

@each $status, $color in $--status-configs {
  .c-normal-status-tag--#{$status} {
    color: $color !important;
  }
}

.c-normal-status-tag--end {
  &::before {
    background: rgba(#000, 0.06) !important;
    opacity: 1 !important;
  }

  &.is-dark {
    span {
      color: #fff !important;
    }
    &::before {
      background: rgba(#fff, 0.4) !important;
    }
  }
}
</style>
