<!-- @file 移动端签到弹层 -->
<template>
  <mobile-popup
    class="c-mobile-check-in-popup"
    fill-body-section
    :title="checkInTitle"
    :visible.sync="checkInVisible"
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
  >
    <iar-mobile-check-in
      v-if="targetInited"
      ref="checkInRef"
      :check-in-target="getIarTarget()"
      enable-sound-effects
      :check-in-record-enabled="checkInRecordEnabled"
      @show-entrance="showEntrance"
      @to-show="setCheckInVisible(true, false)"
      @to-hide="setCheckInVisible(false)"
      @check-in-status="onCheckInStatus"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useCheckIn } from './hooks/use-check-in';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const {
  targetInited,
  getIarTarget,
  checkInRef,
  checkInVisible,
  checkInTitle,
  setCheckInVisible,
  checkInRecordEnabled,
  showEntrance,
  onCheckInStatus,
} = useCheckIn();

const { loadIarUI } = useIarUILoader('iar-check-in-ui');

const IarMobileCheckIn = defineAsyncComponent(() => loadIarUI('mobile-check-in'));
</script>
