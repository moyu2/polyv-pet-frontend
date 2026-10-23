import { computed, ref, reactive, watchEffect, nextTick } from 'vue';
import {
  FinanceRiskConfirmAgreement,
  FinanceRiskConfirmConditionType,
  FinanceRiskConfirmInfo,
} from '@polyv/live-watch-sdk';
import { useToastManager } from '@/hooks/components/use-toast';
import { useFinanceStore } from '@/store/use-finance-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { debounce } from 'lodash-es';
import { translate } from '@/assets/lang';
import { useSecondCountDown } from '@/hooks/tools/use-count-down';
import { useGlobalInject } from '@/app/use-global-inject';

export enum RiskConfirmLetterRenderMode {
  /** 默认展示 */
  Default = 'default',
  /** 预览协议 */
  PreviewAgreement = 'previewAgreement',
  /** "不同意"的提示 */
  DisagreeTips = 'disagreeTips',
}

enum RiskConfirmAgreeStatus {
  Default = 0,
  Agree = 1,
  Disagree = 2,
}

export const useRiskConfirmLetterHook = () => {
  const watchAppStore = useWatchAppStore();
  const financeStore = useFinanceStore();

  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { surplusTime, startCountDown } = useSecondCountDown();

  const dialogVisible = ref(false);

  /** 风险确认同意状态 */
  const riskConfirmAgreeStatus = ref(RiskConfirmAgreeStatus.Default);

  /** 观众风险确认信息 */
  const viewerRiskConfirmInfo = ref<FinanceRiskConfirmInfo | null>(null);

  /** 当前预览的协议 */
  const curPreviewAgreement = reactive({
    title: '',
    src: '',
  });

  /** 风险确认函-渲染模式 */
  const riskConfirmLetterRenderMode = computed(() => {
    if (curPreviewAgreement.src) {
      return RiskConfirmLetterRenderMode.PreviewAgreement;
    }

    if (riskConfirmAgreeStatus.value === RiskConfirmAgreeStatus.Disagree) {
      return RiskConfirmLetterRenderMode.DisagreeTips;
    }

    return RiskConfirmLetterRenderMode.Default;
  });

  const contentWrapperStyle = computed(() => {
    if (riskConfirmLetterRenderMode.value === RiskConfirmLetterRenderMode.PreviewAgreement) {
      return {
        minHeight: '400px',
      };
    }
    return {
      minHeight: '212px',
      maxHeight: '212px',
    };
  });

  /** 风险确认函内容渲染 DOM 节点 */
  const RiskConfirmLetterContentRef = ref<HTMLDivElement>();

  function onRiskConfirmLetterContentRefClick() {
    if (!RiskConfirmLetterContentRef.value) {
      console.warn('need contentRef exist');
      return;
    }
    RiskConfirmLetterContentRef.value.addEventListener(
      'click',
      evt => {
        evt.preventDefault();

        const target = evt.target as HTMLElement;
        if (!target) return;

        const watchCore = getWatchCore();
        const data = watchCore.financeRiskConfirm.getRiskConfirmAgreementByContentDom(target);
        if (!data.success) return;

        handlePreviewAgreement(data);
      },
      true,
    );
  }

  /** 预览协议 */
  function handlePreviewAgreement(agreement: FinanceRiskConfirmAgreement) {
    if (!viewerRiskConfirmInfo.value) return;

    curPreviewAgreement.title = agreement.agreementTitle;
    curPreviewAgreement.src = agreement.agreementUrl;
  }

  const isScrollToBottom = ref(false);

  const onRiskConfirmLetterContentRefScroll = debounce((evt: UIEvent) => {
    const scrollDom = evt.target as HTMLElement | null;
    if (!scrollDom) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollDom;
    if (scrollTop + clientHeight > scrollHeight - 50) {
      isScrollToBottom.value = true;
    }
  }, 200);

  /** 是否倒计时结束 */
  const isCountDownEnd = computed(() => {
    return surplusTime.value.seconds === 0;
  });

  const agreeBtnEnabled = computed(() => {
    if (!viewerRiskConfirmInfo.value) return false;

    if (viewerRiskConfirmInfo.value.confirmConditionType === FinanceRiskConfirmConditionType.ALL) {
      return isScrollToBottom.value;
    }

    if (viewerRiskConfirmInfo.value.confirmConditionType === FinanceRiskConfirmConditionType.PART) {
      return isCountDownEnd.value;
    }

    return true;
  });

  const agreeBtnText = computed(() => {
    if (
      viewerRiskConfirmInfo.value &&
      viewerRiskConfirmInfo.value.confirmConditionType === FinanceRiskConfirmConditionType.PART &&
      !isCountDownEnd.value
    ) {
      return `${translate('risk.confirm.letter.agree')}(${surplusTime.value.seconds}s)`;
    }

    return translate('risk.confirm.letter.agree');
  });

  /** 同意确认 */
  async function handleAgreeRiskConfirm() {
    if (!agreeBtnEnabled.value) {
      return;
    }

    const watchCore = getWatchCore();
    const result = await watchCore.financeRiskConfirm.agreeRiskConfirm();

    if (result.success) {
      dialogVisible.value = false;
      riskConfirmAgreeStatus.value = RiskConfirmAgreeStatus.Agree;

      financeStore.updateRiskConfirm({
        riskConfirmStatus: true,
      });
      watchAppStore.recoverConnectLiveWatch();
    } else {
      console.error(result.failMessage);
      toast.error(translate('base.error.unknown'));
    }
  }

  /** 不同意 */
  function handleDisagreeRiskConfirm() {
    riskConfirmAgreeStatus.value = RiskConfirmAgreeStatus.Disagree;
  }

  /** 重置风险确认函渲染模式 */
  function resetRiskConfirmLetterRenderMode() {
    curPreviewAgreement.title = '';
    curPreviewAgreement.src = '';

    riskConfirmAgreeStatus.value = RiskConfirmAgreeStatus.Default;
  }

  /**
   * 初始化观众风险确认信息
   * @desc 需要在获取到观众信息后才能正常使用
   * */
  async function initViewerRiskConfirmInfo() {
    const watchCore = getWatchCore();
    const result = await watchCore.financeRiskConfirm.getViewerRiskConfirmInfo();
    if (!result.success) {
      console.error(result.failMessage);
      return;
    }

    viewerRiskConfirmInfo.value = result;
  }

  // 副作用监听
  const stopWatchEffect = watchEffect(async () => {
    if (!financeStore.riskConfirmEnabled) return;
    if (watchAppStore.shouldShowForceAuth || watchAppStore.shouldShowSplash) return;
    if (!watchAppStore.watchPageInited) return;

    await initViewerRiskConfirmInfo();
    dialogVisible.value = true;
    stopWatchEffect();

    nextTick(() => {
      onRiskConfirmLetterContentRefClick();

      if (
        viewerRiskConfirmInfo.value &&
        viewerRiskConfirmInfo.value.confirmConditionType === FinanceRiskConfirmConditionType.PART
      ) {
        startCountDown({ second: viewerRiskConfirmInfo.value.readSeconds });
      }

      // 检查内容是否需要滚动，无需滚动直接设置已阅读完毕
      if (RiskConfirmLetterContentRef.value) {
        const { scrollHeight, clientHeight } = RiskConfirmLetterContentRef.value;
        if (scrollHeight <= clientHeight) {
          isScrollToBottom.value = true;
        }
      }
    });
  });

  return {
    dialogVisible,
    viewerRiskConfirmInfo,
    curPreviewAgreement,

    riskConfirmLetterRenderMode,
    contentWrapperStyle,

    RiskConfirmLetterContentRef,
    onRiskConfirmLetterContentRefScroll,

    agreeBtnEnabled,
    agreeBtnText,

    resetRiskConfirmLetterRenderMode,
    handlePreviewAgreement,
    handleAgreeRiskConfirm,
    handleDisagreeRiskConfirm,
  };
};
