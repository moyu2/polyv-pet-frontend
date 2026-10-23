<!-- @file 移动端图文直播 -->
<template>
  <div class="c-mobile-tuwen-live">
    <div class="c-mobile-tuwen-live__header pws-iar-mobile-tuwen-live-header">
      <div class="c-mobile-tuwen-live__total">
        {{ $lang('interact.tuwen.total') }}<span>{{ messageTotal }}</span
        >{{ $lang('interact.tuwen.totalCount') }}
      </div>

      <div
        class="c-mobile-tuwen-live__menu"
        @click="openChoiceMode"
      >
        {{ currentTuwenModeText }}
        <mobile-icon-arrow-down class="c-mobile-tuwen-live__menu__icon" />
      </div>
    </div>

    <div
      id="scrollContainer"
      class="c-mobile-tuwen-live__main"
    >
      <iar-mobile-tuwen
        scroll-container="scrollContainer"
        :tuwen-sdk="tuwenSdk"
        :mode="tuwenMode"
        disable-preview
        @show-preview="previewTuwenImage"
        @change-message-total="onMessageTotalChange"
      />

      <mobile-page-footer />
    </div>

    <mobile-action-sheet
      :visible.sync="choiceModeVisible"
      :actions="tuwenModeOptions"
      :action-value.sync="tuwenMode"
    />
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';
import MobileActionSheet from '@/components/common-base/action-sheet/mobile-action-sheet.vue';
import { ref } from 'vue';
import { useTuwenLive, useTuwenLiveMode } from './hooks/use-tuwen-live';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileTuwen = getIarComponent('MobileTuwen');

const { tuwenSdk, messageTotal, onMessageTotalChange, previewTuwenImage } = useTuwenLive();

const { tuwenMode, tuwenModeOptions, currentTuwenModeText } = useTuwenLiveMode();

// 选择模式显示状态
const choiceModeVisible = ref(false);
const openChoiceMode = () => {
  choiceModeVisible.value = true;
};
</script>

<style lang="scss">
.c-mobile-tuwen-live {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-mobile-tuwen-live__main {
  flex: 1;
  padding: 0 16px;
  overflow: auto;
}

.c-mobile-tuwen-live__header {
  position: relative;
  padding: 10px 12px 10px 16px;
  font-size: 14px;
  line-height: 20px;
}
.c-mobile-tuwen-live__total {
  float: left;
}
.c-mobile-tuwen-live__menu {
  display: flex;
  align-items: center;
  float: right;
}
.c-mobile-tuwen-live__menu__icon {
  display: flex;
  margin-left: 2px;
  font-size: 16px !important;
}
</style>
