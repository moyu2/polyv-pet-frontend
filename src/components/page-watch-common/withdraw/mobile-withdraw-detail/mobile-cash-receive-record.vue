<!-- @file 移动端横屏-提现详情-提现记录 -->
<template>
  <ul class="c-mobile-cash-receive-record">
    <li
      class="c-mobile-cash-receive-record__item"
      v-for="record in receiveRecordList"
      :key="record.withdrawId"
    >
      <div>
        <p
          class="c-mobile-cash-receive-record__item-type"
          @click="handleError(record)"
        >
          {{ getWithdrawStatusText(record.status) }}
          <span
            v-if="record.status === WithdrawStatus.WaitUserConfirm && record.confirmSignData"
            @click="requestMerchantTransfer(record.confirmSignData)"
          >
            {{ $lang('withdraw.cash.receive.record.toConfirm') }}
          </span>
          <mobile-icon-question-round
            v-if="record.status === WithdrawStatus.Fail && record.outTradeErrCode"
            class="c-mobile-cash-receive-record__item__error"
          />
        </p>
        <p class="c-mobile-cash-receive-record__item-date">
          {{ convertReceiveDate(record.applyTime) }}
        </p>
      </div>
      <p class="c-mobile-cash-receive-record__item-amount">-￥{{ convertAmount(record.amount) }}</p>
    </li>
    <li
      v-show="loadingVisible"
      class="c-mobile-cash-receive-record__item--loading"
    >
      <list-loading />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import listLoading from '@/components/common-base/list-loading/list-loading.vue';

import { MobileIconQuestionRound } from '@/components/component-icons/mobile/map';
import { WithdrawRecord, WithdrawStatus } from '@polyv/live-watch-sdk';
import { useReceiveRecordHook, getWithdrawStatusText } from '../_hooks/use-receive-record';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWeixinMerchantTransfer } from '@/hooks/platform/use-weixin/use-weixin-merchant-transfer';
import { useWeixinOutTradeError } from '@/hooks/platform/use-weixin/use-weixin-out-trade-erroe';
import { messageBox } from '@/components/common-base/message-box';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const {
  loadingVisible,
  receiveRecordList,

  convertReceiveDate,
  convertAmount,
  getReceiveRecordList,
  refreshList,
} = useReceiveRecordHook({
  fetchMethod: params => watchCore.withdraw.getWithdrawRecord(params),
  errMsg: translate('withdraw.cash.receive.history.error'),
});

const { requestMerchantTransfer } = useWeixinMerchantTransfer({
  successCb: () => refreshList(),
  cancelCb: () => refreshList(),
});

const { getWeixinOutTradeErrorTips } = useWeixinOutTradeError();

function handleError(record: WithdrawRecord) {
  if (record.status !== WithdrawStatus.Fail || !record.outTradeErrCode) {
    return;
  }

  const text = getWeixinOutTradeErrorTips(record.outTradeErrCode);

  messageBox({
    content: text,
    confirmButtonText: translate('base.popup.understood'),
  }).$confirm();
}

onMounted(async () => {
  await getReceiveRecordList();
});

defineExpose({
  getReceiveRecordList,
});
</script>

<style lang="scss">
.c-mobile-cash-receive-record__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.c-mobile-cash-receive-record__item-type {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(#000, 0.8);

  span {
    margin-left: 4px;
    font-size: 12px;
    color: #3f76fc;
  }
}
.c-mobile-cash-receive-record__item-date {
  font-size: 12px;
  line-height: 18px;
  color: rgba(#000, 0.4);
}
.c-mobile-cash-receive-record__item-amount {
  color: #3f76fc;
}
.c-mobile-cash-receive-record__item--loading {
  padding: 16px 0;
  text-align: center;
}

.c-mobile-cash-receive-record__item__error {
  display: flex;
  align-items: center;
  color: #fe3f52 !important;
}
</style>
