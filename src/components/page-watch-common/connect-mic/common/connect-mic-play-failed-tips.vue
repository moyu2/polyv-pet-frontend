<!-- @file RTC 流播放失败的顶部固定提示组件 -->
<template>
  <div
    v-if="isUserStreamPlayFailed && isConnectMicing"
    class="c-connect-mic-play-failed-tips"
  >
    <!-- 提示文案 -->
    <div class="c-connect-mic-play-failed-tips__text">
      <span>{{ $lang('connectMic.error.userStreamPlayFailed') }}</span>
    </div>

    <div
      class="c-connect-mic-play-failed-tips__button"
      @click="handleConfirm"
    >
      {{ $lang('base.confirm') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useGlobalInject } from '@/app/use-global-inject';

const connectMicStore = useConnectMicStore();

const { isUserStreamPlayFailed, isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const { getWatchCore } = useGlobalInject();
const watchCore = getWatchCore();

/**
 * 处理确认按钮点击
 */
async function handleConfirm() {
  try {
    await watchCore.connectMic.resumeAllStreams();
    // 隐藏顶部提示
    connectMicStore.$patch({
      isUserStreamPlayFailed: false,
    });
  } catch (error) {
    console.error('恢复流播放失败:', error);
  }
}
</script>

<style lang="scss">
.c-connect-mic-play-failed-tips {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: #fff;
  white-space: nowrap;
  background: rgba(#000, 0.8);
  border-radius: 20px;
}

.c-connect-mic-play-failed-tips__text {
  flex: 1;
}

.c-connect-mic-play-failed-tips__button {
  flex-shrink: 0;
  color: #85a6f7;
  cursor: pointer;
}
</style>
