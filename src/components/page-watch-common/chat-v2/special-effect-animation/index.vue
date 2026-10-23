<template>
  <polyv-special-effect-animation />
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';

const PolyvChatUI = getChatUIV2Pkg();

const { SpecialEffectAnimation: PolyvSpecialEffectAnimation, useSpecialEffectStore } = PolyvChatUI;

const specialEffectStore = useSpecialEffectStore();

useEventBusListener(appEvents.donate.ToggleDonateAnimationVisible, () => {
  specialEffectStore.toggleSpecialEffect();
});
</script>
