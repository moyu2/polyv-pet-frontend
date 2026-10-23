<!-- @file 移动端+竖屏端反馈弹窗 -->
<template>
  <mobile-popup
    class="c-mobile-feedback-popup"
    fill-body-section
    :title="feedbackTitle"
    :visible.sync="feedbackVisible"
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
  >
    <iar-mobile-feed-back
      :feed-back-sdk="feedbackSdk"
      :is-show-feed-back="feedbackVisible"
      @to-show="setFeedbackVisible(true)"
      @to-hide="setFeedbackVisible(false)"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useFeedback } from './hooks/use-feedback';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const IarMobileFeedBack = getIarComponent('MobileFeedBack');

const { feedbackSdk, feedbackTitle, feedbackVisible, setFeedbackVisible } = useFeedback();
</script>
