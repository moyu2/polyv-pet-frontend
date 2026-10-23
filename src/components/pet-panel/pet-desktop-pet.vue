<template>
  <pet-companion />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import PetCompanion from './pet-companion.vue';
import { usePetStore } from './use-pet-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useCommentRewardStore } from './use-comment-rewards';

const store = usePetStore();
const rewards = useCommentRewardStore();
const { viewerId, nickname } = storeDefinitionToRefs(useViewerStore);
const { channelId } = storeDefinitionToRefs(useChannelStore);

// 接入层只负责 SDK 身份；独立宠物组件可复用同一播放器与交互做视觉验收。
watch(
  [viewerId, channelId, () => store.inited],
  ([viewer, channel, ready]) => {
    if (ready && viewer && channel)
      store.loginByViewer(viewer, channel, nickname.value || undefined);
  },
  { immediate: true },
);
onMounted(() => {
  store.init();
});

watch(
  () =>
    store.authenticated && store.identity
      ? `pet-comment:${store.identity.appId}:${store.identity.channelId}:${store.identity.viewerId}`
      : '',
  key => {
    rewards.setIdentity(key || '');
    if (key) rewards.tick();
  },
  { immediate: true },
);
// 每秒更新倒计时；规则请求仍由 tick 内部按原频率节流。
const rewardTimer = window.setInterval(() => rewards.tick(), 1000);
onBeforeUnmount(() => window.clearInterval(rewardTimer));
</script>
