<!-- @file 学习时长弹窗 -->
<template>
  <mobile-message-box
    ref="messageBox"
    cancel-button-text=""
    :confirm-button-text="$lang('base.ok')"
    class="c-mobile-learning-stat-dialog"
    @confirm="onMessageBoxConfirm"
  >
    <div
      slot="content"
      class="c-mobile-learning-stat-dialog__content"
    >
      <div class="c-mobile-learning-stat-dialog__content__header">
        <mobile-icon-warning-round-fill
          v-if="!isCourseFinish"
          class="c-mobile-learning-stat-dialog__icon c-mobile-learning-stat-dialog__icon--warning"
        />
        <mobile-icon-check-round-fill
          v-else
          class="c-mobile-learning-stat-dialog__icon c-mobile-learning-stat-dialog__icon--success"
        />

        <div class="c-mobile-learning-stat-dialog__content__header__tips">
          {{ $lang('learningStat.dialog.content.header.tips') }}
        </div>
      </div>

      <div class="c-mobile-learning-stat-dialog__content__info">
        <div
          v-html="
            $lang('learningStat.dialog.content.info.courseTime', {
              minutes: `<span class='c-mobile-learning-stat-dialog__primary-text'>${courseTime}</span>`,
            })
          "
        ></div>
        <div
          v-html="
            $lang('learningStat.dialog.content.info.percent', {
              percent: `<span class='c-mobile-learning-stat-dialog__primary-text'>${studyProgressRatePercent}%</span>`,
            })
          "
        ></div>
      </div>
    </div>
  </mobile-message-box>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import MobileMessageBox from '@/components/common-base/message-box/mobile-message-box.vue';
import { MessageBoxInstance } from '@/components/common-base/message-box';

import {
  MobileIconWarningRoundFill,
  MobileIconCheckRoundFill,
} from '@/components/component-icons/mobile/map';
import { useLearningStatDialog } from './use-learning-stat-dialog';

const messageBox = ref<MessageBoxInstance>();

const {
  dialogVisible,

  courseTime,
  isCourseFinish,
  studyProgressRatePercent,
} = useLearningStatDialog();

watch(
  () => dialogVisible.value,
  () => {
    if (dialogVisible.value && messageBox.value) {
      messageBox.value.$open();
    }
  },
);

function onMessageBoxConfirm() {
  dialogVisible.value = false;
}
</script>

<style lang="scss">
.c-mobile-learning-stat-dialog__icon {
  display: block;
  font-size: 50px;
}
.c-mobile-learning-stat-dialog__icon--warning {
  color: #3082fe;
}
.c-mobile-learning-stat-dialog__icon--success {
  color: #62c352;
}

.c-mobile-learning-stat-dialog__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.8);
}

.c-mobile-learning-stat-dialog__content__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.c-mobile-learning-stat-dialog__content__header__tips {
  margin-top: 22px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.c-mobile-learning-stat-dialog__content__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  line-height: 22px;

  .c-mobile-learning-stat-dialog__primary-text {
    color: #3082fe;
  }
}
</style>
