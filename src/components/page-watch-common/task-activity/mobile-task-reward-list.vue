<!-- 移动端任务活动 -->
<template>
  <div
    ref="scrollRef"
    class="c-mobile-task-reward-list"
    @scroll="onScroll"
  >
    <div class="c-mobile-task-reward-list__inner">
      <div
        v-for="(item, index) in rewardList"
        :key="index"
        class="c-mobile-task-reward-list__item"
      >
        <div class="c-mobile-task-reward-list__item__title">
          {{ $lang('taskActivity.rewardGeted', { content: getTaskRewardText(item.taskReward) }) }}
        </div>
        <div class="c-mobile-task-reward-list__item__desc">
          {{
            $lang('taskActivity.rewardGetCondition', { content: getTaskReachText(item.taskReach) })
          }}
        </div>
        <div class="c-mobile-task-reward-list__item__desc">
          {{
            $lang('taskActivity.rewardGetTime', {
              content: formatDate(item.finishTime, DATE_FORMAT_COMPLETE),
            })
          }}
        </div>
        <div
          v-if="canShowRewardStatus(item)"
          class="c-mobile-task-reward-list__item__status"
          :class="['c-mobile-task-reward-list__item__status--' + item.rewardStatus]"
          @click="openErrorTips(item)"
        >
          {{ getRewardStatusText(item.rewardStatus) }}

          <mobile-icon-question-round
            v-if="item.outTradeErrCode"
            class="c-mobile-task-reward-list__item__status__icon"
          />
        </div>

        <div
          v-if="
            item.taskReward.type === TaskActivityRewardType.Cash &&
            item.rewardStatus === TaskRewardStatus.NotIssued
          "
          class="c-mobile-task-reward-list__item__reward-desc"
        >
          {{ $lang('taskActivity.rewardDesc') }}
        </div>

        <!-- 领取按钮 -->
        <div
          v-if="
            item.acceptInfo?.activeAcceptEnabled === 'Y' &&
            item.taskReward.type === TaskActivityRewardType.Custom
          "
          class="c-mobile-task-reward-list__item__receive"
          @click="openReceive(item)"
        >
          {{
            item.acceptInfo.received === 'N'
              ? $lang('taskActivity.rewardReceive.receive')
              : $lang('taskActivity.rewardReceive.look')
          }}
        </div>
      </div>
    </div>
    <div
      v-if="rewardList.length === 0"
      class="c-mobile-task-reward-list__empty"
    >
      {{ $lang('taskActivity.emptyReward') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import { MobileIconQuestionRound } from '@/components/component-icons/mobile/map';
import { TaskActivityRewardType, TaskRewardStatus } from '@polyv/live-watch-sdk';
import { formatDate } from '@polyv/utils/date';
import { useTaskRewardList } from './hooks/use-task-reward-list';
import { useTaskActivityText } from './use-task-activity';

const {
  scrollRef,
  onScroll,
  rewardList,
  getRewardStatusText,
  openReceive,
  openErrorTips,
  canShowRewardStatus,
} = useTaskRewardList();

const { getTaskRewardText, getTaskReachText } = useTaskActivityText();
</script>

<style lang="scss">
.c-mobile-task-reward-list {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 0 12px 12px;
  overflow-y: auto;
}
.c-mobile-task-reward-list__inner {
  background-color: #fff;
  border-radius: 12px;
}
.c-mobile-task-reward-list__item {
  position: relative;
  z-index: 10;
  padding: 16px 0;
  margin: 0 16px;
  border-bottom: 1px solid rgba(#000, 0.06);
}
.c-mobile-task-reward-list__item__title {
  padding-right: 60px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  line-height: 19px;
  color: #333a47;
}
.c-mobile-task-reward-list__item__desc {
  font-size: 12px;
  line-height: 17px;
  color: #9aa4b3;

  & + & {
    margin-top: 4px;
  }
}
.c-mobile-task-reward-list__item__status {
  position: absolute;
  top: 13px;
  right: 0;
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 26px;

  &.c-mobile-task-reward-list__item__status--0,
  &.c-mobile-task-reward-list__item__status--2,
  &.c-mobile-task-reward-list__item__status--3,
  &.c-mobile-task-reward-list__item__status---1 {
    color: #3f76fc;
  }

  &.c-mobile-task-reward-list__item__status--1 {
    color: #9aa4b3;
  }

  &.c-mobile-task-reward-list__item__status--3 {
    color: #fe3f52;
  }
}

.c-mobile-task-reward-list__item__status__icon {
  display: flex;
  margin-left: 2px;
  font-size: 12px;
}

.c-mobile-task-reward-list__item__reward-desc {
  position: absolute;
  top: 37px;
  right: 18px;
  font-size: 12px;
  line-height: 17px;
  color: #9aa4b3;
}
.c-mobile-task-reward-list__item__receive {
  position: absolute;
  right: 0;
  bottom: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  height: 28px;
  padding: 0 15px;
  font-size: 12px;
  color: #fe3f52;
  text-align: center;
  background: #ffffff;
  border: 1px solid #fe3f52;
  border-radius: 14px;
}
.c-mobile-task-reward-list__empty {
  position: absolute;
  top: 0;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999999;
  background: #fff;
  border-radius: 12px;
  &::before {
    width: 65px;
    height: 65px;
    margin-bottom: 12px;
    content: '';
    background-image: url(./images/empty-reward.png);
    background-size: contain;
  }
}
</style>
