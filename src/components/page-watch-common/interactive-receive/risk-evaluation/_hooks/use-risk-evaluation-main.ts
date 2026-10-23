import { ref, computed, watchEffect } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useFinanceStore } from '@/store/use-finance-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import {
  QuestionnaireEvaluationResult,
  RiskEvaluationMainDialogOpenMode,
} from '../types/risk-evaluation-types';
import { useGlobalInject } from '@/app/use-global-inject';

/** 风险测评-副作用处理 */
const useRiskEvaluationMainEffect = ({
  mainDialogShowEventHandler,
}: {
  mainDialogShowEventHandler: () => void;
}) => {
  const authStore = useAuthStore();
  const enrollStore = useEnrollStore();
  const financeStore = useFinanceStore();

  // 通过副作用函数来监听主弹窗展示
  watchEffect(() => {
    // 需要授权通过获取用户信息后才能展示弹窗
    if (!authStore.isAuthorized || enrollStore.needEnrollByEnter) return;

    if (financeStore.shouldShowSplashByRiskEvaluation) {
      mainDialogShowEventHandler();
    }
  });
};

/**
 * @hook 风险测评-主要弹窗
 */
export const useRiskEvaluationMainHook = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();

  const financeStore = useFinanceStore();
  const { riskEvaluation } = storeDefinitionToRefs(useFinanceStore);

  /** 问卷 SDK 实例 */
  const questionnaireSdk = watchCore.interactReceive.getQuestionnaire();

  /** 风险测评-问卷结果 */
  const riskEvaluationResult = ref<QuestionnaireEvaluationResult | null>(null);

  /** 控制弹窗显示 */
  const dialogVisible = ref(false);

  /** 是否手动触发 */
  const isManualTrigger = ref(false);

  /** 是否强制开始 */
  const isForceStart = ref(false);

  /**
   * 弹窗关闭按钮可见性
   * @desc 仅在“自愿填写”，“测评完成且符合等级要求”才能展示
   * */
  const dialogCloseable = computed(() => {
    const isPass = watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation.value);
    return isManualTrigger.value || isPass;
  });

  /** 打开弹窗钩子 */
  function handleOpenDialog({ openMode }: { openMode?: RiskEvaluationMainDialogOpenMode }) {
    isManualTrigger.value = openMode === RiskEvaluationMainDialogOpenMode.ManualOpen;
    isForceStart.value = openMode === RiskEvaluationMainDialogOpenMode.TimeoutAutoOpen;
    dialogVisible.value = true;
  }

  /** 关闭弹窗钩子 */
  function handleCloseDialog() {
    dialogVisible.value = false;
    isManualTrigger.value = false;
    isForceStart.value = false;
  }

  /** 监听问卷结果回调 */
  function onQuestionnaireEvaluationResult(result: QuestionnaireEvaluationResult) {
    riskEvaluationResult.value = result;
  }

  /** 监听问卷关闭回调 */
  function onQuestionnaireHide() {
    if (!riskEvaluationResult.value) {
      console.warn('无问卷评测结果');
      return;
    }

    const { passEvaluation, score } = riskEvaluationResult.value;
    const isPass = watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation({
      ...riskEvaluation.value,
      passEvaluation,
      score,
    });
    if (!isPass && !dialogCloseable.value) return;

    handleCloseDialog();

    const isPreLimitType = watchCore.financeRiskEvaluation.judgeIsPreLimitType(
      riskEvaluation.value,
    );
    if (isPreLimitType) {
      watchAppStore.resetUpWatchCore();
    } else {
      financeStore.updateRiskEvaluation({
        passEvaluation,
        score,
      });
    }
  }

  /**
   * 主要弹窗事件钩子函数
   * @desc 对应 RiskEvaluationMainDialogShow
   */
  function mainDialogShowEventHandler({
    openMode,
  }: { openMode?: RiskEvaluationMainDialogOpenMode } = {}) {
    handleOpenDialog({ openMode });
  }

  // 副作用打开弹窗
  useRiskEvaluationMainEffect({ mainDialogShowEventHandler });

  // 打开弹窗
  useEventBusListener(appEvents.finance.RiskEvaluationMainDialogShow, mainDialogShowEventHandler);

  // 关闭弹窗
  useEventBusListener(appEvents.finance.RiskEvaluationMainDialogHidden, () => {
    handleCloseDialog();
  });

  return {
    questionnaireSdk,

    dialogVisible,
    dialogCloseable,
    isForceStart,

    handleCloseDialog,
    onQuestionnaireEvaluationResult,
    onQuestionnaireHide,
  };
};
