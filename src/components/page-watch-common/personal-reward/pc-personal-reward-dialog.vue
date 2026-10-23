<template>
  <pc-side-popup
    class="c-pc-personal-reward-popup"
    :title="$lang('personalReward.myReward')"
    :visible.sync="visible"
  >
    <template #title>
      <div class="c-pc-personal-reward-popup__header">
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
    <div class="c-pc-personal-reward-popup__content">
      <div class="c-pc-personal-reward-popup__switch-container">
        <div class="c-pc-personal-reward-popup__switch">
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
      </div>

      <div class="c-pc-personal-reward-popup__inner">
        <pc-task-reward-list v-if="currentType === 'task-activity'" />
        <pc-lottery-record-list v-if="currentType === 'lottery'" />
        <pc-lucky-lottery-prize-list v-if="currentType === 'lucky-lottery'" />
        <lucky-bag-win-record v-if="currentType === 'lucky-bag'" />
        <live-activity-win-record v-if="currentType === 'live-activity'" />
      </div>
    </div>
  </pc-side-popup>
</template>

<script setup lang="ts">
import { LangType } from '@/assets/lang/lang-enum';
import PcSidePopup from '@/components/common-base/side-popup/pc-side-popup.vue';
import PcLotteryRecordList from '../interactive-receive-v2/lottery-v2/lottery-record-list/pc-lottery-record-list.vue';
import PcTaskRewardList from '../task-activity/pc-task-reward-list.vue';
import PcLuckyLotteryPrizeList from '../interactive-receive-v2/lucky-lottery/mobile-lucky-lottery-prize-list.vue';
import LuckyBagWinRecord from '../interactive-receive-v2/lucky-bag/lucky-bag-win-record.vue';
import LiveActivityWinRecord from '../live-activity/live-activity-win-record.vue';
import { usePersonalReward } from './use-personal-reward';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { visible, rewardTypes, currentType } = usePersonalReward();
</script>

<style lang="scss">
.c-pc-personal-reward-popup {
  background: linear-gradient(180deg, #fee5e1 0%, #fef9f4 100%);

  .c-pc-side-popup__header {
    height: 66px;
    background: none;
  }
  .c-pc-dialog__content {
    overflow: hidden;
    background: linear-gradient(144deg, #f2d1ef 0%, #fdf2df 100%);
    &::before {
      position: absolute;
      top: 0;
      right: -7px;
      z-index: 1;
      width: 216px;
      height: 113px;
      pointer-events: none;
      content: '';
      background: linear-gradient(254deg, #ef8767 -8%, #f9dec5 57%);
      filter: blur(70px);
      border-radius: 50%;
    }
  }
}

.c-pc-personal-reward-popup__header {
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

.c-pc-personal-reward-popup__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-pc-personal-reward-popup__switch-container {
  box-sizing: border-box;
  display: flex;
  padding: 0 12px;
  margin-bottom: 16px;
}

.c-pc-personal-reward-popup__switch {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px;
  background: linear-gradient(
    97deg,
    rgba(254, 150, 104, 0.2) 0%,
    rgba(254, 63, 82, 0.2) 49%,
    rgba(255, 86, 145, 0.2) 100%
  );
  border-radius: 8px;

  span {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    height: 22px;
    padding: 2px 12px;
    font-size: 12px;
    color: #666666;
    color: #8e1e33;
    cursor: pointer;

    &.is-active {
      background: #fff5fb;
      border: 1px solid #fff8f8;
      border-radius: 6px;
    }
  }
}

.c-pc-personal-reward-popup__inner {
  flex: 1;
  overflow: hidden;
}
</style>
