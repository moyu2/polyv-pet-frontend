<!-- @file PC 端连麦用户列表 -->
<template>
  <div class="c-pc-connect-mic-user-list g-clearfix pws-main-tab-body-scrollbar">
    <div
      v-for="micItem in filterConnectMicList"
      :key="micItem.streamId"
      class="c-pc-connect-mic-user-list__content"
      :class="{
        'c-pc-connect-mic-user-list__content--only-one': filterConnectMicList.length === 1,
      }"
    >
      <div class="c-pc-connect-mic-user-list__item-wrap">
        <div class="c-pc-connect-mic-user-list__item-inner">
          <pc-connect-mic-user-item
            :mic-item="micItem"
            :fit-type="connectMicFitType"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PcConnectMicUserItem from './pc-connect-mic-user-item.vue';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { filterConnectMicList, connectMicFitType } = storeDefinitionToRefs(useConnectMicStore);
</script>

<style lang="scss">
.c-pc-connect-mic-user-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  @include scrollbar;
}

.c-pc-connect-mic-user-list__content {
  float: left;
  width: 50%;
}
.c-pc-connect-mic-user-list__content--only-one {
  width: 100%;
}

.c-pc-connect-mic-user-list__item-wrap {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56%;
}
.c-pc-connect-mic-user-list__item-inner {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
