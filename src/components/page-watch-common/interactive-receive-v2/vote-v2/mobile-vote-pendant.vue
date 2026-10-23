<!-- 移动端投票入口挂件 -->
<template>
  <div
    v-if="targetInited"
    class="c-mobile-vote-pendant"
  >
    <iar-mobile-vote-pendant
      :is-full-screen="isIarFullScreen"
      :vote-target="getIarTarget()"
      :icon-url="iconUrl"
      :before-click-interrupt="beforeClickInterrupt"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useVote } from './hooks/use-vote';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { loadIarUI } = useIarUILoader('iar-vote-ui');

const IarMobileVotePendant = defineAsyncComponent(() => loadIarUI('vote-pendant'));

const { targetInited, getIarTarget, iconUrl } = useVote();

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'vote-pendant', ignoreSetNick: true });
}
</script>
