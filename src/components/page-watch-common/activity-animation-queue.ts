export type ActivityAnimationTask = () => Promise<void>;

interface ActivityAnimationQueue {
  tail: Promise<void>;
}

const activityAnimationQueues = new WeakMap<object, ActivityAnimationQueue>();

function getActivityAnimationQueue(watchCore: object): ActivityAnimationQueue {
  let queue = activityAnimationQueues.get(watchCore);
  if (!queue) {
    queue = { tail: Promise.resolve() };
    activityAnimationQueues.set(watchCore, queue);
  }
  return queue;
}

export function scheduleActivityAnimation(
  watchCore: object,
  animation: ActivityAnimationTask,
): Promise<void> {
  const queue = getActivityAnimationQueue(watchCore);
  const scheduled = queue.tail.then(animation);
  queue.tail = scheduled.catch(() => undefined);
  return scheduled;
}
