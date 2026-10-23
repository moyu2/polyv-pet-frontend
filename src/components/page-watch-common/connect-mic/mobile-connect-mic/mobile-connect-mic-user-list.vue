<!-- @file 移动端连麦用户列表 -->
<template>
  <div class="c-mobile-connect-mic-user-list">
    <div class="c-mobile-connect-mic-user-list__content">
      <div
        v-for="micItem in filterConnectMicList"
        :key="micItem.streamId"
        class="c-mobile-connect-mic-user-list__item"
      >
        <div class="c-mobile-connect-mic-user-list__item-wrap">
          <div class="c-mobile-connect-mic-user-list__item-inner">
            <mobile-connect-mic-user-item
              :mic-item="micItem"
              :fit-type="connectMicFitType"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileConnectMicUserItem from './mobile-connect-mic-user-item.vue';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { filterConnectMicList, connectMicFitType } = storeDefinitionToRefs(useConnectMicStore);
</script>

<style lang="scss">
.c-mobile-connect-mic-user-list {
  width: 100%;
  height: 100%;
}
.c-mobile-connect-mic-user-list__content {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.c-mobile-connect-mic-user-list__item {
  flex-shrink: 0;
  width: 33.33%;
}

.c-mobile-connect-mic-user-list__item-wrap {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56%;
}
.c-mobile-connect-mic-user-list__item-inner {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
