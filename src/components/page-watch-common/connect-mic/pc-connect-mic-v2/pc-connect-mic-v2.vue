<!-- @file PC 端连麦 v2 -->
<template>
  <div class="c-pc-connect-mic-v2">
    <!-- 有连麦画面（连麦中 / 小班课观众模式已订阅到讲师等流）：上方视频列表（滚动） -->
    <template v-if="hasConnectMicList">
      <div class="c-pc-connect-mic-v2__list">
        <pc-connect-mic-user-list />
      </div>

      <!-- 仅本端连麦中才显示底部固定控制栏与结束二次确认 -->
      <template v-if="isConnectMicing">
        <pc-connect-mic-bottom-v2 />
        <pc-connect-mic-confirm />
      </template>
    </template>

    <!-- 未连麦（本端未上麦）：申请 / 申请中 / 被邀请 -->
    <pc-connect-mic-preview-v2 v-if="!isConnectMicing" />

    <!-- 不支持提示 -->
    <div
      v-if="!supportConnectMic"
      class="c-pc-connect-mic-v2__not-support"
    >
      {{ $lang('connectMic.error.notSupport1') }}<br />{{ $lang('connectMic.error.notSupport2') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, unref, watch } from 'vue';

import { TAB_NAME_CONNECT_MIC } from '@/assets/constants/tab-name';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';

import { useConnectMic } from '../hooks/use-connect-mic';
import PcConnectMicConfirm from '../pc-connect-mic/pc-connect-mic-confirm.vue';
import PcConnectMicUserList from '../pc-connect-mic/pc-connect-mic-user-list.vue';
import PcConnectMicBottomV2 from './pc-connect-mic-bottom-v2.vue';
import PcConnectMicPreviewV2 from './pc-connect-mic-preview-v2.vue';

const { supportConnectMic, isConnectMicing, inviteStatus, connectMicList } =
  storeDefinitionToRefs(useConnectMicStore);

/**
 * 是否有连麦画面需要展示。
 * 不能只用 isConnectMicing（仅 Publishing/Connected 为真，即本端已上麦）判断：
 * 小班课观众模式下本端未上麦时 isConnectMicing 为 false，但已订阅到讲师/其他人的流，
 * 此时也应展示列表。与旧版 pc-connect-mic.vue 用 connectMicList.length 判断保持一致。
 */
const hasConnectMicList = computed(
  () => unref(isConnectMicing) || unref(connectMicList).length > 0,
);

const layoutStore = useLayoutStore();

useConnectMic();

/** 收到邀请时自动切到连麦 tab，确保自定义邀请界面可见 */
watch(
  () => unref(inviteStatus) && !unref(isConnectMicing),
  inviting => {
    if (inviting) {
      layoutStore.$patch({ pcAsideTabCurrentName: TAB_NAME_CONNECT_MIC });
    }
  },
);
</script>

<style lang="scss">
.c-pc-connect-mic-v2 {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-connect-mic-v2__list {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.c-pc-connect-mic-v2__not-support {
  position: absolute;
  top: 16px;
  right: 16px;
  left: 16px;
  z-index: 3;
  padding: 6px 16px;
  font-size: 14px;
  line-height: 20px;
  color: #333;
  text-align: center;
  background-color: #fff4c1;
  border-radius: 2px;
}
</style>
