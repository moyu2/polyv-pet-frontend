<!-- @file 移动端积分记录弹层 -->
<template>
  <mobile-popup
    class="c-mobile-score-record-popup"
    fill-body-section
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    :visible.sync="scoreRecordVisible"
    :title="scoreRecordTitle"
    @after-leave="setScoreRecordRender(false)"
  >
    <iar-mobile-score-record
      v-if="scoreRecordRender"
      :red-envelope-sdk="redpackSdk"
      :unit="scoreUnit"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useScoreRecord } from './hooks/use-score-record';
import { useRedpackStore } from '@/store/use-redpack-store';

const IarMobileScoreRecord = getIarComponent('MobilePointRERecord');

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { scoreUnit } = storeDefinitionToRefs(useRedpackStore);

const {
  redpackSdk,
  scoreRecordVisible,
  scoreRecordTitle,
  scoreRecordRender,
  setScoreRecordRender,
} = useScoreRecord();
</script>
