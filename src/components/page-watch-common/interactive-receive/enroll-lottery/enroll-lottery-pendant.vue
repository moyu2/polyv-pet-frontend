<!-- @file 报名抽奖挂件 -->
<template>
  <iar-enroll-lottery-pendant
    class="c-enroll-lottery-pendant"
    :enroll-lottery-sdk="enrollLotterySdk"
    :auto-fetch-detail="interactSetting.enrollLotteryEnabled"
    @to-show-modal="showEnrollLotteryDialog"
    @entry-visible-changed="onEntryVisibleChange"
  />
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeToRefs } from 'pinia';
import { useGlobalInject } from '@/app/use-global-inject';

const IarEnrollLotteryPendant = getIarComponent('EnrollLotteryPendant');

const { getEmitter, getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
/** 报名抽奖实例 */
const enrollLotterySdk = watchCore.interactReceive.getEnrollLottery();

const interactReceiveStore = useInteractReceiveStore();

const { interactSetting } = storeToRefs(interactReceiveStore);

function onEntryVisibleChange(visible = true) {
  interactReceiveStore.$patch({
    enrollLotteryPendantVisible: visible,
  });
}

function showEnrollLotteryDialog() {
  getEmitter().emit(appEvents.interaction.OpenEnrollLottery, true);
}
</script>
