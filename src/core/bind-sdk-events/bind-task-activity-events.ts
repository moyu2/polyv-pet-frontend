import { useTaskActivityStore } from '@/store/use-task-activity-store';
import { PolyvWatchCore, TaskActivityEvents } from '@polyv/live-watch-sdk';

export function bindTaskActivityEvents(watchCore: PolyvWatchCore) {
  const taskActivityStore = useTaskActivityStore();

  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.StartTask, () => {
    taskActivityStore.syncTaskActivityStore();
  });
  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.EndTask, () => {
    taskActivityStore.syncTaskActivityStore();
  });
  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.TaskActivityDataUpdate, () => {
    taskActivityStore.syncTaskActivityStore();
  });

  watchCore.taskActivity.eventEmitter.on(TaskActivityEvents.GetBaseDataError, ({ activityId }) => {
    taskActivityStore.updateTaskActivityGetBaseDataError({ activityId });
  });
}
