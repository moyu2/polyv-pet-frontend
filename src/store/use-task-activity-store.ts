import { TaskActivityData, TaskActivityItem } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface TaskActivityStoreState {
  /**
   * 当前活动数据
   */
  currentActivityData: Ref<TaskActivityData | undefined>;

  /**
   * 任务列表
   */
  taskList: ComputedRef<TaskActivityItem[]>;

  /**
   * 是否显示任务活动挂件
   */
  isShowPendant: ComputedRef<boolean>;

  /**
   * 是否显示任务活动数据获取失败弹层
   */
  isShowTaskActivityErrorPopper: ComputedRef<boolean>;

  /**
   * 获取任务活动数据失败的活动ID
   */
  errorActivityId: Ref<number | undefined>;
}

export interface TaskActivityStoreAction {
  syncTaskActivityStore(): void;
  /**
   * 任务活动数据获取失败
   */
  updateTaskActivityGetBaseDataError: ({ activityId }: { activityId: number }) => void;
}

export interface TaskActivityStore extends TaskActivityStoreState, TaskActivityStoreAction {}

export const useTaskActivityStore = defineStore<'taskActivity', TaskActivityStore>(
  'taskActivity',
  () => {
    const watchAppStore = useWatchAppStore();
    const currentActivityData = ref<TaskActivityData>();
    const errorActivityId = ref<number>();

    // 是否显示任务活动挂件
    const isShowPendant = computed(() => {
      return !!errorActivityId.value || !!currentActivityData.value;
    });

    // 是否显示任务活动数据获取失败弹层
    const isShowTaskActivityErrorPopper = computed(() => {
      return !!errorActivityId.value && !currentActivityData.value;
    });

    const taskList = computed<TaskActivityItem[]>(() => {
      return currentActivityData.value?.tasks || [];
    });

    function syncTaskActivityStore() {
      const watchCore = watchAppStore.getWatchCore();

      const activityData = watchCore.taskActivity.getActivityData();
      currentActivityData.value = activityData;

      // 重置获取基础数据失败状态
      errorActivityId.value = undefined;
    }

    function updateTaskActivityGetBaseDataError({ activityId }: { activityId: number }) {
      errorActivityId.value = activityId;
    }

    return {
      currentActivityData,
      taskList,
      isShowPendant,
      isShowTaskActivityErrorPopper,
      syncTaskActivityStore,
      updateTaskActivityGetBaseDataError,
      errorActivityId,
    };
  },
);
