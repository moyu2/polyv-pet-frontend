<!-- @file 移动端竖屏 - 多会场弹窗-->
<template>
  <mobile-popup
    :visible.sync="popupVisible"
    :theme="popupTheme"
    :content-height="512"
    class="c-portrait-multi-meeting-popup"
    :title="$lang('multiMeeting.watchOther')"
    closable
    ignore-content-max-height
    :content-percent-height="0.784"
  >
    <portrait-multi-meeting />
  </mobile-popup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import PortraitMultiMeeting from '@/components/page-watch-common/multi-meeting/portrait-multi-meeting/portrait-multi-meeting.vue';

const popupVisible = ref(false);

const popupTheme = computed(() => {
  return PopupTheme.PortraitLight;
});

useEventBusListener(appEvents.portrait.OpenPortraitMultiMeeting, () => {
  popupVisible.value = true;
});
</script>

<style lang="scss">
.c-portrait-multi-meeting-popup {
  .c-mobile-popup__header__title {
    color: rgba($color: $--color-black, $alpha: 0.8);
    text-align: center !important;
  }
}
</style>
