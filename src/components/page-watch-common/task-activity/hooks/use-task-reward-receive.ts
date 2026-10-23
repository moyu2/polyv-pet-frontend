import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import type {
  RewardReceiveData,
  RewardReceiveFormItem,
  RewardReceiveFormType,
  RewardReceiveSubmitAction,
} from '@polyv/vue-components';
import {
  RewardAcceptFormItem,
  RewardAcceptFormType,
  SubmitRewardReceiveIdOptions,
  TaskRewardItem,
  YN,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { ref } from 'vue';

export type TaskRewardItemData = Pick<TaskRewardItem, 'acceptInfo'> & {
  id?: number;
  activityId?: number;
  taskId?: number;
};

export const useTaskRewardReceive = () => {
  const { getWatchCore, getEmitter } = useGlobalInject();

  const watchCore = getWatchCore();

  const currentRewardItem = ref<TaskRewardItemData>();

  const receiveData = ref<RewardReceiveData>();

  function open(rewardItem: TaskRewardItemData) {
    if (!rewardItem.acceptInfo) {
      return;
    }

    const _formList: RewardReceiveFormItem[] = [];
    if (rewardItem.acceptInfo.formInfo) {
      rewardItem.acceptInfo.formInfo.forEach(item => {
        const texts = getItemText(item);
        let formType: RewardReceiveFormType = 'input';
        switch (item.type) {
          case RewardAcceptFormType.Address:
            formType = 'address';
            break;
          case RewardAcceptFormType.UserPhone:
            formType = 'phone';
            break;
        }

        _formList.push({
          title: texts.label,
          placeholder: texts.placeholder,
          value: item.value || '',
          formType,
          isRequired: item.required,
        });
      });
    }

    receiveData.value = {
      receiveType: rewardItem.acceptInfo.acceptType,
      isReceived: ynToBool(rewardItem.acceptInfo.received, YN.N),
      formList: _formList,
      linkUrl: rewardItem.acceptInfo.prizeUrl || '',
      qrCode: rewardItem.acceptInfo.qrCode || '',
      qrCodeTips: rewardItem.acceptInfo.qrCodeTips || '',
    };
    currentRewardItem.value = rewardItem;
  }

  function getItemText(item: RewardAcceptFormItem) {
    const res = {
      label: item.field,
      placeholder: item.tips,
    };

    switch (item.type) {
      case RewardAcceptFormType.UserName:
        res.label = translate('taskActivity.rewardReceive.nameLabel');
        res.placeholder = translate('taskActivity.rewardReceive.namePlaceholder');
        break;
      case RewardAcceptFormType.UserPhone:
        res.label = translate('taskActivity.rewardReceive.phoneLabel');
        res.placeholder = translate('taskActivity.rewardReceive.phonePlaceholder');
        break;
      case RewardAcceptFormType.Address:
        res.label = translate('taskActivity.rewardReceive.addressLabel');
        res.placeholder = translate('taskActivity.rewardReceive.addressPlaceholder2');
        break;
    }

    return res;
  }

  const submitTaskReceive: RewardReceiveSubmitAction = async formValue => {
    const formInfo = currentRewardItem.value?.acceptInfo?.formInfo;
    if (!formInfo || !currentRewardItem.value) {
      return;
    }

    const formInfoPostData = formInfo.map((item, index) => {
      const value = formValue[index];

      return {
        ...item,
        value,
      };
    });

    let targetId: number | SubmitRewardReceiveIdOptions | undefined;

    if (currentRewardItem.value.id) {
      targetId = currentRewardItem.value.id;
    } else if (currentRewardItem.value.activityId && currentRewardItem.value.taskId) {
      targetId = {
        activityId: currentRewardItem.value.activityId,
        taskId: currentRewardItem.value.taskId,
      };
    }

    if (targetId) {
      await watchCore.taskActivity.submitRewardReceive(targetId, formInfoPostData);
    }
    getEmitter().emit(appEvents.global.RefreshTaskRewardList);
  };

  useEventBusListener(appEvents.global.OpenTaskRewardReceiveDialog, open);

  return {
    submitTaskReceive,
    receiveData,
  };
};
