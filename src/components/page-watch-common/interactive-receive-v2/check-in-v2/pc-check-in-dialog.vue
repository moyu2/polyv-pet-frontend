<!-- @file PC 端签到弹层 -->
<template>
  <pc-dialog
    ref="dialogRef"
    class="c-pc-check-in-dialog"
    :mount-el="dialogMountEl"
    :title="checkInTitle"
    :visible.sync="checkInVisible"
  >
    <iar-pc-check-in
      v-if="targetInited"
      ref="checkInRef"
      :check-in-target="getIarTarget()"
      enable-sound-effects
      :mount-node="dialogMountEl"
      :check-in-record-enabled="checkInRecordEnabled"
      @show-entrance="showEntrance"
      @to-show="setCheckInVisible(true, false)"
      @to-hide="setCheckInVisible(false)"
      @check-in-status="onCheckInStatus"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useCheckIn } from './hooks/use-check-in';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useComputePcDialogForPlayer } from '@/hooks/business/use-compute-pc-dialog-for-player/use-compute-pc-dialog-for-player';

const {
  targetInited,
  getIarTarget,
  checkInRef,
  checkInVisible,
  checkInTitle,
  checkInRecordEnabled,
  setCheckInVisible,
  showEntrance,
  onCheckInStatus,
} = useCheckIn();

const { dialogRef, dialogMountEl } = useComputePcDialogForPlayer();

const { loadIarUI } = useIarUILoader('iar-check-in-ui');

const IarPcCheckIn = defineAsyncComponent(() => loadIarUI('pc-check-in'));
</script>
