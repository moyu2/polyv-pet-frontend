import { ref, Ref, watch } from 'vue';

export const useLiveActivityTarget = <T>(loaded: Ref<boolean>, getTarget: () => Promise<T>) => {
  const targetInited = ref(false);

  let target: T | undefined;

  async function createTarget() {
    if (target && targetInited.value) {
      return;
    }

    target = await getTarget();
    targetInited.value = true;
  }

  function getLiveActivityTarget(): T {
    if (!target) {
      throw new Error('live activity target is undefined');
    }
    return target;
  }

  watch(
    loaded,
    isLoaded => {
      if (isLoaded) {
        createTarget();
      }
    },
    { immediate: true },
  );

  return {
    targetInited,
    createTarget,
    getLiveActivityTarget,
  };
};
