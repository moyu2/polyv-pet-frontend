<!-- @file 移动端学习详情弹层 -->
<template>
  <mobile-popup
    class="c-mobile-learning-detail-popup"
    :visible.sync="dialogVisible"
    :title="$lang('learningDetail.name')"
    hide-header-border
    content-background="#f7f8fa"
  >
    <div class="c-mobile-learning-detail-popup__content">
      <div class="c-mobile-learning-detail-popup__content__duration-container">
        <mobile-origin-icon-learning-duration :size="38" />
        <span
          class="g-singleline"
          v-html="
            $lang('watch.duration.learnTime', {
              duration: `<span class='c-mobile-learning-detail-popup__content__primary-text'>${viewerWatchDuration}</span>`,
            })
          "
        >
        </span>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/index';
import { useLearningDetail } from './use-learning-detail';
import { MobileOriginIconLearningDuration } from '@/components/component-icons/mobile-origin/map';

const { dialogVisible, viewerWatchDuration } = useLearningDetail();
</script>

<style lang="scss">
.c-mobile-learning-detail-popup__content {
  padding: 8px 12px 96px 12px;
}

.c-mobile-learning-detail-popup__content__duration-container {
  box-sizing: border-box;
  display: flex;
  gap: 12px;
  align-items: center;
  height: 70px;
  padding: 16px 12px;
  overflow: hidden;

  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  background-color: #fff;
  border-radius: 12px;
}

.c-mobile-learning-detail-popup__content__primary-text {
  color: #3082fe;
}
</style>
