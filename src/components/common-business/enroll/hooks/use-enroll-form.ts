/* eslint-disable sonarjs/cognitive-complexity */
import { translate } from '@/assets/lang';
import { DEFAULT_PHONE_NUMBER_AREA_CODE } from '@/assets/constants/defaults';
import { validatePhoneNumber } from '@/assets/utils/validate';
import { useDialogTipsUtils } from '@/components/common-base/dialog/use-dialog-tips';
import { useToastManager } from '@/hooks/components/use-toast';
import { ValidatorRules } from '@/plugins/async-validator';
import { getAreaSelectNames, isSelectFinish } from '@/plugins/polyv-ui/area-utils';
import { EnrollBasicFormData, useEnrollStore } from '@/store/use-enroll-store';
import { useIdentityStore } from '@/store/use-identity-store';
import {
  EnrollAuthType,
  EnrollFieldItem,
  EnrollFieldType,
  EnrollFormContent,
  SubmitEnrollError,
} from '@polyv/live-watch-sdk';
import { computed, reactive } from 'vue';
import { useCommonStore } from '@/store/use-common-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { PropUtils, emitFunc, VueEmit } from '@polyv/vue-components';
import { useEnrollSms } from './use-enroll-sms';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';

type EnrollValFormData = Record<string, string | string[] | boolean>;

/** 报名观看表单移动端 props */
export const enrollFormMobileProps = () => ({
  /** 是否已滚动接近底部 */
  isNearBottom: PropUtils.bool.def(false),
});

export const enrollFormEmits = () => ({
  /** 关闭弹层 */
  'close-dialog': emitFunc<void>(),
  /** 点击取消 */
  'click-cancel': emitFunc<void>(),
});

/**
 * 报名观看表单填写 hook
 */
export const useEnrollForm = (options: { emit: VueEmit<typeof enrollFormEmits> }) => {
  const { getWatchCore } = useGlobalInject();

  const { advanceSetLiveBookingCache } = useLiveBookingCache();

  const { toast } = useToastManager();

  const { emit } = options;

  const { imageVerifyInputRef, imageVerifyInputEnabled, smsValidType } = useEnrollSms();

  const watchAppStore = useWatchAppStore();
  const enrollStore = useEnrollStore();
  const commonStore = useCommonStore();
  const identityStore = useIdentityStore();

  function getDefaultFormNumber() {
    return (
      enrollStore.cacheLoginFormData.phoneNumber ||
      identityStore.identityUnionInfo?.phoneNumber ||
      ''
    );
  }

  /**
   * 获取字段的表单初始值
   */
  function getInitFormData() {
    const data: EnrollValFormData = {};

    enrollStore.enrollFields.forEach(item => {
      if (
        [EnrollFieldType.Checkbox, EnrollFieldType.Upload, EnrollFieldType.Area].includes(item.type)
      ) {
        data[item.fieldId] = [];
      } else if (item.type === EnrollFieldType.Privacy) {
        data[item.fieldId] = false;
      } else {
        data[item.fieldId] = '';
      }

      if (
        item.type === EnrollFieldType.Mobile &&
        enrollStore.enrollAuthType === EnrollAuthType.Mobile
      ) {
        data[item.fieldId] = getDefaultFormNumber();
      }

      if (
        item.type === EnrollFieldType.Mobile &&
        enrollStore.enrollAuthType === EnrollAuthType.Email &&
        enrollStore.cacheLoginFormData.email
      ) {
        data[item.fieldId] = enrollStore.cacheLoginFormData.email;
      }
    });

    return data;
  }

  /** 填写表单对象 */
  const formData = reactive<EnrollBasicFormData & EnrollValFormData>({
    ...getInitFormData(),
    // 手机区号
    areaCode: DEFAULT_PHONE_NUMBER_AREA_CODE,
    // 图片验证码 id
    imageId: '',
    // 图片验证码
    imageCaptcha: '',
    // 短信验证码
    smsCode: '',
    // 验证的邮箱地址
    email: '',
    ...enrollStore.cacheLoginFormData,
    // 手机号
    phoneNumber: getDefaultFormNumber(),
  });

  /** 处理手机号码输入框改变 */
  function onPhoneNumberChange(phoneNumber: string) {
    formData.phoneNumber = phoneNumber;
  }

  /** 处理邮箱输入框改变 */
  function onEmailChange(email: string) {
    formData.email = email;
  }

  /** 表单验证规则 */
  const formRules = computed<ValidatorRules>(() => {
    const rules: ValidatorRules = {};

    enrollStore.enrollFields.forEach(fieldItem => {
      const fieldId = fieldItem.fieldId;
      const isRequired = fieldItem.isRequired;

      switch (fieldItem.type) {
        case EnrollFieldType.Name:
        case EnrollFieldType.Text:
        case EnrollFieldType.Radio:
          rules[fieldId] = [
            { type: 'string', message: translate('auth.error.improveInfo'), required: isRequired },
          ];
          break;
        case EnrollFieldType.Email:
          rules[fieldId] = [
            { type: 'string', message: translate('auth.error.improveInfo'), required: isRequired },
            { type: 'email', message: translate('form.error.emailError') },
          ];
          break;
        case EnrollFieldType.Checkbox:
        case EnrollFieldType.Upload:
          rules[fieldId] = [
            { type: 'array', message: translate('auth.error.improveInfo'), required: isRequired },
          ];
          break;
        case EnrollFieldType.Area:
          rules[fieldId] = [
            { type: 'array', message: translate('auth.error.improveInfo'), required: isRequired },
            {
              validator: (rule, val: string[]) => {
                if (val.length && !isSelectFinish(val, commonStore.areaData)) {
                  return [translate('form.error.areaError')];
                }
                return [];
              },
            },
          ];
          break;
        case EnrollFieldType.Privacy:
          rules[fieldId] = {
            validator: (rule, val: boolean) => {
              if (!val) {
                return [translate('auth.error.checkProtocol')];
              }
              return [];
            },
          };
          break;
        case EnrollFieldType.Mobile:
          // 使用手机号验证
          if (
            fieldItem.authType === EnrollAuthType.Mobile &&
            (enrollStore.smsVerifyEnabled || enrollStore.areaCodeEnabled)
          ) {
            rules[fieldId] = [
              {
                type: 'string',
                message: translate('form.error.phoneNumberRequired'),
                required: true,
              },
              {
                validator: () => {
                  const phoneNumber = formData.phoneNumber;
                  const areaCode = formData.areaCode;

                  if (validatePhoneNumber(phoneNumber, areaCode)) {
                    return [];
                  }

                  return [translate('form.error.phoneNumberError')];
                },
              },
            ];

            if (enrollStore.smsVerifyEnabled) {
              rules.smsCode = [
                {
                  type: 'string',
                  message: translate('form.error.smsVerifyRequired'),
                  required: true,
                },
              ];
            }
          }
          // 使用邮箱验证
          if (fieldItem.authType === EnrollAuthType.Email) {
            rules[fieldId] = [
              {
                type: 'string',
                message: translate('form.error.emailRequired'),
                required: isRequired,
              },
              { type: 'email', message: translate('form.error.emailError') },
            ];
          }
          break;
      }
    });

    return rules;
  });

  /** 格式化特殊的字段名称 */
  function formatSpecialName(fieldItem: EnrollFieldItem): string {
    let name = fieldItem.name;
    if (fieldItem.type === EnrollFieldType.Radio) {
      name = `[${translate('form.radio')}] ${name}`;
    }
    if (fieldItem.type === EnrollFieldType.Checkbox) {
      name = `[${translate('form.checkbox')}] ${name}`;
    }
    return name;
  }

  /**
   * 处理表单提交
   */
  async function submitForm() {
    const watchCore = getWatchCore();
    const content: EnrollFormContent = {};
    const formDataVal = formData as EnrollValFormData;

    const phoneNumber = formData.phoneNumber;
    const areaCode = formData.areaCode;
    const smsCode = formData.smsCode;
    const email = formData.email;

    enrollStore.enrollFields.forEach(fieldItem => {
      const fieldId = fieldItem.fieldId;

      switch (fieldItem.type) {
        case EnrollFieldType.Name:
        case EnrollFieldType.Text:
        case EnrollFieldType.Radio:
        case EnrollFieldType.Mobile:
        case EnrollFieldType.Email:
          content[fieldId] = formDataVal[fieldId] as string;
          break;
        case EnrollFieldType.Checkbox:
        case EnrollFieldType.Upload:
          content[fieldId] = formDataVal[fieldId] as string[];
          break;
        case EnrollFieldType.Area: {
          const areaValue = formDataVal[fieldId] as string[];
          const areaPickData = getAreaSelectNames(areaValue, commonStore.areaData).join('/');
          content[fieldId] = areaPickData;
          break;
        }
        case EnrollFieldType.Privacy:
          content[fieldId] = '√';
          break;
      }
    });

    const result = await watchCore.enroll.submitEnrollForm({
      phoneNumber,
      areaCode,
      smsCode,
      email,
      content,
    });

    if (!result.success) {
      switch (result.failReason) {
        case SubmitEnrollError.SmsCodeVerifyError:
          toast.error(translate('enroll.error.smsCodeError'));
          break;
        case SubmitEnrollError.LackRequired:
        default:
          toast.error(result.failMessage || translate('base.error.unknown'));
          break;
      }
      return;
    }

    // 报名操作完成，提前设置直播预约缓存
    advanceSetLiveBookingCache({
      phoneNumber: formData.phoneNumber,
      areaCode: formData.areaCode,
      smsVerified: enrollStore.smsVerifyEnabled,
    });

    // 优先判断是否需要审核和审核是否通过
    if (result.auditEnabled && !result.hasAudited) {
      toast.success(translate('enroll.auditing'));
      emit('close-dialog');
      return;
    }

    // 提交成功提示
    toast.success(translate('base.submitSuccess'));

    // 入口报名且报名成功的情况下需要重新安装 watchCore
    if (enrollStore.needEnrollByEnter && result.hasEnrolled) {
      // 只有入口报名且报名成功时，才需要免密预约并自动打开弹窗
      advanceSetLiveBookingCache({
        needAutoOpenBooking: true,
      });

      await watchAppStore.resetUpWatchCore();
    }

    emit('close-dialog');
  }

  function onClickCancel() {
    emit('click-cancel');
  }

  return {
    EnrollFieldType,
    EnrollAuthType,
    imageVerifyInputRef,
    smsValidType,
    imageVerifyInputEnabled,
    formData,
    formRules,
    onPhoneNumberChange,
    onEmailChange,
    formatSpecialName,
    submitForm,
    onClickCancel,
  };
};

export const useEnrollCheckMobile = (options: {
  /** 获取手机区号 */
  getAreaCode: () => string;
}) => {
  const { getWatchCore } = useGlobalInject();
  const { showDialogTips } = useDialogTipsUtils();

  /** 失焦检查报名状态 */
  async function blurToCheckStatus(mobileOrEmail: string) {
    if (!mobileOrEmail) {
      return;
    }

    const watchCore = getWatchCore();
    const result = await watchCore.enroll.getEnrollStatus({
      phoneNumber: mobileOrEmail,
      email: mobileOrEmail,
      areaCode: options.getAreaCode(),
    });

    if (result.hasEnrolled) {
      showDialogTips(translate('enroll.enrolledTips'));
    }
  }

  return {
    blurToCheckStatus,
  };
};
