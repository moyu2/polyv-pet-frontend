<template>
  <mobile-dialog
    class="c-mobile-task-activity-finish"
    :visible.sync="visible"
    :show-header="false"
    :show-footer="false"
    :close-on-click-mask="false"
    :content-style="{
      background: 'none',
      width: '256px',
      borderRadius: '0',
      overflow: 'visible !important',
    }"
    :custom-close="closeCurrent"
  >
    <div class="c-mobile-task-activity-finish__body">
      <div class="c-mobile-task-activity-finish__title">
        <span>{{ $lang('taskActivity.finish.title') }}</span>
      </div>
      <div class="c-mobile-task-activity-finish__content">
        <div class="c-mobile-task-activity-finish__content__inner">
          <div
            class="c-mobile-task-activity-finish__name"
            :class="{
              'c-mobile-task-activity-finish__name--custom':
                currentData?.taskReward.type === TaskActivityRewardType.Custom,
            }"
          >
            {{ name }}
          </div>
          <div
            v-if="amount"
            class="c-mobile-task-activity-finish__amount"
          >
            {{ amount }}<span>{{ unit }}</span>
          </div>

          <div
            class="c-mobile-task-activity-finish__button"
            @click="onClickButton"
          >
            {{ buttonText }}
          </div>
          <div
            v-if="canWithdraw"
            class="c-mobile-task-activity-finish__tips"
          >
            {{ $lang('taskActivity.finish.tips') }}
          </div>
        </div>
      </div>
    </div>
  </mobile-dialog>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';
import MobileDialog from '@/components/common-base/dialog/mobile-dialog/mobile-dialog.vue';
import { useWithdrawApplyEntry } from '@/components/page-watch-common/withdraw/_hooks/use-withdraw-apply-entry';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import {
  TaskActivityEvents,
  TaskActivityRewardType,
  YN,
  type TaskActivityFinishData,
} from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { TaskActivityEventsRelations } from '@polyv/live-watch-sdk';

const { getWatchCore, getEmitter } = useGlobalInject();
const { withdrawApplyEnabled, openWithdrawApply } = useWithdrawApplyEntry();

const watchCore = getWatchCore();

const config = watchCore.taskActivity.getTaskActivityConfig();

const { visible, show, close } = useSimpleVisible(false);

const dataList = ref<TaskActivityFinishData[]>([]);

const currentData = computed<TaskActivityFinishData | undefined>(() => {
  return dataList.value[dataList.value.length - 1];
});

function closeCurrent() {
  if (dataList.value.length > 0) {
    dataList.value.pop();
  }

  if (dataList.value.length === 0) {
    close();
  }
}

/**
 * 名称
 */
const name = computed(() => {
  if (!currentData.value) {
    return '';
  }
  const { taskReward } = currentData.value;

  switch (taskReward.type) {
    case TaskActivityRewardType.Cash:
      return translate('taskActivity.finish.redpack');
    case TaskActivityRewardType.Point:
    case TaskActivityRewardType.ExternalPoint:
      return translate('taskActivity.finish.point');
    default:
      return taskReward.customReward;
  }
});

/**
 * 金额/数量
 */
const amount = computed(() => {
  if (!currentData.value) {
    return '';
  }
  const { taskReward } = currentData.value;

  switch (taskReward.type) {
    case TaskActivityRewardType.Cash:
    case TaskActivityRewardType.Point:
    case TaskActivityRewardType.ExternalPoint:
      return taskReward.amount;
    default:
      return '';
  }
});

/**
 * 单位
 */
const unit = computed(() => {
  if (!currentData.value) {
    return '';
  }
  const { taskReward } = currentData.value;

  switch (taskReward.type) {
    case TaskActivityRewardType.Cash:
      return translate('taskActivity.finish.unit1');
    case TaskActivityRewardType.ExternalPoint:
      return config.externalPointUnit;
    default:
      return '';
  }
});

/**
 * 是否可以提现
 */
const canWithdraw = computed(() => {
  return (
    withdrawApplyEnabled.value && currentData.value?.taskReward.type === TaskActivityRewardType.Cash
  );
});

const canRecive = computed(() => {
  return (
    currentData.value?.taskReward.type === TaskActivityRewardType.Custom &&
    currentData.value?.acceptInfo?.activeAcceptEnabled === YN.Y
  );
});

/**
 * 按钮文案
 */
const buttonText = computed(() => {
  if (!currentData.value) {
    return '';
  }
  const { taskReward } = currentData.value;

  let text = translate('base.ok');

  switch (taskReward.type) {
    case TaskActivityRewardType.Custom:
      if (canRecive.value) {
        text = translate('invite.activity.result.win.btn.text2');
      }
      break;
    case TaskActivityRewardType.Cash:
      if (canWithdraw.value) {
        text = translate('taskActivity.finish.toWithdraw');
      }
      break;
  }

  return text;
});

function onClickButton() {
  if (canWithdraw.value) {
    openWithdrawApply();
  }

  if (canRecive.value) {
    getEmitter().emit(appEvents.global.OpenTaskRewardReceiveDialog, currentData.value);
  }

  closeCurrent();
}

function setupData(data: TaskActivityEventsRelations[TaskActivityEvents.ObtainReward]) {
  dataList.value.push(data.finishData);
  show();
}

onMounted(() => {
  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.ObtainReward, setupData);
});

onBeforeUnmount(() => {
  watchCore.taskActivity.eventEmitter.off(TaskActivityEvents.ObtainReward, setupData);
});
</script>

<style lang="scss">
.c-mobile-task-activity-finish__body {
  position: relative;
  display: flex;
  flex-direction: column;

  &::before {
    position: absolute;
    top: -14px;
    right: 0;
    z-index: 2;
    width: 107px;
    height: 105px;
    content: '';
    background-image: url('./images/finish-icon.png');
    background-size: 100% 100%;
  }
}

.c-mobile-task-activity-finish__title {
  position: relative;
  box-sizing: border-box;
  width: 174px;
  height: 42px;
  padding-top: 12px;
  padding-left: 35px;
  margin-bottom: -1px;
  overflow: hidden;
  font-size: 22px;
  font-weight: bold;
  line-height: 32px;
  color: #8e1e33;
  border-radius: 16px 16px 0 0;

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 256px;
    height: 100%;
    content: '';
    background: linear-gradient(90deg, #fff1b2 0%, #ffd4c6 100%);
  }

  span {
    position: relative;
    z-index: 2;
  }
}
.c-mobile-task-activity-finish__content {
  box-sizing: border-box;
  height: 206px;
  padding: 16px 8px 8px;
  background: linear-gradient(90deg, #fff1b2 0%, #ffd4c6 100%);
  border-radius: 0 16px 16px 16px;
}

.c-mobile-task-activity-finish__content__inner {
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-top: 24px;
  background-color: #fff;
  border-radius: 16px;
}

.c-mobile-task-activity-finish__name {
  position: relative;
  max-width: 120px;
  font-size: 18px;
  line-height: 25px;
  color: #8e1e33;

  &.c-mobile-task-activity-finish__name--custom {
    display: flex;
    align-items: center;
    min-height: 50px;
    text-align: center;
  }

  &::before,
  &::after {
    position: absolute;
    top: 50%;
    width: 13px;
    height: 8px;
    content: '';
    background-image: url(./images/finish-arrow.png);
    background-size: 100% 100%;
    transform: translateY(-50%);
  }

  &::before {
    left: -25px;
  }

  &::after {
    right: -25px;
    transform: translateY(-50%) rotateZ(180deg);
  }
}

.c-mobile-task-activity-finish__amount {
  margin-top: 2px;
  font-family: DINPro-Medium;
  font-size: 40px;
  line-height: 47px;
  color: #ed3835;
  span {
    margin-left: 2px;
    font-size: 12px;
    line-height: 15px;
  }
}

.c-mobile-task-activity-finish__button {
  position: absolute;
  bottom: 32px;
  left: 50%;
  width: 140px;
  height: 36px;
  font-size: 12px;
  line-height: 36px;
  color: #fff;
  text-align: center;
  background: linear-gradient(104deg, #ff5031 0%, #ff9e63 98%);
  border-radius: 18px;
  transform: translateX(-50%);
}
.c-mobile-task-activity-finish__tips {
  position: absolute;
  bottom: 9px;
  left: 50%;
  font-size: 12px;
  color: #8e1e33;
  white-space: nowrap;
  transform: translateX(-50%);
}
</style>
