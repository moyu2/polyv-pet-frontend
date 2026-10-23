<!-- @file PC 端页面固定的分享 -->
<template>
  <div class="c-fixed-web-share">
    <pwc-tooltip
      :content="$lang('share.title')"
      effect="dark"
      placement="left"
    >
      <div
        ref="referenceRef"
        class="c-fixed-widget-button"
      >
        <pc-icon-share-new />
      </div>
    </pwc-tooltip>

    <transition name="fade">
      <web-share-panel
        v-show="popperVisible"
        ref="popperRef"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconShareNew } from '@/components/component-icons/pc/map';
import WebSharePanel from '@/components/common-business/web-share-panel/web-share-panel.vue';
import { usePopper } from '@/hooks/components/use-popper';
import { PwcTooltip } from '@polyv/vue-components';

const { referenceRef, popperRef, popperVisible } = usePopper({
  trigger: 'click',
  arrow: true,
  placement: 'left-end',
  popperOffset: [0, 5],
});
</script>
