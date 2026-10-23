<template>
  <div
    v-if="personalRewardEntranceVisible || liveActivityRewardEntranceVisible"
    class="c-pc-personal-reward-entrance"
    @click="onClickPersonalReward"
  >
    <div
      v-if="!isChatUIV2"
      class="c-pc-personal-reward-entrance__old"
    ></div>
    <pc-icon-personal-reward v-else />
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import { PcIconPersonalReward } from '@/components/component-icons/pc/map';

const { getEmitter } = useGlobalInject();

const { toInterruptUserClick } = useInterruptUserClick();

const { personalRewardEntranceVisible } = storeDefinitionToRefs(useInteractReceiveStore);
const { liveActivityRewardEntranceVisible } = storeDefinitionToRefs(useLiveActivityStore);

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

// 点击我的奖励
function onClickPersonalReward() {
  const result = toInterruptUserClick({
    triggerSource: 'personal-reward',
    ignoreSetNick: true,
  });
  if (result) {
    return;
  }

  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog);
}
</script>

<style lang="scss">
.c-pc-personal-reward-entrance__old {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;

  &::after {
    display: block;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    content: '';
    background-image: url(./images/icon-task-activity.svg);
    background-size: 100% 100%;
  }

  &:hover::after {
    animation: scale-animation 0.35s ease-in;
  }
  &:active::after {
    transition: all 0.05s ease-in;
    transform: scale(1.2);
  }
}
</style>
