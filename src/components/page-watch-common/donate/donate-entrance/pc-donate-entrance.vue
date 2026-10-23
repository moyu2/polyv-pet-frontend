<template>
  <div
    v-if="showDonateFunction"
    data-donate
    class="c-pc-donate-entrance"
    @click="onClickDonateEnter"
  >
    <div
      v-if="!isChatUIV2"
      class="c-pc-donate-entrance__old-btn"
    ></div>
    <pc-icon-donate v-else />

    <custom-teleport
      :to="
        isChatUIV2
          ? '.c-pc-chat-message-input [data-message-input-panel]'
          : '.c-pc-chat-input-controller .c-pc-msg-input-wrap__panel'
      "
    >
      <div
        v-show="donateVisible"
        ref="donatePanelRef"
        class="c-pc-donate-entrance__panel"
      >
        <pc-donate-panel @donate-finish="hideDonatePanel" />
      </div>
    </custom-teleport>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';
import { usePanelVisible } from '@/hooks/behaviors/use-panel-visible';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { ref } from 'vue';
import PcDonatePanel from '../donate-panel/pc-donate-panel/pc-donate-panel.vue';
import { PcIconDonate } from '@/components/component-icons/pc/map';

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { toInterruptUserClick } = useInterruptUserClick();

const { isChatUIV2 } = storeDefinitionToRefs(useChatStore);

// 打赏面板显示交互
const donatePanelRef = ref<HTMLDivElement>();
const {
  visible: donateVisible,
  togglePanel: toggleDonatePanel,
  showPanel: showDonatePanel,
  hidePanel: hideDonatePanel,
} = usePanelVisible([donatePanelRef, '[data-donate]']);

useEventBusListener(appEvents.donate.OpenDonatePopup, showDonatePanel);

function onClickDonateEnter() {
  const result = toInterruptUserClick({
    triggerSource: 'donate',
    ignoreSetNick: true,
  });

  if (result) {
    return;
  }

  toggleDonatePanel();
}
</script>

<style lang="scss">
.c-pc-donate-entrance__old-btn {
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
    background-image: url(./images/icon-reward.png);
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

.c-pc-donate-entrance__panel {
  height: 232px;
}
</style>
