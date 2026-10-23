<!-- @file 移动端-邀请有礼活动详情弹窗 -->

<template>
  <mobile-popup
    class="c-mobile-invite-activity-detail-popup"
    :visible.sync="popupVisible"
    fill-body-section
    :show-header="false"
    append-to-body
    :content-style="{
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
    }"
    content-background="#ffeae4"
  >
    <div
      class="c-mobile-invite-activity-detail-popup__back"
      @click="close"
    >
      <mobile-icon-arrow-left />
    </div>

    <mobile-invite-popup-title :title="$lang('invite.activity.detail.popup.title')" />
    <div class="c-mobile-invite-activity-detail-popup__content">
      <!-- 活动介绍 -->
      <div
        class="c-mobile-invite-activity-detail-popup__content-card c-mobile-invite-activity-introduce"
      >
        <mobile-invite-activity-title-widget
          class="c-mobile-invite-activity-detail-popup__content-card--title"
        >
          {{ $lang('invite.activity.detail.introduce') }}
        </mobile-invite-activity-title-widget>
        <div
          class="c-mobile-invite-activity-detail-popup__content-card--content c-mobile-invite-activity-introduce__content"
          ref="InviteActivityIntroduceRef"
        >
          <mobile-rich-text-render
            class="c-mobile-invite-activity-introduce__content__rich-text"
            :html-content="inviteActivityInfo.introduction"
            :follow-page-skin="false"
          />
        </div>
        <!-- 按钮--展开/收起 -->
        <div
          v-if="foldTriggerVisible"
          class="c-mobile-invite-activity-introduce__toggle-btn-wrapper"
        >
          <button
            class="c-mobile-invite-activity-introduce__toggle-btn"
            @click="toggleFoldTriggerState"
          >
            <span>{{
              foldTriggerState === FoldToggleState.Fold
                ? $lang('base.spreadOut')
                : $lang('base.packUp')
            }}</span>
            <mobile-icon-arrow-down
              v-if="foldTriggerState === FoldToggleState.Fold"
              class="c-mobile-invite-activity-introduce__toggle-btn--icon"
            />
            <mobile-icon-arrow-up
              v-else-if="foldTriggerState === FoldToggleState.UnFold"
              class="c-mobile-invite-activity-introduce__toggle-btn--icon"
            />
          </button>
        </div>
      </div>

      <!-- 奖励说明 -->
      <div class="c-mobile-invite-activity-detail-popup__content-card">
        <mobile-invite-activity-title-widget
          class="c-mobile-invite-activity-detail-popup__content-card--title"
        >
          {{ $lang('invite.activity.detail.prizeDetail') }}
        </mobile-invite-activity-title-widget>
        <div class="c-mobile-invite-activity-detail-popup__content-card--content">
          <div
            class="c-mobile-invite-activity-prize-item"
            v-for="(prizeItem, idx) in prizeList"
            :key="`prizeItem_${idx}`"
          >
            <div class="c-mobile-invite-activity-prize-item-left">
              <img
                class="c-mobile-invite-activity-prize-item__prize-cover g-img-cover"
                :src="prizeItem.pictureUrl || defaultPrizeImage"
              />
            </div>
            <div class="c-mobile-invite-activity-prize-item-right">
              <div class="c-mobile-invite-activity-prize-item__prize-name g-multiline">
                {{ prizeItem.name }}
              </div>
              <div class="c-mobile-invite-activity-prize-item__prize-ext">
                <div class="c-mobile-invite-activity-prize-item__prize-limit">
                  {{
                    $lang('invite.activity.detail.prizeDetail.limit', {
                      count: String(prizeItem.headCount),
                    })
                  }}
                </div>
                <div class="c-mobile-invite-activity-prize-item__prize-receive-area">
                  {{
                    $lang('invite.activity.detail.prizeDetail.condition', {
                      order: getPrizeReceiveArea(prizeItem),
                    })
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { InvitePrizeItem } from '@polyv/live-watch-sdk';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInviteStore } from '@/store/use-invite-store';

import MobilePopup from '@/components/common-base/popup';
import MobileRichTextRender from '@/components/common-base/rich-text-render/mobile-rich-text-render.vue';
import MobileInviteActivityTitleWidget from '../mobile-invite-activity-title-widget.vue';
import {
  MobileIconArrowDown,
  MobileIconArrowUp,
  MobileIconArrowLeft,
} from '@/components/component-icons/mobile/map';
import { useFoldToggleBehavior, FoldToggleState } from '@/hooks/behaviors/use-fold-toggle';
import { defaultPrizeImage } from '../_hooks/use-invite-prize-receive';
import { useGlobalInject } from '@/app/use-global-inject';
import MobileInvitePopupTitle from '../../mobile-invite-rank/mobile-invite-popup-title.vue';

const { getWatchCore } = useGlobalInject();

const { inviteActivityInfo } = storeDefinitionToRefs(useInviteStore);

const InviteActivityIntroduceRef = ref<HTMLDivElement>();

const {
  foldTriggerVisible,
  foldTriggerState,

  setFoldCondition,
  toggleFoldTriggerState,
} = useFoldToggleBehavior(InviteActivityIntroduceRef, 214);

const prizeList = ref<InvitePrizeItem[]>([]);

async function initPrizeList() {
  const watchCore = getWatchCore();
  prizeList.value = await watchCore.invite.getInvitePrizeList();
}

function getPrizeReceiveArea(prizeItem: InvitePrizeItem) {
  const { receiveAreaMin, receiveAreaMax } = prizeItem;
  if (receiveAreaMin === 0) {
    return receiveAreaMax === 1 ? `${receiveAreaMax}` : `1~${receiveAreaMax}`;
  }

  if (receiveAreaMin === receiveAreaMax) {
    return `${receiveAreaMax}`;
  }

  return `${receiveAreaMin}~${receiveAreaMax}`;
}

const popupVisible = ref(false);
/** 首次渲染标识位 */
const firstPaint = ref(false);

function close() {
  popupVisible.value = false;
}

useEventBusListener(appEvents.invite.OpenInviteActivityDetailPopup, () => {
  popupVisible.value = true;

  // 初始化活动奖品列表
  if (!prizeList.value.length) {
    initPrizeList();
  }

  // 设置展开按钮交互
  nextTick(() => {
    if (firstPaint.value) return;
    setFoldCondition();
    firstPaint.value = true;
  });
});
</script>

<style lang="scss">
.c-mobile-invite-activity-detail-popup {
  .c-mobile-popup__body {
    position: relative;
    padding-top: 16px;
    background-image: url(../../mobile-invite-rank/imgs/rank-bg.png);
    background-repeat: no-repeat;
    background-size: 100%;
  }
}
.c-mobile-invite-activity-detail-popup__back {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #fff;
  background: rgba(#000, 0.2);
  border-radius: 50%;
  span {
    display: flex;
    font-size: 20px;
  }
}
.c-mobile-invite-activity-detail-popup__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.c-mobile-invite-activity-introduce__content {
  position: relative;
  box-sizing: border-box;
  margin-top: 12px;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  color: #666;
  transition: all ease 0.3s;
}
.c-mobile-invite-activity-introduce__content__rich-text {
  .c-mobile-rich-text-render__content {
    font-size: 14px;
    line-height: 20px;

    p {
      margin: 0;
    }
  }
  .c-mobile-rich-text-render__content {
    padding: 0;
    margin: 0;
    color: #666;
  }
}
.c-mobile-invite-activity-introduce__toggle-btn-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  font-family: 'PingFang SC';
  background: rgba(255, 255, 255, 0.9);
  &::before {
    position: absolute;
    bottom: 100%;
    left: 50%;
    width: 106%;
    height: 20px;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgba(#fff, 0) 0%, #ffffff 100%);
    transform: translateX(-50%);
  }
}
.c-mobile-invite-activity-introduce__toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 22px;
  padding: 0 10px;
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
}
.c-mobile-invite-activity-introduce__toggle-btn--icon {
  align-self: flex-end;
}

.c-mobile-invite-activity-detail-popup__content-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 1);
  border-radius: 8px;
}
.c-mobile-invite-activity-detail-popup__content-card--title {
  height: 20px;
  margin-bottom: 8px;
}
.c-mobile-invite-activity-detail-popup__content-card--content {
  width: 100%;
}

.c-mobile-invite-activity-prize-item {
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 92px;
  padding: 12px;
  margin-bottom: 12px;
  font-family: 'PingFang SC';
  background: rgba(255, 235, 212, 0.4);
  border-radius: 8px;
}
.c-mobile-invite-activity-prize-item-left {
  width: 68px;
  min-width: 68px;
  height: 68px;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
}
.c-mobile-invite-activity-prize-item-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  margin-left: 12px;
}
.c-mobile-invite-activity-prize-item__prize-name {
  line-height: 1.2;
}
.c-mobile-invite-activity-prize-item__prize-ext {
  display: flex;
  justify-content: space-between;
  color: #999999;
}
</style>
