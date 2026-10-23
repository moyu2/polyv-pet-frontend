<!-- @file 学习时长弹窗 -->
<template>
  <pc-dialog
    ref="dialogRef"
    :visible.sync="dialogVisible"
    :width="320"
    body-locked
    hide-header-border
    :mount-el="dialogMountEl"
    :position-computed-elem="positionComputedElem"
    class="c-pc-learning-stat-dialog"
  >
    <div class="c-pc-learning-stat-dialog__content">
      <div class="c-pc-learning-stat-dialog__content__header">
        <pc-icon-warning-round-fill
          v-if="!isCourseFinish"
          class="c-pc-learning-stat-dialog__icon c-pc-learning-stat-dialog__icon--warning"
        />
        <pc-icon-check-round-fill
          v-else
          class="c-pc-learning-stat-dialog__icon c-pc-learning-stat-dialog__icon--success"
        />

        <div class="c-pc-learning-stat-dialog__content__header__tips">
          {{ $lang('learningStat.dialog.content.header.tips') }}
        </div>
      </div>

      <div class="c-pc-learning-stat-dialog__content__info">
        <div
          v-html="
            $lang('learningStat.dialog.content.info.courseTime', {
              minutes: `<span class='c-pc-learning-stat-dialog__primary-text'>${courseTime}</span>`,
            })
          "
        ></div>
        <div
          v-html="
            $lang('learningStat.dialog.content.info.percent', {
              percent: `<span class='c-pc-learning-stat-dialog__primary-text'>${studyProgressRatePercent}%</span>`,
            })
          "
        ></div>
      </div>

      <div class="c-pc-learning-stat-dialog__content__footer">
        <normal-button
          :type="ButtonType.Primary"
          :size="ButtonSize.Small"
          :text="$lang('base.ok')"
          @click="onConfirm"
        />
      </div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { PcIconWarningRoundFill, PcIconCheckRoundFill } from '@/components/component-icons/pc/map';
import { useLearningStatDialog } from './use-learning-stat-dialog';
import { useComputePcDialogForPlayer } from '@/hooks/business/use-compute-pc-dialog-for-player/use-compute-pc-dialog-for-player';
import NormalButton, { ButtonType, ButtonSize } from '@/components/common-base/normal-button';

const {
  dialogVisible,

  courseTime,
  isCourseFinish,
  studyProgressRatePercent,
} = useLearningStatDialog();

const {
  dialogRef,

  dialogMountEl,
  positionComputedElem,
} = useComputePcDialogForPlayer();

function onConfirm() {
  dialogVisible.value = false;
}
</script>

<style lang="scss">
.c-pc-learning-stat-dialog__icon {
  display: block;
  font-size: 50px;
}
.c-pc-learning-stat-dialog__icon--warning {
  color: #3082fe;
}
.c-pc-learning-stat-dialog__icon--success {
  color: #62c352;
}

.c-pc-learning-stat-dialog__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 12px;
  color: rgba(0, 0, 0, 0.8);
}

.c-pc-learning-stat-dialog__content__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.c-pc-learning-stat-dialog__content__header__tips {
  margin-top: 22px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.c-pc-learning-stat-dialog__content__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  margin-bottom: 22px;
  font-size: 14px;
  line-height: 22px;

  .c-pc-learning-stat-dialog__primary-text {
    color: #3082fe;
  }
}

.c-pc-learning-stat-dialog__content__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
}
</style>
