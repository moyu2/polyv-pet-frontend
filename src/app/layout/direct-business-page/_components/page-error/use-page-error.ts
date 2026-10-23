import { computed, unref } from 'vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import {
  PageErrorType,
  PageErrorData,
  DirectBusinessPageType,
} from '@/app/layout/direct-business-page/type';

const generateDefaultPageErrorData = (): PageErrorData => {
  return {
    type: PageErrorType.UnknownError,
  };
};

/**
 * @hook 全局错误页-页面错误数据
 */
export const usePageErrorHook = () => {
  const { directBusinessPageData } = storeDefinitionToRefs(useWatchAppStore);

  /** 页面错误数据，必定存在 */
  const pageError = computed(() => {
    if (
      !directBusinessPageData.value ||
      directBusinessPageData.value.pageType !== DirectBusinessPageType.ErrorPage
    )
      return generateDefaultPageErrorData();

    return directBusinessPageData.value.data;
  });

  const isWorkWechatError = computed(() => {
    return unref(pageError).type === PageErrorType.WorkWechatBusinessError;
  });

  const isDisallowMobileWatch = computed(() => {
    return unref(pageError).type === PageErrorType.MobileChannelClosed;
  });

  const isAuthError = computed(() => {
    const authErrorTypes = [
      PageErrorType.ExternalAuthFail,
      PageErrorType.DirectAuthFail,
      PageErrorType.ExternalAuthFail,
      PageErrorType.AuthExpired,
    ];
    return authErrorTypes.includes(unref(pageError).type);
  });

  const isNotExistError = computed(() => {
    return (
      unref(pageError).type === PageErrorType.ChannelIdError ||
      unref(pageError).type === PageErrorType.ChannelClosed ||
      unref(pageError).type === PageErrorType.ChannelForbidden ||
      unref(pageError).type === PageErrorType.TargetSessionNotExist
    );
  });

  const isNotFoundError = computed(() => {
    return (
      !isAuthError.value &&
      !isNotExistError.value &&
      !isWorkWechatError.value &&
      !isDisallowMobileWatch.value
    );
  });

  function reloadPage() {
    window.location.reload();
  }

  return {
    pageError,

    isWorkWechatError,
    isDisallowMobileWatch,
    isAuthError,
    isNotExistError,
    isNotFoundError,

    reloadPage,
  };
};
