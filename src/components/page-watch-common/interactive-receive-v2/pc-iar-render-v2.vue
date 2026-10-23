<template>
  <div class="c-pc-iar-render-v2">
    <!-- 签到 -->
    <pc-check-in-dialog />

    <!-- 问卷 -->
    <questionnaire-dialog />

    <!-- 答题卡 -->
    <answer-card-dialog />
  </div>
</template>

<script setup lang="ts">
import PcCheckInDialog from '../interactive-receive-v2/check-in-v2/pc-check-in-dialog.vue';
import AnswerCardDialog from './answer-card-v2/answer-card-dialog/answer-card-dialog.vue';
import QuestionnaireDialog from './questionnaire-v2/questionnaire-dialog/questionnaire-dialog.vue';
</script>
