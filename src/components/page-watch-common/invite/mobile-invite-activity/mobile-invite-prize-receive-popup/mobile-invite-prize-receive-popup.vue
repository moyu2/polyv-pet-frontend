<!-- @file 移动端-邀请有礼活动中奖领取弹窗 -->

<template>
  <pwc-reward-receive-popup
    :receive-data="receiveData"
    :submit-action="submitTaskReceive"
  />
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import {
  InvitePrizeReceiveFormCollectParams,
  InvitePrizeReceiveFormFieldItem,
  InvitePrizeReceiveFormFieldType,
  InvitePrizeReceiveType,
  InvitePrizeWinnerInfo,
} from '@polyv/live-watch-sdk';
import { PwcRewardReceivePopup } from '@polyv/vue-components';
import { onMounted, ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { useInviteStore } from '@/store/use-invite-store';
import type {
  RewardReceiveData,
  RewardReceiveFormItem,
  RewardReceiveFormType,
  RewardReceiveSubmitAction,
} from '@polyv/vue-components';
import { useInvitePrizeReceive } from '../_hooks/use-invite-prize-receive';

const { toast } = useToastManager();

const { getWatchCore } = useGlobalInject();

const inviteStore = useInviteStore();

const { invitePrizeWinnerInfo, hasReceived } =
  useInvitePrizeReceive<InvitePrizeWinnerInfo | null>();

const receiveData = ref<RewardReceiveData>();

const popupVisible = ref(false);

function open() {
  if (!invitePrizeWinnerInfo.value) {
    return;
  }

  switch (invitePrizeWinnerInfo.value?.receiveType) {
    case InvitePrizeReceiveType.Form: {
      const _formList: RewardReceiveFormItem[] = [];
      invitePrizeWinnerInfo.value.receiveInfo.formInfo.forEach(item => {
        _formList.push(getFormItem(item));
      });
      receiveData.value = {
        receiveType: 'form',
        isReceived: hasReceived.value,
        formList: _formList,
      };
      break;
    }
    case InvitePrizeReceiveType.Link:
      receiveData.value = {
        receiveType: 'link',
        isReceived: hasReceived.value,
        linkUrl: invitePrizeWinnerInfo.value.receiveInfo.prizeUrl,
      };
      break;
    case InvitePrizeReceiveType.QrCode:
      receiveData.value = {
        receiveType: 'qrCode',
        isReceived: hasReceived.value,
        qrCode: invitePrizeWinnerInfo.value.receiveInfo.qrCode,
        qrCodeTips: invitePrizeWinnerInfo.value.receiveInfo.qrCodeTips,
      };
      break;
  }

  popupVisible.value = true;
}

/**
 * 获取过滤后的表单配置
 */
function getFormItem(item: InvitePrizeReceiveFormFieldItem) {
  let formType: RewardReceiveFormType = 'input';
  if (item.type === InvitePrizeReceiveFormFieldType.Phone) {
    formType = 'phone';
  }

  const res = {
    label: item.field,
    placeholder: item.tips,
  };

  switch (item.type) {
    case InvitePrizeReceiveFormFieldType.Name:
      res.label = translate('taskActivity.rewardReceive.nameLabel');
      res.placeholder = translate('taskActivity.rewardReceive.namePlaceholder');
      break;
    case InvitePrizeReceiveFormFieldType.Phone:
      res.label = translate('taskActivity.rewardReceive.phoneLabel');
      res.placeholder = translate('taskActivity.rewardReceive.phonePlaceholder');
      break;
  }

  const formItem: RewardReceiveFormItem = {
    title: res.label,
    placeholder: res.placeholder,
    value: item.value || '',
    formType,
    isRequired: item.required,
  };

  return formItem;
}

const submitTaskReceive: RewardReceiveSubmitAction = async formValue => {
  try {
    const paramFormData: InvitePrizeReceiveFormCollectParams['formData'] = [];
    if (invitePrizeWinnerInfo.value?.receiveType === InvitePrizeReceiveType.Form) {
      invitePrizeWinnerInfo.value?.receiveInfo.formInfo.forEach((fieldItem, index) => {
        paramFormData.push({
          ...fieldItem,
          value: formValue[index] || '',
        });
      });
    }

    const watchCore = getWatchCore();
    await watchCore.invite.saveInvitePrizeReceiveForm({
      id: invitePrizeWinnerInfo.value?.id || '',
      formData: paramFormData,
    });

    inviteStore.$patch({
      invitePrizeWinnerInfo: {
        ...invitePrizeWinnerInfo.value,
        receiveType: InvitePrizeReceiveType.Form,
        receiveInfo: {
          ...invitePrizeWinnerInfo.value?.receiveInfo,
          formInfo: paramFormData,
        },
        hasReceived: true,
      },
    });

    toast.success(translate('base.submitSuccess'));
  } catch (error) {
    toast.error(translate('base.submitFail'));
  }
};

useEventBusListener(appEvents.invite.OpenInvitePrizeReceivePopup, () => {
  open();
});

onMounted(() => {
  popupVisible.value = true;
});
</script>
