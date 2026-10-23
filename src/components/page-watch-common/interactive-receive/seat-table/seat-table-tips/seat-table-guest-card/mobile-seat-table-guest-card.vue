<!-- @file 移动端横屏-云席嘉宾证 -->

<template>
  <div
    v-show="visible"
    ref="guestCardRef"
    class="c-mobile-seat-table-guest-card"
  >
    <div class="c-mobile-seat-table-guest-card__main pws-mobile-seat-table-guest-card__main">
      <div
        class="c-mobile-seat-table-guest-card__close"
        @click="closeGuestCard"
      ></div>

      <template v-if="seatText">
        <div
          v-if="seatText"
          class="c-mobile-seat-table-guest-card__title c-mobile-seat-table-guest-card__title--has-seat pws-mobile-seat-table-guest-card__title"
          :data-content="seatText"
        >
          <span>{{ seatText }}</span>
        </div>

        <div class="c-mobile-seat-table-guest-card__tips pws-mobile-seat-table-guest-card__title">
          {{ $lang('seatTable.seatTips1') }}
        </div>
      </template>
      <template v-else>
        <div
          class="c-mobile-seat-table-guest-card__title c-mobile-seat-table-guest-card__title--no-seat"
          :data-content="$lang('seatTable.seatTips2')"
        >
          <span>{{ $lang('seatTable.seatTips2') }}</span>
        </div>
      </template>

      <div class="c-mobile-seat-table-guest-card__poster">
        <mobile-invite-poster
          :type="-1"
          :extra-info="posterSeatInfo"
        />
      </div>

      <div class="c-mobile-seat-table-guest-card__bottom">{{ $lang('seatTable.seatTips3') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileInvitePoster from '@/components/page-watch-common/invite/mobile-invite-poster/mobile-invite-poster.vue';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { ref } from 'vue';
import { useSeatTableGuestCard } from './use-seat-table-guest-card';
import { useSeatTable } from '../../use-seat-table';

const guestCardRef = ref<HTMLDivElement>();

useAppendTo(guestCardRef);

const { visible, posterSeatInfo, closeGuestCard } = useSeatTableGuestCard();

const { seatText } = useSeatTable();
</script>

<style lang="scss">
.c-mobile-seat-table-guest-card {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $--zIndex-pendant + 1;
  width: 100%;
  height: 100%;
  background-color: rgba(#000, 0.65);
}
.c-mobile-seat-table-guest-card__main {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 240px;
  height: 340px;
  text-align: center;
  background-image: url(./imgs/bg.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  transform: translate(-50%, -50%);
}

.c-mobile-seat-table-guest-card__close {
  position: absolute;
  bottom: -66px;
  left: 50%;
  width: 32px;
  height: 32px;
  background-color: transparent;
  background-image: url(./imgs/close-ico.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  transform: translateX(-50%);
  &::before {
    position: absolute;
    bottom: 100%;
    left: 50%;
    width: 1px;
    height: 34px;
    content: '';
    background: #fff;
    transform: translate(-50%, 0);
  }
}

.c-mobile-seat-table-guest-card__title {
  position: absolute;
  left: 0;
  width: 100%;
  font-size: 24px;
  font-weight: 900;
  line-height: 36px;
  color: #ffffff;
  letter-spacing: 1px;
  transform: translateZ(0);
  span {
    z-index: 1;
    background-clip: text;
  }
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    color: #fff;
    text-shadow: 0 0 4px #0067b8;
    content: attr(data-content);
  }
  @supports (background-clip: text) {
    color: transparent;
  }
}
.c-mobile-seat-table-guest-card__title--has-seat {
  top: 24px;
}
.c-mobile-seat-table-guest-card__title--no-seat {
  top: 40px;
}

.c-mobile-seat-table-guest-card__tips {
  position: absolute;
  top: 76px;
  left: 0;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
}

.c-mobile-seat-table-guest-card__poster {
  position: absolute;
  top: 104px;
  left: 50%;
  width: 100px;
  height: 178px;
  transform: translate(-50%, 0);
}

.c-mobile-seat-table-guest-card__bottom {
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 100%;
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: #ffffff;
}
</style>
