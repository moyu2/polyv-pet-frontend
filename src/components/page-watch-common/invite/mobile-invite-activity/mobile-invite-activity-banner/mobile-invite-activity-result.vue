<!-- @file 移动端-邀请有礼活动结果  -->

<template>
  <div class="c-mobile-invite-activity-result">
    <mobile-invite-activity-title-widget class="c-mobile-invite-activity-result__title">
      {{ inviteActivityResultTitle }}
    </mobile-invite-activity-title-widget>
    <div
      v-if="!isSelfWin"
      class="c-mobile-invite-activity-result__no-win"
    >
      <span>{{ $lang('invite.activity.result.notWin.tips') }}</span>
    </div>
    <div
      v-else
      class="c-mobile-invite-activity-result__receive-card"
    >
      <!-- 左-奖品图片 -->
      <div class="c-mobile-invite-activity-result__receive-card-left">
        <div
          class="c-mobile-invite-activity-result__receive-card__prize-cover g-img-cover"
          :style="{
            'background-image': `url(${invitePrizeWinnerInfo.prizeImage || defaultPrizeImage})`,
          }"
        ></div>
      </div>
      <!-- 右-奖品描述 -->
      <div class="c-mobile-invite-activity-result__receive-card-right">
        <div class="c-mobile-invite-activity-result__receive-card__prize-name g-multiline">
          {{ invitePrizeWinnerInfo.prizeName }}
        </div>
        <div>
          <normal-button
            class="c-mobile-invite-activity-result__receive-card__button"
            :class="{
              'c-mobile-invite-activity-result__receive-card__button--received': hasReceived,
            }"
            :type="ButtonType.Custom"
            :size="ButtonSize.Mini"
            :text="inviteActivityResultBtnText"
            @click="toReceivePrize"
          >
          </normal-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusEmitter } from '@/app/app-events';

import MobileInviteActivityTitleWidget from '../mobile-invite-activity-title-widget.vue';
import NormalButton, { ButtonType, ButtonSize } from '@/components/common-base/normal-button';
import { InvitePrizeReceiveType } from '@polyv/live-watch-sdk';
import { messageBox } from '@/components/common-base/message-box';
import { defaultPrizeImage, useInvitePrizeReceive } from '../_hooks/use-invite-prize-receive';
import { translate } from '@/assets/lang';

const {
  invitePrizeWinnerInfo,
  isSelfWin,
  hasReceived,

  inviteActivityResultTitle,
  inviteActivityResultBtnText,
} = useInvitePrizeReceive();

const { emitEvent: openPrizeReceivePopup } = useEventBusEmitter(
  appEvents.invite.OpenInvitePrizeReceivePopup,
);

async function toReceivePrize() {
  // 外链领取
  if (invitePrizeWinnerInfo.value.receiveType === InvitePrizeReceiveType.Link) {
    const result = await messageBox({
      content: translate('invite.prize.receive.link.tips'),
      contentCenter: true,
      cancelButtonText: translate('invite.prize.receive.link.cancel'),
      confirmButtonText: translate('invite.prize.receive.link.confirm'),
    }).$confirm();
    if (result) {
      window.location.href = invitePrizeWinnerInfo.value.receiveInfo.prizeUrl;
    }
    return;
  }

  openPrizeReceivePopup();
}
</script>

<style lang="scss">
.c-mobile-invite-activity-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-family: 'PingFang SC';
  color: #e75b48;
}

.c-mobile-invite-activity-result__title {
  height: 20px;
  margin-bottom: 8px;
}

.c-mobile-invite-activity-result__no-win {
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 2px;
}

.c-mobile-invite-activity-result__receive-card {
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 92px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.c-mobile-invite-activity-result__receive-card-left {
  width: 68px;
  min-width: 68px;
  height: 68px;
  border-radius: 4px;
}
.c-mobile-invite-activity-result__receive-card__prize-cover {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.c-mobile-invite-activity-result__receive-card-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 12px;
}

.c-mobile-invite-activity-result__receive-card__prize-name {
  font-size: 12px;
  line-height: 1.2;
  color: #333333;
}

.c-mobile-invite-activity-result__receive-card__button {
  padding: 0 14px;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(283deg, #ffce56 -1%, #ff9d4b 100%);
  border-radius: 16px;
}

.c-mobile-invite-activity-result__receive-card__button--received {
  background: linear-gradient(90deg, #aaaaaa 0%, #cccccc 100%);
}
</style>
