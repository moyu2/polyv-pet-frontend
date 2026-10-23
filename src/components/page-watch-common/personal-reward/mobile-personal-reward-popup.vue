<template>
  <mobile-popup
    class="c-mobile-personal-reward-popup"
    content-class="c-mobile-personal-reward-popup__body"
    :visible.sync="visible"
    fill-body-section
    :closable="false"
    :mask-opacity="0"
  >
    <template #title>
      <div
        class="c-mobile-personal-reward-popup__back"
        @click="close"
      >
        <mobile-icon-close class="c-mobile-personal-reward-popup__back__icon" />
      </div>
      <div class="c-mobile-personal-reward-popup__header">
        <img
          v-if="currentLang === LangType.ZH_CN"
          src="./images/mobile-reward-title-cn.png"
        />
        <img
          v-else
          src="./images/mobile-reward-title-en.png"
        />
      </div>
    </template>

    <div class="c-mobile-personal-reward-popup__content">
      <div class="c-mobile-personal-reward-popup__switch">
        <div
          ref="switchInnerRef"
          class="c-mobile-personal-reward-popup__switch__inner"
        >
          <span
            v-for="item in rewardTypes"
            :key="item.type"
            :class="{
              'is-active': item.type === currentType,
            }"
            @click="currentType = item.type"
          >
            {{ item.text }}
          </span>
        </div>

        <div
          v-if="withdrawVisible && weixinPayType === WeixinPayType.TransferBill"
          class="c-mobile-personal-reward-popup__switch__withdraw"
          @click="openWithdraw"
        >
          <span>{{ $lang('personalReward.withdraw') }}</span>
          <mobile-icon-arrow-right class="c-mobile-personal-reward-popup__switch__withdraw__icon" />
        </div>
      </div>

      <div class="c-mobile-personal-reward-popup__inner">
        <mobile-task-reward-list v-if="currentType === 'task-activity'" />
        <mobile-lottery-record-list v-if="currentType === 'lottery'" />
        <mobile-lucky-lottery-prize-list v-if="currentType === 'lucky-lottery'" />
        <lucky-bag-win-record v-if="currentType === 'lucky-bag'" />
        <live-activity-win-record v-if="currentType === 'live-activity'" />
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { LangType } from '@/assets/lang/lang-enum';
import MobilePopup from '@/components/common-base/popup';
import { MobileIconClose, MobileIconArrowRight } from '@/components/component-icons/mobile/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import MobileLotteryRecordList from '../interactive-receive-v2/lottery-v2/lottery-record-list/mobile-lottery-record-list.vue';
import MobileTaskRewardList from '../task-activity/mobile-task-reward-list.vue';
import MobileLuckyLotteryPrizeList from '../interactive-receive-v2/lucky-lottery/mobile-lucky-lottery-prize-list.vue';
import LuckyBagWinRecord from '../interactive-receive-v2/lucky-bag/lucky-bag-win-record.vue';
import LiveActivityWinRecord from '../live-activity/live-activity-win-record.vue';
import { usePersonalReward } from './use-personal-reward';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWeixinStore } from '@/store/use-weixin-store';
import { WeixinPayType } from '@polyv/live-watch-sdk';
import { nextTick, ref, watch } from 'vue';

const { getEmitter } = useGlobalInject();

const { visible, close, rewardTypes, currentType } = usePersonalReward();

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { weixinPayType } = storeDefinitionToRefs(useWeixinStore);

const switchInnerRef = ref<HTMLElement>();

watch([currentType, visible], async ([, isVisible]) => {
  if (!isVisible) {
    return;
  }
  await nextTick();
  const container = switchInnerRef.value;
  const activeTab = container?.querySelector<HTMLElement>('.is-active');
  if (!container || !activeTab) {
    return;
  }
  container.scrollLeft = Math.max(
    0,
    activeTab.offsetLeft - (container.clientWidth - activeTab.offsetWidth) / 2,
  );
});

function openWithdraw() {
  getEmitter().emit(appEvents.withdraw.OpenWithdrawDetail, true);
}
</script>

<style lang="scss">
.c-mobile-personal-reward-popup__body {
  overflow: hidden;
  background: linear-gradient(180deg, #fee5e1 0%, #fef9f4 100%);
  &::before {
    position: absolute;
    top: -26px;
    right: -87px;
    z-index: 1;
    width: 176px;
    height: 168px;
    content: '';
    background: #fdf0d5;
    filter: blur(80px);
    border-radius: 50%;
  }
  .c-mobile-popup__body {
    z-index: 2;
  }

  .c-mobile-popup__header {
    height: 66px;
    border-bottom: none;
  }
  .c-mobile-popup__header__title {
    position: relative;
    height: 66px;
    line-height: 66px;
  }
}

.c-mobile-personal-reward-popup__back {
  position: absolute;
  top: 50%;
  left: 12px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 20px;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  transform: translateY(-50%);
}
.c-mobile-personal-reward-popup__back__icon {
  display: flex;
}

.c-mobile-personal-reward-popup__header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    height: 20px;
    margin-right: 12px;
    margin-left: 12px;
  }

  &::before,
  &::after {
    width: 15px;
    height: 11px;
    content: '';
    background-position: center;
    background-size: cover;
  }

  &::before {
    background-image: url(./images/mobile-title-left.png);
  }
  &::after {
    background-image: url(./images/mobile-title-right.png);
  }
}

.c-mobile-personal-reward-popup__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-mobile-personal-reward-popup__switch {
  display: flex;
  align-items: center;
  padding: 0 12px;
  margin-bottom: 16px;
}

.c-mobile-personal-reward-popup__switch__inner {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 3px;
  overflow-x: auto;
  scrollbar-width: none;
  background: linear-gradient(
    97deg,
    rgba(254, 150, 104, 0.2) 0%,
    rgba(254, 63, 82, 0.2) 49%,
    rgba(255, 86, 145, 0.2) 100%
  );
  border-radius: 8px;

  &::-webkit-scrollbar {
    display: none;
  }

  & > span {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    height: 22px;
    padding: 0 8px;
    font-size: 12px;
    color: #8e1e33;
    border-radius: 6px;

    &.is-active {
      font-weight: bold;
      background: #fff5fb;
    }
  }
}

.c-mobile-personal-reward-popup__switch__withdraw {
  display: flex;
  align-items: center;
  margin-left: auto;
  font-size: 12px;
  font-weight: bold;
  color: #8e1e33;
}
.c-mobile-personal-reward-popup__switch__withdraw__icon {
  display: flex;
}

.c-mobile-personal-reward-popup__inner {
  flex: 1;
  overflow: hidden;
}
</style>
