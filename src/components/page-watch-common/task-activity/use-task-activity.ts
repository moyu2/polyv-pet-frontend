import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { replaceStrTemplate } from '@/assets/utils/string';
import { useToastManager } from '@/hooks/components/use-toast';
import { usePolling } from '@/hooks/tools/use-polling';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useTaskActivityStore } from '@/store/use-task-activity-store';
import {
  OutTradeErrorCode,
  TaskActivityItem,
  TaskActivityReachCondition,
  TaskActivityRewardSetting,
  TaskActivityRewardType,
  TaskActivityStatus,
  TaskActivityType,
  TaskRewardStatus,
  OnlineTaskUpdateType,
} from '@polyv/live-watch-sdk';
import { ref, watch } from 'vue';

/**
 * 任务奖励文本 hook
 */
export const useTaskActivityText = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  /**
   * 获取任务奖励文案
   * @param rewardSetting 任务奖励设置
   */
  function getTaskRewardText(rewardSetting: TaskActivityRewardSetting): string {
    const config = watchCore.taskActivity.getTaskActivityConfig();

    let txt = '';

    switch (rewardSetting.type) {
      case TaskActivityRewardType.Cash:
        txt = translate('taskActivity.redpackReward', {
          amount: rewardSetting.amount,
        });
        break;
      case TaskActivityRewardType.Custom:
        txt = rewardSetting.customReward;
        break;
      case TaskActivityRewardType.Point:
        txt = translate('taskActivity.pointReward', {
          amount: Math.trunc(rewardSetting.amount),
        });
        break;
      case TaskActivityRewardType.ExternalPoint:
        txt = translate('taskActivity.externalPointReward', {
          amount: rewardSetting.amount,
          unit: config.externalPointUnit,
        });
        break;
    }

    return txt;
  }

  /**
   * 获取任务达成条件文案
   * @param reachCondition 达到条件
   */
  function getTaskReachText(reachCondition: TaskActivityReachCondition): string {
    let txt = '';

    // 达成条件
    switch (reachCondition.type) {
      case TaskActivityType.Sign:
        txt = translate('taskActivity.signCondition', {
          amount: `${reachCondition.amount}`,
        });
        break;
      case TaskActivityType.Online:
        txt = translate('taskActivity.onlineCondition', {
          amount: `${reachCondition.amount}`,
        });
        break;
      case TaskActivityType.Questionnaire:
        txt = translate('taskActivity.questionnaireCondition', {
          amount: `${reachCondition.amount}`,
        });
        break;
      case TaskActivityType.Custom: {
        const customReachText = reachCondition.customReachText || '';
        txt = replaceStrTemplate(customReachText, {
          customEventName: reachCondition.customEventName || '',
          amount: reachCondition.amount,
          customUnit: reachCondition.customUnit || '',
        });
        break;
      }
    }

    return txt;
  }

  return {
    getTaskRewardText,
    getTaskReachText,
  };
};

/**
 * 任务活动 hook
 */
export const useTaskActivity = () => {
  const taskActivityStore = useTaskActivityStore();
  const interactReceiveStore = useInteractReceiveStore();

  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const { getTaskRewardText, getTaskReachText } = useTaskActivityText();

  const { toast } = useToastManager();

  const onlineTaskUpdateType = ref<OnlineTaskUpdateType>(OnlineTaskUpdateType.Socket);

  /** 弹层显示状态 */
  const visible = ref(false);

  async function open() {
    await refreshActivityData();
    visible.value = true;
  }

  function refreshActivityData() {
    return watchCore.taskActivity.refreshActivityData();
  }

  function onCountDownFinish() {
    setTimeout(() => {
      refreshActivityData();
    }, 1000);
  }

  watch(
    () => taskActivityStore.currentActivityData,
    () => {
      if (!taskActivityStore.currentActivityData) {
        visible.value = false;
      }
    },
  );
  /** 任务列表 */
  const { taskList } = storeDefinitionToRefs(useTaskActivityStore);

  /**
   * 获取任务标题
   * @param taskItem 任务节点
   */
  function getTaskTitle(taskItem: TaskActivityItem): string {
    let title = '';

    // 达成条件
    title += getTaskReachText(taskItem.reachCondition);

    // 奖励
    const rewardContent = getTaskRewardText(taskItem.rewardSetting);
    if (rewardContent) {
      title += translate('taskActivity.reward1', { content: rewardContent });
    }

    return title;
  }

  /**
   * 获取按钮文案
   * @param item 任务节点
   */
  function getButtonText(item: TaskActivityItem): string {
    let btnText = '';

    if (item.status === TaskActivityStatus.NotStart) {
      btnText = translate('taskActivity.lockedBtn');
    }

    if (item.status === TaskActivityStatus.InProgress) {
      switch (item.reachCondition.type) {
        case TaskActivityType.Sign:
          btnText = translate('taskActivity.signBtn');
          break;
        case TaskActivityType.Online:
          btnText = translate('taskActivity.onlineBtn');
          break;
        case TaskActivityType.Questionnaire:
          btnText = translate('taskActivity.questionnaireBtn');
          break;
        case TaskActivityType.Custom:
          btnText = item.reachCondition.customButtonText || translate('taskActivity.customBtn');
          break;
      }
    }

    if (item.status === TaskActivityStatus.Finish) {
      btnText = translate('taskActivity.viewReward');
    }

    return btnText;
  }

  /** 是否显示按钮 */
  function showBtn(item: TaskActivityItem): boolean {
    if (item.status === TaskActivityStatus.Finish) {
      // 没有奖励时不显示按钮
      if (item.rewardStatus === TaskRewardStatus.IssuedLimit) {
        return false;
      }

      // 未达成时不显示
      if (!item.isReach) {
        return false;
      }

      const rewardContent = getTaskRewardText(item.rewardSetting);
      return !!rewardContent;
    }

    return true;
  }

  function getFinishText(item: TaskActivityItem): string {
    if (!item.isReach) {
      return translate('taskActivity.notFinish');
    }

    if (item.rewardStatus === TaskRewardStatus.IssuedLimit) {
      let text = translate('taskActivity.rewardStatus.limit');

      switch (item.outTradeErrCode) {
        case OutTradeErrorCode.MarketingAccountUnbound:
          text = translate('taskActivity.rewardError.msg4');
          break;
        case OutTradeErrorCode.MarketingAccountError:
          text = translate('taskActivity.rewardError.msg5');
          break;
      }
      return text;
    }

    return translate('taskActivity.finish');
  }

  function onClickBtn(item: TaskActivityItem) {
    // 未解锁
    if (item.status === TaskActivityStatus.NotStart) {
      toast.error(translate('taskActivity.notStartToast'));
    }

    // 进行中
    if (item.status === TaskActivityStatus.InProgress) {
      // 签到任务
      if (item.reachCondition.type === TaskActivityType.Sign) {
        if (interactReceiveStore.hasCheckIn) {
          getEmitter().emit(appEvents.interaction.OpenCheckIn, true);
        } else {
          toast.error(translate('taskActivity.signError'));
        }
      }

      // 答题任务
      if (
        item.reachCondition.type === TaskActivityType.Questionnaire &&
        item.reachCondition.questionnaireId
      ) {
        getEmitter().emit(appEvents.global.OpenTaskActivityQuestionnaire, {
          questionnaireId: item.reachCondition.questionnaireId,
          taskId: item.taskId,
        });
      }

      // 自定义任务
      if (item.reachCondition.type === TaskActivityType.Custom) {
        // 自定义条件仅定制开发才处理，Saas 不做处理
        console.info('处理自定义条件：', item.reachCondition.customEvent);
      }
      visible.value = false;
    }

    // 已完成
    if (item.status === TaskActivityStatus.Finish) {
      openReward();
    }
  }

  function openReward() {
    getEmitter().emit(appEvents.global.OpenPersonalRewardDialog);
  }

  function getSurplusTime(item: TaskActivityItem): number {
    return item.reachCondition.amount * 60 - (item.reachCondition.currentSchedule || 0) / 1000;
  }

  /**
   * 获取在线任务更新类型
   */
  function getOnlineTaskUpdateType() {
    onlineTaskUpdateType.value = watchCore.taskActivity.getOnlineTaskUpdateType();
  }

  useEventBusListener(appEvents.global.OpenTaskActivityDialog, open);
  useEventBusListener(appEvents.global.RefreshTaskActivity, refreshActivityData);
  useEventBusListener(appEvents.interaction.CheckInFinish, refreshActivityData);

  usePolling(() => {
    refreshActivityData();
  }, 5 * 60 * 1000);

  return {
    visible,
    taskList,
    getTaskTitle,
    getButtonText,
    onClickBtn,
    openReward,
    getSurplusTime,
    refreshActivityData,
    onCountDownFinish,
    showBtn,
    getFinishText,
    getOnlineTaskUpdateType,
    onlineTaskUpdateType,
  };
};
