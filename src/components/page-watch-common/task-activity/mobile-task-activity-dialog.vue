<!-- 移动端任务活动 -->
<template>
  <mobile-popup
    class="c-mobile-task-activity-dialog"
    content-class="c-mobile-task-activity-dialog__body"
    :visible.sync="visible"
    fill-body-section
    :mask-opacity="0"
    :closable="false"
  >
    <template #title>
      <div class="c-mobile-task-activity-dialog__header">
        <img
          v-if="currentLang === LangType.ZH_CN"
          src="./images/mobile-title-cn.png"
        />
        <img
          v-else
          src="./images/mobile-title-en.png"
        />
      </div>

      <div
        class="c-mobile-task-activity-dialog__my"
        @click="openReward"
      >
        <span>{{ $lang('taskActivity.myReward') }}</span>
        <mobile-icon-arrow-right class="c-mobile-task-activity-dialog__my__icon" />
      </div>
    </template>
    <!-- 网络异常提示 -->
    <div
      v-if="isShowTaskActivityErrorPopper && !taskList.length"
      class="c-mobile-task-activity-dialog__network-error-container"
    >
      <div
        v-if="!retryLoading"
        class="c-mobile-task-activity-dialog__network-error"
      >
        <div class="c-mobile-task-activity-dialog__network-error__icon"></div>
        <div class="c-mobile-task-activity-dialog__network-error__text">
          {{ translate('taskActivity.networkError.title') }}
          <br />
          {{ translate('taskActivity.networkError.tips') }}
        </div>
        <div
          class="c-mobile-task-activity-dialog__network-error__btn"
          @click="onRetryGetTaskList"
        >
          {{ translate('taskActivity.retry') }}
        </div>
      </div>

      <div
        v-if="retryLoading"
        class="c-mobile-task-activity-dialog__network-error__loading"
      >
        <list-loading />
      </div>
    </div>

    <!-- 任务列表 -->
    <div
      v-else
      class="c-mobile-task-activity-dialog__list"
    >
      <div
        v-for="item in taskList"
        :key="item.taskId"
        class="c-mobile-task-activity-dialog__item"
        :class="['c-mobile-task-activity-dialog__item--' + item.status]"
      >
        <div
          class="c-mobile-task-activity-dialog__item__icon"
          :class="['c-mobile-task-activity-dialog__item__icon--' + item.reachCondition.type]"
          :style="{
            backgroundImage: item.reachCondition.customIcon
              ? `url(${item.reachCondition.customIcon})`
              : '',
          }"
        ></div>

        <!-- 标题 -->
        <div class="c-mobile-task-activity-dialog__item__title">{{ getTaskTitle(item) }}</div>

        <!-- 结束时间 -->
        <div class="c-mobile-task-activity-dialog__item__end">
          {{
            $lang('taskActivity.end', { endTime: formatDate(item.endTime, DATE_FORMAT_COMPLETE) })
          }}
        </div>

        <!-- 任务进度 -->
        <template v-if="item.status === TaskActivityStatus.InProgress">
          <div
            v-if="item.reachCondition.type === TaskActivityType.Sign"
            class="c-mobile-task-activity-dialog__item__progress"
          >
            {{
              $lang('taskActivity.signProgress', {
                amount: item.reachCondition.amount,
                schedule: item.reachCondition.currentSchedule || 0,
              })
            }}
          </div>

          <div
            v-if="item.reachCondition.type === TaskActivityType.Online"
            class="c-mobile-task-activity-dialog__item__progress"
          >
            <span>{{ $lang('taskActivity.onlineSurplus') }}</span>
            <count-down
              :second="getSurplusTime(item)"
              hide-zero-hours
              theme="red-square"
              @count-down-finish="onCountDownFinish"
              :custom-time-second="
                onlineTaskUpdateType === OnlineTaskUpdateType.Player
                  ? getSurplusTime(item)
                  : undefined
              "
              ref="countDownRef"
            />
          </div>

          <div
            v-if="item.reachCondition.type === TaskActivityType.Questionnaire"
            class="c-mobile-task-activity-dialog__item__progress"
          >
            {{ $lang('taskActivity.questionnaireNot') }}
          </div>

          <div
            v-if="item.reachCondition.type === TaskActivityType.Custom"
            class="c-mobile-task-activity-dialog__item__progress"
          >
            {{
              $lang('taskActivity.customProgress', {
                amount: item.reachCondition.amount,
                schedule: item.reachCondition.currentSchedule || 0,
                unit: item.reachCondition.customUnit || '',
              })
            }}
          </div>
        </template>

        <div
          v-if="item.status === TaskActivityStatus.Finish"
          class="c-mobile-task-activity-dialog__item__finish"
        >
          {{ getFinishText(item) }}
        </div>

        <div
          v-if="showBtn(item)"
          class="c-mobile-task-activity-dialog__item__btn"
          :class="['c-mobile-task-activity-dialog__item__btn--' + item.status]"
          @click="onClickBtn(item)"
        >
          {{ getButtonText(item) }}
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import { LangType } from '@/assets/lang/lang-enum';
import CountDown from '@/components/common-base/count-down/count-down.vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { TaskActivityStatus, TaskActivityType, OnlineTaskUpdateType } from '@polyv/live-watch-sdk';
import { formatDate } from '@polyv/utils/date';
import { useTaskActivity } from './use-task-activity';
import { ref, onMounted } from 'vue';
import { useTaskActivityStore } from '@/store/use-task-activity-store';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';

const { toast } = useToastManager();

const {
  visible,
  taskList,
  getTaskTitle,
  getButtonText,
  onClickBtn,
  openReward,
  getSurplusTime,
  showBtn,
  onCountDownFinish,
  getFinishText,
  getOnlineTaskUpdateType,
  onlineTaskUpdateType,
} = useTaskActivity();

const { isShowTaskActivityErrorPopper, errorActivityId } =
  storeDefinitionToRefs(useTaskActivityStore);

const countDownRef = ref<InstanceType<typeof CountDown>>();

const { getWatchCore } = useMultiPolyvWatchApp();
const retryLoading = ref(false);

// 重试获取任务列表
async function onRetryGetTaskList() {
  if (!errorActivityId.value) {
    return;
  }

  retryLoading.value = true;
  const watchCore = getWatchCore();
  try {
    await watchCore.taskActivity.setActivityId(errorActivityId.value);
  } catch (error) {
    toast.error(
      `${translate('taskActivity.networkError.title')},${translate(
        'taskActivity.networkError.tips',
      )}`,
    );
  } finally {
    retryLoading.value = false;
  }
}

onMounted(() => {
  getOnlineTaskUpdateType();
});

const { currentLang } = storeDefinitionToRefs(useLangStore);
</script>

<style lang="scss">
.c-mobile-task-activity-dialog {
  .c-mobile-popup__header {
    border-bottom: none;
  }
}

.c-mobile-task-activity-dialog__body {
  overflow: hidden;
  background: linear-gradient(144deg, #f2d1ef 0%, #fdf2df 100%);
  &::before {
    position: absolute;
    top: 0;
    right: -7px;
    width: 216px;
    height: 113px;
    content: '';
    background: linear-gradient(254deg, #ef8767 -8%, #f9dec5 57%);
    filter: blur(70px);
    border-radius: 50%;
  }

  .c-mobile-popup__header {
    height: 66px;
  }
  .c-mobile-popup__header__title {
    position: relative;
    height: 66px;
    line-height: 66px;
  }
}

.c-mobile-task-activity-dialog__header {
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
.c-mobile-task-activity-dialog__my {
  position: absolute;
  top: 50%;
  right: 12px;
  z-index: 30;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  font-size: 10px;
  line-height: 14px;
  color: #6f3827;
  background: linear-gradient(109deg, #f6f3f6 2%, #fbfcec 101%);
  border: 2px solid #ffffff;
  border-radius: 11px;
  transform: translateY(-50%);
}
.c-mobile-task-activity-dialog__my__icon {
  display: flex;
}

.c-mobile-task-activity-dialog__list {
  padding: 0 12px 12px;
}

.c-mobile-task-activity-dialog__item {
  position: relative;
  z-index: 20;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  padding: 16px 16px 16px 62px;
  background-color: #fff;
  border-radius: 12px;

  & + & {
    margin-top: 10px;
  }

  &.c-mobile-task-activity-dialog__item--notStart {
    justify-content: space-between;
    padding-top: 24px;
    padding-bottom: 22px;
  }
}

.c-mobile-task-activity-dialog__item__icon {
  position: absolute;
  top: 50%;
  left: 12px;
  width: 38px;
  height: 38px;
  background-image: url(./images/sign-icon.png);
  background-size: cover;
  transform: translateY(-50%);

  &.c-mobile-task-activity-dialog__item__icon--online {
    background-image: url(./images/online-icon.png);
  }
  &.c-mobile-task-activity-dialog__item__icon--questionnaire {
    background-image: url(./images/questionnaire-icon.png);
  }
}

.c-mobile-task-activity-dialog__item__title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: bold;
  line-height: 18px;
  color: #333a47;
}

.c-mobile-task-activity-dialog__item__end {
  font-size: 12px;
  line-height: 17px;
  color: #9aa4b3;
}

.c-mobile-task-activity-dialog__item__btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 68px;
  height: 28px;
  padding: 0 15px;
  font-size: 12px;
  text-align: center;
  border-radius: 14px;

  &.c-mobile-task-activity-dialog__item__btn--notStart {
    color: #999999;
    background: rgba(0, 0, 0, 0.06);
  }

  &.c-mobile-task-activity-dialog__item__btn--inProgress {
    color: #fff;
    background: linear-gradient(112deg, #ff5031 0%, #ff9e63 98%);
  }

  &.c-mobile-task-activity-dialog__item__btn--finish {
    color: #fe3f52;
    background: #ffffff;
    border: 1px solid #fe3f52;
  }
}

.c-mobile-task-activity-dialog__item__progress {
  display: flex;
  align-items: center;
  margin-top: auto;
  font-size: 12px;
  line-height: 16px;
  color: #333a47;

  span {
    margin-right: 4px;
  }
}

.c-mobile-task-activity-dialog__item__finish {
  display: flex;
  align-items: center;
  margin-top: auto;
  font-size: 12px;
  line-height: 16px;
  color: #9aa4b3;
}

.c-mobile-task-activity-dialog__network-error-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

/* 网络异常状态样式 */
.c-mobile-task-activity-dialog__network-error {
  position: relative;
  z-index: 20;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
  padding: 20px 12px;
  padding-top: 84px;
  background: #fff;
  border-radius: 12px;
}

.c-mobile-task-activity-dialog__network-error__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
  background-image: url(./images/network-error.png);
  background-size: cover;
}

.c-mobile-task-activity-dialog__network-error__text {
  margin-bottom: 8px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.4); /* 中性色-浅色/中性色-黑色40%(辅助) */
  text-align: center;
}

.c-mobile-task-activity-dialog__network-error__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 28px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 28px;
  color: #ffffff; /* 中性色-深色/中性色-白色100%(标题) */
  cursor: pointer;
  background: linear-gradient(112deg, #ff5031 0%, #ff9e63 98%);
  border-radius: 14px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
}

.c-mobile-task-activity-dialog__network-error__loading {
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fff;
  border-radius: 12px;
}
</style>
