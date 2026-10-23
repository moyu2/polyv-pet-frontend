<!-- @file PC 端连麦 -->
<template>
  <div class="c-pc-connect-mic">
    <div class="c-pc-connect-mic__body">
      <!-- 占位图 -->
      <pc-connect-mic-placeholder
        v-if="[ConnectMicStatus.NotConnect, ConnectMicStatus.Applying].includes(connectMicStatus)"
      />

      <!-- 连麦用户列表 -->
      <pc-connect-mic-user-list v-if="connectMicList.length" />
    </div>

    <!-- 不支持提示 -->
    <div
      v-if="!supportConnectMic"
      class="c-pc-connect-mic__not-support"
    >
      {{ $lang('connectMic.error.notSupport1') }}<br />{{ $lang('connectMic.error.notSupport2') }}
    </div>

    <!-- 底部按钮 -->
    <pc-connect-mic-bottom />

    <!-- 结束二次确认 -->
    <pc-connect-mic-confirm />
  </div>
</template>

<script setup lang="ts">
import PcConnectMicBottom from './pc-connect-mic-bottom.vue';
import PcConnectMicConfirm from './pc-connect-mic-confirm.vue';
import PcConnectMicPlaceholder from './pc-connect-mic-placeholder.vue';
import PcConnectMicUserList from './pc-connect-mic-user-list.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicStatus } from '@polyv/live-watch-sdk';
import { useConnectMic } from '../hooks/use-connect-mic';

const { connectMicStatus, connectMicList, supportConnectMic } =
  storeDefinitionToRefs(useConnectMicStore);

useConnectMic();
</script>

<style lang="scss">
.c-pc-connect-mic {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-connect-mic__body {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.c-pc-connect-mic__not-support {
  position: absolute;
  top: 16px;
  right: 16px;
  left: 16px;
  padding: 6px 16px;
  font-size: 14px;
  line-height: 20px;
  color: #333;
  text-align: center;
  background-color: #fff4c1;
  border-radius: 2px;
}
</style>
