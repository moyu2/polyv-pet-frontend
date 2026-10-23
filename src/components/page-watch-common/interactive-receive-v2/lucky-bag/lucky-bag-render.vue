<!-- 福袋弹层与动效渲染入口 -->
<template>
  <lucky-bag-provider v-if="luckyBagUILoaded">
    <div class="c-lucky-bag-render">
      <lucky-bag-task-popup @send-speak="handleSendSpeak" />
      <lucky-bag-result-popup @view-prize="handleViewPrize" />
    </div>
  </lucky-bag-provider>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useSendMsg } from '@/components/page-watch-common/chat/chat-msg-list/hooks/send-msg-hook';
import { defineAsyncComponent, onMounted, ref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');
const { getEmitter } = useGlobalInject();
const { sendSpeakMsg } = useSendMsg();

const LuckyBagTaskPopup = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagTaskPopup;
}) as unknown;

const LuckyBagResultPopup = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagResultPopup;
}) as unknown;

const luckyBagUILoaded = ref(false);

function handleSendSpeak(content: string) {
  sendSpeakMsg({
    content,
  });
}

function handleViewPrize() {
  getEmitter().emit(appEvents.iar.OpenLuckyBagPrizeListDialog);
}

onMounted(async () => {
  await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  luckyBagUILoaded.value = true;
});
</script>
