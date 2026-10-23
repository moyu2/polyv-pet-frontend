<!-- @file 移动端横屏-邀请明细弹层 -->

<template>
  <mobile-popup
    class="c-mobile-invite-detail-popup"
    :title="$lang('invite.detail.popup.title')"
    :visible.sync="popupVisible"
    :show-header="false"
    fill-body-section
    append-to-body
    :content-style="{
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
    }"
    content-background="#ffeae4"
  >
    <div
      class="c-mobile-invite-detail-popup__content"
      @scroll="handleScroll"
    >
      <mobile-invite-popup-title :title="$lang('invite.detail.popup.title')" />

      <div class="c-mobile-invite-detail-popup__body">
        <div class="c-mobile-invite-detail-popup__content__title">
          <span>{{ $lang('invite.detail.viewer.name') }}</span>
          <span>{{ $lang('invite.detail.viewer.accessTime') }}</span>
        </div>

        <div
          v-if="totalInviteDetailList.length === 0"
          class="c-mobile-invite-detail-popup__content__empty"
        >
          <mobile-icon-empty class="c-mobile-invite-detail-popup__content__empty__icon" />
          <span>{{ $lang('base.noData') }}</span>
        </div>

        <div class="c-mobile-invite-detail-popup__content__wrap">
          <div
            v-for="item in totalInviteDetailList"
            :key="item.openId"
            class="c-mobile-invite-detail-popup__content__list__item"
          >
            <!-- 头像 -->
            <img
              :src="item.avatar || plvDefaultResource.defaultViewerAvatar"
              :alt="item.nickname"
              class="c-mobile-invite-detail-popup__content__list__item__avatar"
            />
            <!-- 昵称 -->
            <p class="c-mobile-invite-detail-popup__content__list__item__nick g-singleline">
              {{ item.nickname }}
            </p>
            <!-- 进入时间 -->
            <div
              class="c-mobile-invite-detail-popup__content__list__item__access-time plv-font-din-pro-regular"
            >
              {{ formatDate(item.createdTime, 'YYYY.MM.DD hh:mm:ss') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 明细下载按钮 -->
    <mobile-invite-detail-export-button
      v-if="canShowDetailExport"
      ref="detailExportRef"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useInviteDetail } from './_hooks/use-invite-detail';
import { formatDate } from '@polyv/utils/date';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useCommonStore } from '@/store/use-common-store';
import MobileInvitePopupTitle from '../mobile-invite-rank/mobile-invite-popup-title.vue';
import MobileInviteDetailExportButton from './mobile-invite-detail-export-button/mobile-invite-detail-export-button.vue';
import { MobileIconEmpty } from '@/components/component-icons/mobile/map';

const { plvDefaultResource } = storeDefinitionToRefs(useCommonStore);

const {
  totalInviteDetailList,

  initInviteDetail,
  handleScroll,

  canShowDetailExport,
  detailExportRef,
} = useInviteDetail();

const popupVisible = ref(false);

async function open() {
  popupVisible.value = true;
  await initInviteDetail();
  detailExportRef.value?.init();
}

useEventBusListener(appEvents.invite.OpenInviteDetail, async () => {
  open();
});

watch(
  () => popupVisible.value,
  () => {
    detailExportRef.value?.destroy();
  },
);
</script>

<style lang="scss">
.c-mobile-invite-detail-popup {
  width: 100%;
  .c-mobile-popup__body {
    position: relative;
    display: flex;
    flex-direction: column;
    padding-top: 16px;
    background-image: url(../mobile-invite-rank/imgs/rank-bg.png);
    background-repeat: no-repeat;
    background-size: 100%;
  }
}

.c-mobile-invite-detail-popup__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-bottom: 16px;
  overflow-y: auto;
}

.c-mobile-invite-detail-popup__body {
  padding-top: 22px;
  margin: 0 16px;
  margin-top: 16px;
  background: linear-gradient(180deg, rgba(255, 238, 236, 0.98) 0%, rgba(255, 254, 255, 0.8) 10%);
  border: 1px solid #fefdfd;
  border-radius: 16px;
}

.c-mobile-invite-detail-popup__content__title {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: rgba(#000, 0.4);
}

.c-mobile-invite-detail-popup__content__wrap {
  flex: 1;
  overflow: auto;
}

.c-mobile-invite-detail-popup__content__list__item {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 0 16px;
  color: #adadc0;
}

.c-mobile-invite-detail-popup__content__list__item__avatar {
  width: 34px;
  height: 34px;
  margin-right: 12px;
  border-radius: 50%;
}

.c-mobile-invite-detail-popup__content__list__item__nick {
  flex: 1;
  margin-right: 16px;
  font-size: 14px;
  line-height: 56px;
  color: rgba(#000, 0.8);
}

.c-mobile-invite-detail-popup__content__list__item__access-time {
  font-size: 14px;
  color: rgba(#000, 0.4);
}

.c-mobile-invite-detail-popup__content__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  font-size: 12px;
  color: rgba(#000, 0.4);
}

.c-mobile-invite-detail-popup__content__empty__icon {
  display: flex;
  margin-bottom: 12px;
  font-size: 80px;
  color: rgba(#000, 0.1);
}
</style>
