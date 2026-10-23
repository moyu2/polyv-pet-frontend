import { defineComponent } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useLuckyBagTarget } from './use-lucky-bag';

/**
 * 福袋接收端全局注入
 */
export const LuckyBagProvider = defineComponent({
  setup(_, { slots }) {
    const { getEntrance } = useIarUILoader('lucky-bag-ui-receive');
    const Pkg = getEntrance<typeof PolyvLuckyBagUIPkg>();
    const { targetInited, getIarTarget } = useLuckyBagTarget();

    Pkg.useLuckyBagGlobalProvide({
      getLuckyBagTarget: getIarTarget,
    });

    return () => {
      if (targetInited.value) {
        return slots.default?.();
      }

      return null;
    };
  },
});
