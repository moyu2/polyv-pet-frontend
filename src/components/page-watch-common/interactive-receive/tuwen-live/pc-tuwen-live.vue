<!-- @file PC 端图文直播 -->
<template>
  <div class="c-pc-tuwen-live">
    <header class="c-pc-tuwen-live__header g-clearfix">
      <div class="c-pc-tuwen-live__menu">
        <span
          v-for="item in tuwenModeOptions"
          :key="item.value"
          class="c-pc-tuwen-live__menu__item pws-pc-tuwen-live-menu-item"
          :class="{
            'is-active': item.isCurrent,
          }"
          @click="changeTuwenMode(item.value)"
          >{{ item.name }}</span
        >
      </div>

      <div
        v-if="messageTotal"
        class="c-pc-tuwen-live__total"
      >
        {{ $lang('interact.tuwen.total') }}{{ messageTotal
        }}{{ $lang('interact.tuwen.totalCount') }}
      </div>
    </header>

    <iar-pc-tuwen
      ref="tuwenRef"
      :tuwen-sdk="tuwenSdk"
      :mode="tuwenMode"
      :scroll-distance="200"
      disable-preview
      @show-preview="previewTuwenImage"
      @change-message-total="onMessageTotalChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useTuwenLive, useTuwenLiveMode } from './hooks/use-tuwen-live';

const IarPcTuwen = getIarComponent('PcTuwen');

const {
  tuwenSdk,
  messageTotal,
  onMessageTotalChange,
  tuwenRef,
  setupScrollListen,
  previewTuwenImage,
} = useTuwenLive();

const { tuwenMode, tuwenModeOptions, changeTuwenMode } = useTuwenLiveMode();

onMounted(() => {
  setupScrollListen();
});
</script>

<style lang="scss">
.c-pc-tuwen-live__header {
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 32px;
  line-height: 32px;
}
.c-pc-tuwen-live__menu {
  display: inline-flex;
  overflow: hidden;
  background-color: $--color-white;
  border-radius: 2px;
}
.c-pc-tuwen-live__menu__item {
  height: 30px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 30px;
  color: #aaa;
  text-align: center;
  cursor: pointer;
  border: 1px solid $--border-color-primary;
  transition-duration: 0.3s;
  transition-property: color, background, border;

  &:first-child {
    border-right: none;
  }
  &:last-child {
    border-left: none;
  }
}
.c-pc-tuwen-live__menu__item:hover,
.c-pc-tuwen-live__menu__item.is-active {
  color: #3082fe;
}
.c-pc-tuwen-live__menu__item.is-active {
  background-color: #e1edfe;
  border-color: #e1edfe;
}

.c-pc-tuwen-live__total {
  display: inline-block;
  margin-left: 24px;
  color: #aaa;
  vertical-align: middle;
}
</style>
