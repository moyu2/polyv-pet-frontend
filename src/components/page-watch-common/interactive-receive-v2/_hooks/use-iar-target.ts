import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { ref, watch } from 'vue';

export const useIarTarget = <T>(fn: () => Promise<T>, afterCreate?: (iarTarget: T) => unknown) => {
  const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

  const targetInited = ref(false);

  let iarTarget: T | undefined;

  async function createIarTarget() {
    if (iarTarget && targetInited.value) {
      return;
    }

    iarTarget = await fn();
    targetInited.value = true;
    afterCreate && afterCreate(iarTarget);
  }

  function getIarTarget(): T {
    if (!iarTarget) {
      throw new Error('iarTarget is undefined');
    }
    return iarTarget;
  }

  watch(
    iarSdkLoaded,
    () => {
      if (iarSdkLoaded.value) {
        createIarTarget();
      }
    },
    {
      immediate: true,
    },
  );

  return {
    targetInited,
    createIarTarget,
    getIarTarget,
  };
};
