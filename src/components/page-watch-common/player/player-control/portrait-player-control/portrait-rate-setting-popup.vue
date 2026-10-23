<!-- @file 竖屏端倍速设置 -->
<template>
  <mobile-popup
    class="c-portrait-rate-setting-popup"
    :visible.sync="rateVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
    :title="$lang('player.rate')"
    backable
    @click-back="onClickBack"
  >
    <ul
      class="c-portrait-player-control__select-list c-portrait-player-control__select-list--mini c-portrait-player-control__select-list--space-between"
    >
      <li
        v-for="(item, index) in rateSettingList"
        :key="index"
        class="c-portrait-player-control__select-item pws-portrait-player-control__select-item"
        :class="{
          'c-portrait-player-control__select-item--active pws-portrait-player-control__select-item--activity':
            item.active,
        }"
        @click="onClickItem(item.value)"
      >
        {{ item.text }}
      </li>
    </ul>
  </mobile-popup>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { PopupTheme } from '@/components/common-base/popup/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { usePortraitSettingPopup } from './use-portrait-setting-popup';
import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerAction } from '../../hooks/use-player-action';

const {
  visible: rateVisible,
  useTransition,
  onClickBack,
  closePopup,
} = usePortraitSettingPopup(appEvents.portrait.OpenRateSettingPopup);

const { rateSettingList } = usePlayerControl();

const { toChangeRate } = usePlayerAction();

function onClickItem(rate: number) {
  toChangeRate(rate);
  closePopup();
}
</script>

<style lang="scss">
@import './_styles/control-select-options.scss';
</style>
