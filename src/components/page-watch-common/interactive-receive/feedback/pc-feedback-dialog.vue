<!-- @file PC 端反馈弹窗 -->
<template>
  <pc-dialog
    class="c-pc-feedback-dialog"
    draggable
    :mask="false"
    :title="feedbackTitle"
    :visible.sync="feedbackVisible"
  >
    <iar-pc-feed-back
      :feed-back-sdk="feedbackSdk"
      :is-show-feed-back="feedbackVisible"
      @to-show="setFeedbackVisible(true)"
      @to-hide="setFeedbackVisible(false)"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useFeedback } from './hooks/use-feedback';

const IarPcFeedBack = getIarComponent('PcFeedBack');

const { feedbackSdk, feedbackTitle, feedbackVisible, setFeedbackVisible } = useFeedback();
</script>
