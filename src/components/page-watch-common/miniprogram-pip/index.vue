<template>
  <div
    v-if="showBtn"
    class="c-mobile-miniprogram-pip"
    @click="onClickBtn"
  >
    <mobile-icon-pip />
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { MobileIconPip } from '@/components/component-icons/mobile/map';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { ChannelPIPSetting, LiveStatus } from '@polyv/live-watch-sdk';
import { concat } from '@polyv/utils';
import { computed, onMounted, ref } from 'vue';

const { getWatchCore } = useGlobalInject();
const { channelId, liveStatus } = storeDefinitionToRefs(useChannelStore);

const watchCore = getWatchCore();

const { getWeixinSdk } = useWeixinSdk();

const setting = ref<ChannelPIPSetting>();

const showBtn = computed(() => {
  return (
    setting.value?.miniprogramWebviewPictureInPictureEnabled &&
    !!setting.value.miniprogramWebviewPIPIntermediatePagePath &&
    liveStatus.value === LiveStatus.Live
  );
});

async function onClickBtn() {
  const miniprogramWebviewPIPIntermediatePagePath =
    setting.value?.miniprogramWebviewPIPIntermediatePagePath;
  if (!miniprogramWebviewPIPIntermediatePagePath) {
    return;
  }
  const wx = await getWeixinSdk();

  const url = concat(miniprogramWebviewPIPIntermediatePagePath, {
    channelId: channelId.value,
  });

  wx?.miniProgram?.navigateTo({
    url,
  });
}

onMounted(() => {
  setting.value = watchCore.channel.getPIPSetting();
});
</script>

<style lang="scss">
.c-mobile-miniprogram-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 36px;
  font-size: 24px;
  color: #fff;
  pointer-events: initial;
  // background: rgba(#000, 0.2);
  // border-radius: 50%;

  span {
    display: flex;
  }
}
</style>
