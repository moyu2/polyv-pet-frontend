/**
 * @file 短信验证码输入框 hook
 */

import { onBeforeUnmount, computed, ref, unref, onMounted } from 'vue';
import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { translate } from '@/assets/lang';
import { validateImageCaptcha, validatePhoneNumber } from '@/assets/utils/validate';
import { useToastManager } from '@/hooks/components/use-toast';
import { useSecondCountDown } from '@/hooks/tools/use-count-down';
import {
  SmsScene,
  SmsValidType,
  SendSmsVerifyCodeFail,
  SendSmsVerifyResult,
  CommonResult,
} from '@polyv/live-watch-sdk';
import { InputValueType } from '../form-input/hooks/use-form-input';
import { ImageVerifyInputInstance } from '../form-image-verify-input/type';
import { isArray } from '@/assets/utils/array';
import { useGlobalInject } from '@/app/use-global-inject';
import { loadCaptcha, createCaptcha } from './captcha';
import type { Captcha, Language as CaptchaLanguage } from '@polyv/captcha-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { LangType } from '@/assets/lang/lang-enum';
import { useLangStore } from '@/store/use-lang-store';

/** 验证类型，imageCode - 图片验证码，sliderCode - 滑块验证码 */
export type VerifyType = 'imageCaptcha' | 'sliderCode';

/**
 * <form-sms-verify-input> props 配置
 */
export const formSmsVerifyInputProps = () => ({
  /** 绑定值 */
  value: PropUtils.string.def(''),
  /** 区号 */
  areaCode: PropUtils.string.def('+86'),
  /** 手机号 */
  phoneNumber: PropUtils.string.def(''),
  /** 短信场景 */
  smsScene: PropUtils.enum<SmsScene>().isRequired,
  /** 验证类型 */
  validType: PropUtils.enum<SmsValidType>().def(SmsValidType.Image),
  /** 图片验证码 id */
  imageId: PropUtils.string.def(''),
  /** 图片验证码 */
  imageCaptcha: PropUtils.string.def(''),
  /** 图片验证码节点 */
  imageVerifyInputRef: PropUtils.oneOfType<ImageVerifyInputInstance | ImageVerifyInputInstance[]>([
    Array,
    Object,
  ]),
});

/**
 * <form-sms-verify-input> emit 配置
 */
export const formSmsVerifyInputEmits = () => ({
  input: emitFunc<string>(),
});

export const useSmsVerifyInput = (options: {
  props: VueProps<typeof formSmsVerifyInputProps>;
  emit: VueEmit<typeof formSmsVerifyInputEmits>;
}) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { props, emit } = options;
  const { areaCode, phoneNumber, smsScene, imageCaptcha, imageId, validType } = useProps(props);
  const { surplusTime, initCountDown } = useSecondCountDown({
    second: 60,
  });

  /** 输入框占位文本 */
  const inputPlaceholder = computed(() => {
    return translate('form.placeholder.smsVerify');
  });

  /** 发送按钮是否禁用 */
  const sendDisabled = computed(() => {
    let isDisabled = false;
    const areaCodeVal = unref(areaCode);
    const phoneNumberVal = unref(phoneNumber);

    // 手机号不规范
    if (!validatePhoneNumber(phoneNumberVal, areaCodeVal)) {
      isDisabled = true;
    }

    // 存在倒计时
    if (unref(surplusTime).seconds !== 0) {
      isDisabled = true;
    }

    // 如果是图片验证码则验证长度
    if (
      unref(validType) === SmsValidType.Image &&
      !validateImageCaptcha(unref(imageCaptcha), unref(imageId))
    ) {
      isDisabled = true;
    }

    return isDisabled;
  });

  /** 发送按钮文本 */
  const sendText = computed(() => {
    const seconds = unref(surplusTime).seconds;
    if (seconds !== 0) {
      return `${translate('form.resend')}${seconds}${translate('unit.second')}`;
    }

    return translate('form.getSmsVerify');
  });

  /** 处理输入框输入 */
  function onInputChange(val: InputValueType): void {
    emit('input', `${val}`);
  }

  const captchaInstance = ref<Captcha | undefined>();

  onMounted(() => {
    if (unref(validType) === SmsValidType.Slider) {
      loadCaptcha();
    }
  });

  onBeforeUnmount(() => {
    if (captchaInstance.value) {
      captchaInstance.value.destroy();
      captchaInstance.value = undefined;
    }
  });

  const { currentLang } = storeDefinitionToRefs(useLangStore);

  /** 处理点击发送 */
  async function onClickSend() {
    if (unref(sendDisabled)) {
      return;
    }

    if (unref(validType) === SmsValidType.Slider) {
      if (!captchaInstance.value) {
        captchaInstance.value = await createCaptcha({
          language: ({
            [LangType.ZH_CN]: 'zh-cn',
            [LangType.ZH_TW]: 'zh-tw',
            [LangType.English]: 'en',
            [LangType.Japanese]: 'ko',
            [LangType.Korean]: 'ja',
            [LangType.Russian]: 'ru',
          }[currentLang.value] || 'en') as CaptchaLanguage,
          onSuccess(data) {
            toSendSliderSmsCode(data);
          },
        });
      }
      captchaInstance.value.show();
    } else if (unref(validType) === SmsValidType.None) {
      toSendNoneSmsCode();
    } else {
      toSendImageSmsCode();
    }
  }

  /**
   * 发送短信验证码（滑块验证）
   */
  async function toSendSliderSmsCode(slideData: object) {
    const watchCore = getWatchCore();
    const validTypeVal = unref(validType);

    let result: SendSmsVerifyResult | undefined;

    if (validTypeVal === SmsValidType.Slider) {
      result = await watchCore.sms.sendSmsVerifyCode(
        Object.assign(
          {
            phoneNumber: unref(phoneNumber),
            areaCode: unref(areaCode),
            validType: validTypeVal,
            scene: unref(smsScene),
          },
          slideData,
        ),
      );
    }

    if (!result) {
      return;
    }

    if (result.success) {
      onSendSuccess();
    } else {
      onSendFail(result);
    }
  }

  /**
   * 发送短信验证码（图片验证）
   */
  async function toSendImageSmsCode() {
    const watchCore = getWatchCore();
    const validTypeVal = unref(validType);

    let result: SendSmsVerifyResult | undefined;

    if (validTypeVal === SmsValidType.Image) {
      result = await watchCore.sms.sendSmsVerifyCode({
        phoneNumber: unref(phoneNumber),
        areaCode: unref(areaCode),
        validType: validTypeVal,
        scene: unref(smsScene),
        imageId: unref(imageId),
        imageCaptcha: unref(imageCaptcha),
      });
    }

    if (!result) {
      return;
    }

    if (result.success) {
      onSendSuccess();
    } else {
      onSendFail(result);
    }
  }

  /**
   * 发送短信验证码（无验证）
   */
  async function toSendNoneSmsCode() {
    const watchCore = getWatchCore();
    const validTypeVal = unref(validType);

    let result: SendSmsVerifyResult | undefined;

    if (validTypeVal === SmsValidType.None) {
      result = await watchCore.sms.sendSmsVerifyCode({
        phoneNumber: unref(phoneNumber),
        areaCode: unref(areaCode),
        validType: validTypeVal,
        scene: unref(smsScene),
      });
    }

    if (!result) {
      return;
    }

    if (result.success) {
      onSendSuccess();
    } else {
      onSendFail(result);
    }
  }

  function onSendFail(result: CommonResult<SendSmsVerifyCodeFail>) {
    if (result.success) {
      return;
    }

    const failReason = result.failReason;
    switch (failReason) {
      case SendSmsVerifyCodeFail.ImageCaptchaError:
        toast.error(translate('form.error.imageCaptchaError'));
        refreshImageVerify();
        break;
      case SendSmsVerifyCodeFail.SendFrequent:
        toast.error(translate('base.sendSmsFail'));
        break;
      case SendSmsVerifyCodeFail.UnSetSmsPlatform:
        toast.error(translate('base.unSetSmsPlatformFail'));
        break;
      default:
        toast.error(result.failMessage || translate('base.error.unknown'));
        break;
    }
  }

  /** 刷新图片验证码的输入框 */
  function refreshImageVerify() {
    if (isArray(props.imageVerifyInputRef)) {
      props.imageVerifyInputRef.forEach(instance => {
        instance.refreshVerifyImage(true);
      });
    } else {
      props.imageVerifyInputRef?.refreshVerifyImage(true);
    }
  }

  /**
   * 处理发送成功
   */
  function onSendSuccess() {
    toast.success(translate('base.sendSuccess'));

    // 开始倒计时
    initCountDown();
  }

  return {
    inputPlaceholder,
    sendDisabled,
    sendText,
    SmsValidType,
    onInputChange,
    onClickSend,
    toSendSliderSmsCode,
    toSendImageSmsCode,
  };
};
