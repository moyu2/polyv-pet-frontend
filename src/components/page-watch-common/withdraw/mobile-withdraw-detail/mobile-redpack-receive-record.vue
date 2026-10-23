<!-- @file 移动端横屏-提现详情-红包领取记录(现金) -->
<template>
  <ul class="c-mobile-redpack-receive-record">
    <li
      v-for="record in receiveRecordList"
      :key="record.logId"
      class="c-mobile-redpack-receive-record__item"
    >
      <div>
        <p class="c-mobile-redpack-receive-record__item-type">
          {{ getRedpackType(record.redPackType) }}
        </p>
        <p class="c-mobile-redpack-receive-record__item-date">
          {{ convertReceiveDate(record.receiveTime) }}
        </p>
      </div>
      <p class="c-mobile-redpack-receive-record__item-amount">
        +￥{{ convertAmount(record.amount) }}
      </p>
    </li>
    <li
      v-show="loadingVisible"
      class="c-mobile-redpack-receive-record__item--loading"
    >
      <list-loading />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import listLoading from '@/components/common-base/list-loading/list-loading.vue';

import { RedpackPayType, RedpackType } from '@polyv/live-watch-sdk';
import { useReceiveRecordHook } from '../_hooks/use-receive-record';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const {
  loadingVisible,
  receiveRecordList,

  convertReceiveDate,
  convertAmount,
  getReceiveRecordList,
} = useReceiveRecordHook({
  fetchMethod: params => watchCore.redpack.getRedpackReceiveRecord(params),
  fetchMethodParams: {
    redPackType: RedpackPayType.Cash,
  },
  errMsg: translate('redpack.receive.history.error'),
});

function getRedpackType(redPackType: RedpackType) {
  if (redPackType === RedpackType.TaskWard) {
    return translate('withdraw.redpack.receive.record.listName2');
  }
  return translate('withdraw.redpack.receive.record.listName');
}

onMounted(async () => {
  await getReceiveRecordList();
});

defineExpose({
  getReceiveRecordList,
});
</script>

<style lang="scss">
.c-mobile-redpack-receive-record {
  height: 100%;
  overflow: auto;
}
.c-mobile-redpack-receive-record__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.c-mobile-redpack-receive-record__item-type {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(#000, 0.8);
}
.c-mobile-redpack-receive-record__item-date {
  font-size: 12px;
  line-height: 18px;
  color: rgba(#000, 0.4);
}
.c-mobile-redpack-receive-record__item-amount {
  color: #3f76fc;
}
.c-mobile-redpack-receive-record__item--loading {
  padding: 16px 0;
  text-align: center;
}
</style>
