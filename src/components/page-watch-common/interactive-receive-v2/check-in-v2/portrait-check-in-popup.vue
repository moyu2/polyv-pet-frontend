<!-- @file 竖屏签到弹层 -->
<template>
  <iar-portrait-check-in
    v-if="targetInited"
    ref="checkInRef"
    class="c-portrait-check-in-popup"
    v-show="checkInVisible"
    enable-sound-effects
    :check-in-record-enabled="checkInRecordEnabled"
    :check-in-target="getIarTarget()"
    :is-full-screen="isIarFullScreen"
    @show-entrance="showEntrance"
    @to-show="setCheckInVisible(true, false)"
    @to-hide="setCheckInVisible(false)"
    @check-in-status="onCheckInStatus"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useCheckIn } from './hooks/use-check-in';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const {
  targetInited,
  getIarTarget,
  checkInRef,
  checkInVisible,
  checkInRecordEnabled,
  setCheckInVisible,
  showEntrance,
  onCheckInStatus,
} = useCheckIn();

const { loadIarUI } = useIarUILoader('iar-check-in-ui');

const IarPortraitCheckIn = defineAsyncComponent(() => loadIarUI('portrait-check-in'));
</script>
