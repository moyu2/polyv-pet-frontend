<!-- @file 竖屏端清晰度切换弹层 -->
<template>
  <mobile-popup
    class="c-portrait-quality-setting-popup"
    :visible.sync="qualityVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
    :title="$lang('player.qualitySetting')"
    backable
    @click-back="onClickBack"
  >
    <ul class="c-portrait-player-control__select-list">
      <li
        v-for="(item, index) in qualitySettingList"
        :key="index"
        class="c-portrait-player-control__select-item pws-portrait-player-control__select-item"
        :class="{
          'c-portrait-player-control__select-item--active pws-portrait-player-control__select-item--activity':
            item.active,
        }"
        data-testid="plv-player-control-quality-level-item"
        :data-testid-active="item.active"
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
  visible: qualityVisible,
  useTransition,
  onClickBack,
  closePopup,
} = usePortraitSettingPopup(appEvents.portrait.OpenQualitySettingPopup);

const { qualitySettingList } = usePlayerControl();

const { toChangeQualityLevel } = usePlayerAction();

function onClickItem(level: number) {
  toChangeQualityLevel(level);
  closePopup();
}
</script>

<style lang="scss">
@import './_styles/control-select-options.scss';
</style>
