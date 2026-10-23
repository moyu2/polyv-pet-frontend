import { onBeforeMount, onMounted, ref, nextTick } from 'vue';

interface LazyLoadQueueTrigger {
  [stackKey: string]: {
    doNext: () => void;
  };
}

/** 懒加载队列 */
const lazyLoadQueue: string[] = [];

/** 懒加载队列钩子 */
const lazyLoadQueueTrigger: LazyLoadQueueTrigger = {};

/**
 * 处理页面布局懒加载
 * @hook
 */
export const useLayoutLoad = (
  key: string,
  opts?: {
    beforeTriggerNext?: () => Promise<void>;
  },
) => {
  const { beforeTriggerNext = () => {} } = opts || {};

  const layoutLoaded = ref(false);

  async function processLazyMount() {
    layoutLoaded.value = true;
    const currentItem = lazyLoadQueue.shift();
    console.log(`[render][useLayoutLoad][${currentItem}] process lazyMount`);

    await beforeTriggerNext();

    const nextItem = lazyLoadQueue[0];
    if (!nextItem) return;

    await nextTick();
    lazyLoadQueueTrigger[nextItem].doNext();
  }

  onBeforeMount(() => {
    // 借助 vue 钩子执行机制，在 created 时入队
    lazyLoadQueue.push(key);
    lazyLoadQueueTrigger[key] = {
      doNext: async () => {
        await processLazyMount();
      },
    };
  });

  onMounted(async () => {
    console.log(`[render][useLayoutLoad][${key}] mounted`);

    // 借助 vue 钩子执行机制，在 mounted 里获取队列第一项，开始进行懒加载挂载
    const firstItem = lazyLoadQueue[0];
    if (key === firstItem) {
      await processLazyMount();
    }
  });

  return {
    layoutLoaded,
  };
};
