import { useWeixinPay } from '@/hooks/platform/use-weixin/use-weixin-pay';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { useRedpackStore } from '@/store/use-redpack-store';
import { computed, reactive, unref } from 'vue';
import { SubmitSendRedpackParams, WatchDomainPayType } from '@polyv/live-watch-sdk';
import { usePolyvWatchDomain } from '@/hooks/platform/use-polyv-watch-domain';
import { useGlobalInject } from '@/app/use-global-inject';

/** "发送红包"表单类型 */
interface SendRedpackFormData {
  /** 红包金额 */
  amount: number | string;
  /** 红包个数 */
  count: number | string;
  /** 祝福语 */
  greeting: string;
}

export const useSendRedpackHook = (
  options: {
    successCallback?: () => unknown;
  } = {},
) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { polyvWatchDomainEnabled, skipWatchDomainPay } = usePolyvWatchDomain();
  const { chooseWXPay } = useWeixinPay();
  const watchCore = getWatchCore();
  const redpackStore = useRedpackStore();
  const { sendRedpackMaxAmount, sendRedpackMaxCount, sendRedpackMinAverage } =
    redpackStore.sendRedpackConfig;

  /** "发送红包"表单数据 */
  const formData = reactive<SendRedpackFormData>({
    amount: '',
    count: '',
    greeting: '',
  });

  /** 表单规则 */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const formRules = computed<ValidatorRules>(() => {
    return {
      amount: [
        {
          validator: (rule, val: number | string) => {
            let errorMsg: string | undefined;
            // 必填判断
            if (val === '') {
              errorMsg = translate('redpack.send.sum.placeholder');
            }

            // 总金额不得小于 1
            if (Number(val) < 1) {
              errorMsg = translate('redpack.send.amount.low');
            }

            // 最大值判断
            if (Number(val) > unref(sendRedpackMaxAmount)) {
              errorMsg = translate('redpack.single.amount.limit', {
                amount: `${unref(sendRedpackMaxAmount)}`,
              });
            }

            // 均分判断
            const average = getCurrentAverage();
            if (formData.amount && formData.count && average < unref(sendRedpackMinAverage)) {
              errorMsg = translate('redpack.equal.amount.limit', {
                average: `${unref(sendRedpackMinAverage)}`,
              });
            }

            const reg = /^\d+(\.\d{0,2})?$/;
            const matchResult = `${val}`.match(reg);
            if (matchResult === null) {
              errorMsg = translate('redpack.send.amount.dotLimit');
            }

            if (errorMsg) {
              return [errorMsg];
            }

            return true;
          },
        },
      ],
      count: [
        {
          validator: (rule, val: number | string) => {
            let errorMsg: string | undefined;
            // 必填判断
            if (val === '') {
              errorMsg = translate('redpack.send.num.placeholder');
            }

            // 最大值判断
            if (Number(val) > unref(sendRedpackMaxCount)) {
              errorMsg = translate('redpack.single.num.limit', {
                count: `${unref(sendRedpackMaxCount)}`,
              });
            }

            // 均分判断
            const average = getCurrentAverage();
            if (formData.amount && formData.count && average < unref(sendRedpackMinAverage)) {
              errorMsg = translate('redpack.equal.amount.limit', {
                average: `${unref(sendRedpackMinAverage)}`,
              });
            }

            if (errorMsg) {
              return [errorMsg];
            }

            return true;
          },
        },
      ],
    };
  });

  /** 获取当前的红包均分金额 */
  function getCurrentAverage() {
    return Number(formData.amount) / Number(formData.count);
  }

  /** 提交表单 */
  async function submitForm() {
    const params: SubmitSendRedpackParams = {
      amount: Number(formData.amount),
      count: Number(formData.count),
      greeting: formData.greeting,
    };

    // 泛域名支付
    if (unref(polyvWatchDomainEnabled)) {
      skipWatchDomainPay({
        payType: WatchDomainPayType.Redpack,
        params,
      });
      return;
    }

    const result = await watchCore.redpack.submitSendRedpack(params);

    if (result.success) {
      chooseWXPay(result.wxPaySignData, {
        successCb: () => {
          toast.success(translate('weixin.pay.success'));
        },
      });

      options.successCallback && options.successCallback();
    } else {
      const failMessage = result.failMessage;
      if (failMessage) {
        toast.error(failMessage);
      }
    }
  }

  /** 初始化发送红包数据 */
  function initSendRedpackData() {
    formData.amount = '';
    formData.count = '';
    formData.greeting = '';
  }

  return {
    formData,
    formRules,

    submitForm,
    initSendRedpackData,
  };
};
