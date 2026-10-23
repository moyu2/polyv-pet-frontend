<!-- @file 移动端更多弹层 -->
<template>
  <mobile-popup
    class="c-mobile-more-popup"
    :visible.sync="visible"
    :show-header="false"
    content-background="none"
  >
    <mobile-more-panel @close="closeMore" />
  </mobile-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import MobileMorePanel from './mobile-more-panel.vue';
import { provide } from 'vue';
import { MORE_POPUP_INJECT_KEY } from './types';

const { visible, setVisible, close: closeMore } = useSimpleVisible(false);

useEventBusListener(appEvents.global.OpenMobileMorePopup, (_visible = true) => {
  setVisible(_visible);
});

provide(MORE_POPUP_INJECT_KEY, {
  closeMore,
});
</script>
