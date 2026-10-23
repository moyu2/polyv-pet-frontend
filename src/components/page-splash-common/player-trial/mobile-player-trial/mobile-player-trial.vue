<template>
  <div class="c-player-trial">
    <div
      ref="playerContainer"
      class="c-player-trial__player-container"
    ></div>
    <p
      v-show="playerStartTipVisible"
      class="c-player-trial__player-start-tip"
    >
      {{ playerStartTipContent }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ChannelTrialInfo } from '@polyv/live-watch-sdk';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { PropUtils } from '@polyv/vue-components';

import { useToastManager } from '@/hooks/components/use-toast';
import { usePlayerTrialMain } from '../_hooks/use-player-trial-main';

const { toast } = useToastManager();

const props = defineProps({
  trialInfo: PropUtils.object<ChannelTrialInfo>().isRequired,
});

const { playerContainer } = usePlayerTrialMain({
  trialInfo: props.trialInfo,
});

const playerStartTipVisible = ref(false);

const playerStartTipContent = computed(() => {
  return translate('trial.player.start.tip', {
    time: String(props.trialInfo.trialWatchTime),
  });
});

useEventBusListener(appEvents.player.TrialPlayStart, () => {
  playerStartTipVisible.value = true;
  setTimeout(() => {
    playerStartTipVisible.value = false;
  }, 3000);
});

useEventBusListener(appEvents.player.TrialPlayEnd, () => {
  toast.warning(translate('trial.player.end.tip'));
});
</script>

<style lang="scss">
.c-player-trial {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-player-trial__player-container {
  width: 100%;
  height: 100%;
}

.c-player-trial__player-start-tip {
  position: absolute;
  bottom: 48px;
  left: 16px;
  z-index: 6;
  padding: 7px 16px;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 16px;
}
</style>
