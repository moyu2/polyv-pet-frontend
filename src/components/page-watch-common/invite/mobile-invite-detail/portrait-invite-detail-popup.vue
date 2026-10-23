<!-- @file 移动端竖屏-邀请明细弹层 -->

<template>
  <mobile-popup
    class="c-portrait-invite-detail-popup"
    :title="$lang('invite.detail.popup.title')"
    :visible.sync="popupVisible"
    backable
    :closable="false"
    append-to-body
    ignore-content-max-height
    :content-percent-height="0.784"
    @click-back="handleClosePopup"
  >
    <div class="c-portrait-invite-detail-popup__content">
      <div class="c-portrait-invite-detail-popup__content__title">
        <span>{{ $lang('invite.detail.viewer.name') }}</span>
        <span>{{ $lang('invite.detail.viewer.accessTime') }}</span>
      </div>
      <div
        class="c-portrait-invite-detail-popup__content__wrap"
        @scroll="handleScroll"
      >
        <div
          v-for="item in totalInviteDetailList"
          :key="item.openId"
          class="c-portrait-invite-detail-popup__content__list__item"
        >
          <!-- 头像 -->
          <img
            :src="item.avatar || plvDefaultResource.defaultViewerAvatar"
            :alt="item.nickname"
            class="c-portrait-invite-detail-popup__content__list__item__avatar"
          />
          <!-- 昵称 -->
          <p class="c-portrait-invite-detail-popup__content__list__item__nick g-singleline">
            {{ item.nickname }}
          </p>
          <!-- 进入时间 -->
          <div class="c-portrait-invite-detail-popup__content__list__item__access-time">
            {{ formatDate(item.createdTime, 'YYYY.MM.DD hh:mm:ss') }}
          </div>
        </div>
      </div>

      <!-- 明细下载按钮 -->
      <mobile-invite-detail-export-button
        v-if="canShowDetailExport"
        ref="detailExportRef"
      />
    </div>
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
import MobileInviteDetailExportButton from './mobile-invite-detail-export-button/mobile-invite-detail-export-button.vue';

const { plvDefaultResource } = storeDefinitionToRefs(useCommonStore);

const {
  totalInviteDetailList,

  initInviteDetail,
  handleScroll,

  canShowDetailExport,
  detailExportRef,
} = useInviteDetail();

const popupVisible = ref(false);
useEventBusListener(appEvents.invite.OpenInviteDetail, async () => {
  popupVisible.value = true;
  await initInviteDetail();
  detailExportRef.value?.init();
});

function handleClosePopup() {
  popupVisible.value = false;
}

watch(
  () => popupVisible.value,
  () => {
    detailExportRef.value?.destroy();
  },
);
</script>

<style lang="scss">
.c-portrait-invite-detail-popup {
  width: 100%;
}

.c-portrait-invite-detail-popup__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-portrait-invite-detail-popup__content__title {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #adadc0;
}

.c-portrait-invite-detail-popup__content__wrap {
  flex: 1;
  overflow: auto;
}

.c-portrait-invite-detail-popup__content__list__item {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 16px;
  color: #adadc0;
}

.c-portrait-invite-detail-popup__content__list__item__avatar {
  width: 32px;
  height: 32px;
  margin-right: 16px;
  border: 2px solid transparent;
  border-radius: 50%;
}

.c-portrait-invite-detail-popup__content__list__item__nick {
  flex: 1;
  margin-right: 16px;
  font-size: 16px;
  line-height: 56px;
  color: #333333;
}

.c-portrait-invite-detail-popup__content__list__item__access-time {
  font-size: 12px;
}
</style>
