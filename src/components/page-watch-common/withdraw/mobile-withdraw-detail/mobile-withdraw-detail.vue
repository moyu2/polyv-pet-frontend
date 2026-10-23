<!-- @file 移动端横屏-提现详情页 -->
<template>
  <mobile-popup
    class="c-mobile-withdraw-detail"
    :title="$lang('withdraw.detail.popup.title')"
    :visible.sync="popupVisible"
    fill-body-section
    hide-header-border
    append-to-body
    content-background="#F5F5F6"
  >
    <div class="c-mobile-withdraw-detail__container">
      <div
        class="c-mobile-withdraw-detail__main"
        @scroll="debounceHandleDetailMainScroll"
      >
        <div class="c-mobile-withdraw-detail__info">
          <div class="c-mobile-withdraw-detail__info__title">
            {{ $lang('withdraw.detail.balance') }}
          </div>
          <p class="c-mobile-withdraw-detail__info__balance">
            ￥<span>{{ totalAmount }}</span>
          </p>
          <normal-button
            class="c-mobile-withdraw-detail__info__btn"
            :size="ButtonSize.Mini"
            :type="ButtonType.Aggravate"
            :text="$lang('withdraw.detail.btn.text')"
            @click="handleShowWithdrawApply"
          />
          <div class="c-mobile-withdraw-detail__info__amount-wrap">
            <p>{{ $lang('withdraw.redpack.receive.record') }}：￥{{ totalReceive }}</p>
            <p>{{ $lang('withdraw.cash.receive.record') }}：￥{{ totalWithdraw }}</p>
          </div>
        </div>

        <div class="c-mobile-withdraw-detail__table">
          <!-- 先不将 tabs 抽成组件，目前只用作简单的切换 -->
          <ul class="c-mobile-withdraw-detail__tabs">
            <li
              v-for="(tab, index) in detailTabs"
              class="c-mobile-withdraw-detail__tab"
              :class="{
                'c-mobile-withdraw-detail__tab--active': tab.value === curTab,
              }"
              :key="index"
              @click="curTab = tab.value"
            >
              {{ tab.label }}
            </li>
          </ul>
          <div class="c-mobile-withdraw-detail__panel-wrap">
            <mobile-redpack-receive-record
              ref="redpackReceiveRecordRef"
              v-if="curTab === WithdrawDetailTab.RedpackReceiveRecord"
            />
            <mobile-cash-receive-record
              ref="cashReceiveRecordRef"
              v-if="curTab === WithdrawDetailTab.CashReceiveRecord"
            />
          </div>
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { ref } from 'vue';
import MobileCashReceiveRecord from './mobile-cash-receive-record.vue';
import MobileRedpackReceiveRecord from './mobile-redpack-receive-record.vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { WithdrawDetailTab, useWithdrawDetailHook } from '../_hooks/use-withdraw-detail';

const { getEmitter } = useGlobalInject();

const {
  totalAmount,
  totalReceive,
  totalWithdraw,
  curTab,
  detailTabs,

  initWithdrawDetail,
  resetWithdrawDetail,

  redpackReceiveRecordRef,
  cashReceiveRecordRef,
  debounceHandleDetailMainScroll,
} = useWithdrawDetailHook();

const popupVisible = ref(false);

useEventBusListener(appEvents.withdraw.OpenWithdrawDetail, handleWithdrawDetailPopupVisible);

/** "提现详情" OpenWithdrawDetail 事件钩子 */
function handleWithdrawDetailPopupVisible(visible: boolean) {
  if (visible) {
    initWithdrawDetail();
  } else {
    resetWithdrawDetail();
  }
  popupVisible.value = visible;
}

/** 展示提现申请 */
function handleShowWithdrawApply() {
  getEmitter().emit(appEvents.withdraw.OpenWithdrawApply, true);
}
</script>

<style lang="scss">
.c-mobile-withdraw-detail__container {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
}
.c-mobile-withdraw-detail__main {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
}

.c-mobile-withdraw-detail__info {
  position: relative;
  box-sizing: border-box;
  height: 130px;
  padding: 14px 24px 0;
  margin: 6px 12px 12px;
  overflow: hidden;
  background-image: url('../images/withdraw-detail-info-bg.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 112%;
  border-radius: 12px;
}
.c-mobile-withdraw-detail__info__title {
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 17px;
  color: rgba(#000, 0.4);
}
.c-mobile-withdraw-detail__info__balance {
  font-size: 16px;
  color: #333;
  @include alibaba-font(20px, bold);
  span {
    font-size: 30px;
    font-weight: bold;
  }
}
.c-mobile-withdraw-detail__info__btn {
  position: absolute;
  top: 25px;
  right: 32px;
  background: linear-gradient(115deg, #ff5031 0%, #ff9e63 98%) !important;
}
.c-mobile-withdraw-detail__info__amount-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  font-size: 12px;
  color: rgba(#000, 0.4);
  background: #fff;
  border-radius: 12px;
  p {
    position: relative;
    flex: 1;
    text-align: center;

    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: 1px;
      height: 12px;
      content: '';
      background: rgba(#000, 0.2);
      transform: translateY(-50%);
    }

    &:first-of-type::before {
      display: none;
    }
  }
}

.c-mobile-withdraw-detail__table {
  margin: 0 12px 24px;
  background: #fff;
  border-radius: 12px;
}

.c-mobile-withdraw-detail__tabs {
  position: sticky;
  top: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 8px;
  font-size: 14px;
  line-height: 36px;
  color: rgba(#000, 0.6);
  background: #fff;
  border-radius: 12px 12px 0 0;
}
.c-mobile-withdraw-detail__tab {
  min-width: 96px;
  height: 36px;
  margin-right: 4px;
  text-align: center;
  &::after {
    position: absolute;
    bottom: 3px;
    left: 50%;
    width: 16px;
    height: 2px;
    content: '';
    background-color: #3082fe;
    border-radius: 1px;
    opacity: 0;
    transform: translateX(-50%);
  }
  &--active {
    position: relative;
    font-weight: bold;
    color: rgba(#000, 0.8);
    &::after {
      opacity: 1;
      transition: all 0.3s ease-in;
    }
  }
}
</style>
