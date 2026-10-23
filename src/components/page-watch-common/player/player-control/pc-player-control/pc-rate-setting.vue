<!-- @file PC 端倍速设置 -->
<template>
  <div class="c-pc-player-control__rate-setting c-pc-player-control__capsule">
    <div class="c-pc-player-control__capsule__content">
      {{ $lang('player.rate') }}
    </div>
    <ul class="c-pc-player-control__select-panel">
      <li
        v-for="(item, index) in rateSettingList"
        :key="index"
        class="c-pc-player-control__select-panel__item"
        :class="{
          'c-pc-player-control__select-panel__item--active': item.active,
        }"
        @click="toChangeRate(item.value)"
      >
        {{ item.text }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';

const { rateSettingList } = usePlayerControl();

const { toChangeRate } = usePlayerAction();
</script>
