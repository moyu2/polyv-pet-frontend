<!-- 福袋中奖记录 -->
<template>
  <div
    class="c-lucky-bag-win-record"
    :class="[skinColorIgnoreClass]"
  >
    <div class="c-lucky-bag-win-record__inner">
      <lucky-bag-provider v-if="luckyBagUILoaded">
        <lucky-bag-win-record-ui
          ref="winRecordRef"
          @to-show="onToShow"
          @to-close="onToClose"
        />
      </lucky-bag-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { defineAsyncComponent, onMounted, ref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';
import { useSkinColorIgnore } from '@polyv/vue-components';

interface LuckyBagWinRecordExpose {
  refreshRecord: () => void;
}

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');

const LuckyBagWinRecordUi = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagWinRecord;
}) as unknown;

const luckyBagUILoaded = ref(false);
const winRecordRef = ref<LuckyBagWinRecordExpose>();

const { getEmitter } = useGlobalInject();

const { toInterruptUserClick } = useInterruptUserClick();

const { skinColorIgnoreClass } = useSkinColorIgnore();

/**
 * 领取弹窗返回时触发：重开「我的奖励」弹层并切回福袋 Tab。
 * 先拦截用户操作（未登录/未设昵称等场景），再打开弹层。
 */
function onToShow() {
  const res = toInterruptUserClick({
    triggerSource: 'personal-reward',
    ignoreSetNick: true,
  });
  if (res) {
    return false;
  }

  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'lucky-bag');
}

/**
 * 中奖记录触发领取弹窗时触发：关闭「我的奖励」弹层，避免领取弹窗被记录列表遮挡。
 */
function onToClose() {
  getEmitter().emit(appEvents.global.ClosePersonalRewardDialog);
}

onMounted(async () => {
  await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  luckyBagUILoaded.value = true;
});
</script>

<style lang="scss">
.c-lucky-bag-win-record {
  box-sizing: border-box;
  height: 100%;
  padding: 0 12px 12px;
}

.c-lucky-bag-win-record__inner {
  height: 100%;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
}
</style>
