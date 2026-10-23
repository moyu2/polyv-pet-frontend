<!-- @file 连麦网络状态 -->
<template>
  <div
    class="c-connect-mic-network"
    :class="{
      'c-connect-mic-network--good':
        networkStatus === NetworkStatus.Unknown || networkStatus === NetworkStatus.Good,
      'c-connect-mic-network--ordinary': networkStatus === NetworkStatus.Ordinary,
      'c-connect-mic-network--bad': networkStatus === NetworkStatus.Bad,
    }"
  >
    <div class="c-connect-mic-network__item"></div>
    <div class="c-connect-mic-network__item"></div>
    <div class="c-connect-mic-network__item"></div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';
import { NetworkStatus } from '@polyv/live-watch-sdk';

defineProps({
  /** 网络状态 */
  networkStatus: PropUtils.enum<NetworkStatus>().def(NetworkStatus.Unknown),
});
</script>

<style lang="scss">
.c-connect-mic-network {
  display: flex;
  align-items: flex-end;
  padding: 7px;
}
.c-connect-mic-network__item {
  width: 2px;
  margin-left: 2px;
  background: rgba($--color-white, 0.4);

  &:nth-of-type(1) {
    height: 5px;
    margin-left: 0;
  }
  &:nth-of-type(2) {
    height: 8px;
  }
  &:nth-of-type(3) {
    height: 10px;
  }
}

.c-connect-mic-network--good {
  .c-connect-mic-network__item {
    background: #3ac53a;
  }
}

.c-connect-mic-network--ordinary {
  .c-connect-mic-network__item:nth-of-type(1) {
    background: #ca1300;
  }
}

.c-connect-mic-network--bad {
  .c-connect-mic-network__item:nth-of-type(1),
  .c-connect-mic-network__item:nth-of-type(2) {
    background: #ff9500;
  }
}
</style>
