<!-- @file 移动端横屏-用户卡片 -->

<template>
  <mobile-popup
    :visible.sync="popupVisible"
    :show-header="false"
    fill-body-section
    class="c-mobile-seat-table-user-card"
  >
    <div
      class="c-mobile-seat-table-user-card__back"
      @click="closePopup"
    >
      <mobile-icon-arrow-left class="c-mobile-seat-table-user-card__back__icon" />
    </div>

    <iar-mobile-seat-user-card
      v-if="popupVisible"
      :seat-table-sdk="seatTableSdk"
      :user-info="userInfo"
      @follow="RefreshSeatTableFollowList"
      @cancel-follow="RefreshSeatTableFollowList"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import { MobileIconArrowLeft } from '@/components/component-icons/mobile/map';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useUserCard } from './use-user-card';
import { useSeatTable } from '../use-seat-table';

const IarMobileSeatUserCard = getIarComponent('MobileSeatUserCard');

const { popupVisible, userInfo, closePopup } = useUserCard();

const { seatTableSdk, RefreshSeatTableFollowList } = useSeatTable();
</script>

<style lang="scss">
.c-mobile-seat-table-user-card__back {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 9;
  font-size: 24px;
  color: #fff;
}

.c-mobile-popup__content {
  border-radius: 8px 8px 0 0;
}
</style>
