import { appEvents, useEventBusListener } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { computed, ref } from 'vue';

export const useLearningStatDialog = () => {
  const { viewerWatchDuration } = storeDefinitionToRefs(useChannelInfoStore);

  const dialogVisible = ref(false);

  /** 课程时长，单位：分钟 */
  const courseTime = ref(0);

  /** 学习进度 */
  const studyProgressRatePercent = computed(() => {
    if (!courseTime.value) return 0;

    let percent = Math.floor((viewerWatchDuration.value / courseTime.value) * 100);
    if (percent > 100) {
      percent = 100;
    }
    return isNaN(percent) ? 0 : percent;
  });

  const isCourseFinish = computed(() => {
    return studyProgressRatePercent.value >= 90;
  });

  function onDialogOpenHandler({ videoDurationTime }: { videoDurationTime: number }) {
    courseTime.value = Math.floor(videoDurationTime / 60);
    dialogVisible.value = true;
  }

  useEventBusListener(appEvents.global.OpenLearningStatDialog, onDialogOpenHandler);

  return {
    dialogVisible,

    courseTime,
    isCourseFinish,
    studyProgressRatePercent,
  };
};
