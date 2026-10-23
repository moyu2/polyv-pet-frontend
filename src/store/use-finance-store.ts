import { computed, ComputedRef, ref, Ref, watch } from 'vue';
import { defineStore } from 'pinia';

import {
  FinanceRiskConfirmSetting,
  FinanceRiskEvaluation,
  PlvFinanceRiskConfirmModule,
  PlvFinanceRiskEvaluationModule,
} from '@polyv/live-watch-sdk';

import { ynToBool } from '@polyv/utils/boolean';
import { useWatchAppStore } from './use-watch-app-store';

export interface FinanceStoreState {
  /** 风险确认函数据 */
  riskConfirm: Ref<FinanceRiskConfirmSetting>;
  /** 风险确认函开关 */
  riskConfirmEnabled: ComputedRef<boolean>;
  /** 风险测评数据 */
  riskEvaluation: Ref<FinanceRiskEvaluation>;
  /** 风险测评-是否展示引导页 */
  shouldShowSplashByRiskEvaluation: Ref<boolean>;
  /** 风险测评开关 */
  riskEvaluationEnabled: ComputedRef<boolean>;
  /** 风险测评-是否展示挂件入口 */
  riskEvaluationEntranceEnabled: Ref<boolean>;
}

export interface FinanceStoreAction {
  /** 同步金融 Store 数据 */
  syncFinanceStore: () => void;
  /** 更新风险确认函数据 */
  updateRiskConfirm: (riskEvaluation: Partial<FinanceRiskConfirmSetting>) => void;
  /** 更新风险测评数据 */
  updateRiskEvaluation: (riskEvaluation: Partial<FinanceRiskEvaluation>) => void;
}

export interface FinanceStore extends FinanceStoreState, FinanceStoreAction {}

/** @store 金融模块 */
export const useFinanceStore = defineStore<'finance', FinanceStore>('finance', () => {
  const watchAppStore = useWatchAppStore();

  // ----------- 风险确认函 ----------- //

  /** 风险确认函数据 */
  const riskConfirm = ref(PlvFinanceRiskConfirmModule.generateDefaultRiskConfirmSetting());

  /** 风险确认函开关 */
  const riskConfirmEnabled = computed(() => {
    // 配置开关启用 && 未确认
    return ynToBool(riskConfirm.value.riskConfirmEnabled) && !riskConfirm.value.riskConfirmStatus;
  });

  /** 更新风险测评数据 */
  function updateRiskConfirm(data: Partial<FinanceRiskConfirmSetting>) {
    const originData = riskConfirm.value;
    riskConfirm.value = {
      ...originData,
      ...data,
    };
  }

  /** 初始化风险确认函数据 */
  function initRiskConfirm() {
    const watchCore = watchAppStore.getWatchCore();
    const data = watchCore.financeRiskConfirm.getRiskConfirmSetting();

    riskConfirm.value = data;
  }

  // ----------- 风险测评 ----------- //

  /** 风险测评数据 */
  const riskEvaluation = ref(PlvFinanceRiskEvaluationModule.generateDefaultRiskEvaluation());

  /** 风险测评-是否展示引导页 */
  const shouldShowSplashByRiskEvaluation = ref(false);

  /** 风险测评开关 */
  const riskEvaluationEnabled = computed(() => {
    return ynToBool(riskEvaluation.value.evaluationEnabled);
  });

  /** 风险测评-是否展示挂件入口 */
  const riskEvaluationEntranceEnabled = ref(false);

  watch(
    () => riskEvaluation.value,
    () => {
      const watchCore = watchAppStore.getWatchCore();

      // 风险测评启用，且为后置条件时，需要展示挂件
      riskEvaluationEntranceEnabled.value =
        watchCore.financeRiskEvaluation.judgeNeedShowRiskEvaluationInAfter(riskEvaluation.value);
    },
  );

  /** 更新风险测评数据 */
  function updateRiskEvaluation(data: Partial<FinanceRiskEvaluation>) {
    const originData = riskEvaluation.value;
    riskEvaluation.value = {
      ...originData,
      ...data,
    };
  }

  /** 初始化风险测评数据 */
  function initRiskEvaluation() {
    const watchCore = watchAppStore.getWatchCore();

    const data = watchCore.financeRiskEvaluation.getRiskEvaluationSetting();

    riskEvaluation.value = data;
    // 风险测评启用，且为前置条件时，需要强制展示引导页
    shouldShowSplashByRiskEvaluation.value =
      watchCore.financeRiskEvaluation.judgeNeedShowRiskEvaluationInPre(riskEvaluation.value);
  }

  // ----------- 公共 ----------- //

  /** 同步金融 Store 数据 */
  function syncFinanceStore() {
    initRiskConfirm();
    initRiskEvaluation();
  }

  return {
    riskConfirm,
    riskConfirmEnabled,
    riskEvaluation,
    shouldShowSplashByRiskEvaluation,
    riskEvaluationEnabled,
    riskEvaluationEntranceEnabled,

    syncFinanceStore,
    updateRiskConfirm,
    updateRiskEvaluation,
  };
});
