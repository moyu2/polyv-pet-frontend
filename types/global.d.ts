import type { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import type { ComputedRef, Ref } from 'vue';

declare global {
  interface Window extends Record<string, unknown> {
    plvLogger?: {
      error: (err: Error) => void;
      updateCommonParams: (params: { cid?: string; uid?: string }) => void;
    };

    baseChannelConfig?: {
      watchDosageReportEnabled?: 'Y' | 'N';
    };
  }

  interface HTMLElement {
    __vueVm?: Vue;
  }

  /** 代表任意的函数类型 */
  type AnyFunc = (...arg: unknown[]) => unknown;

  /** 响应式 Ref，包括 ComputedRef 和 Ref */
  type ResponsiveRef<T = unknown> = ComputedRef<T> | Ref<T>;

  type RefOrElement<E = unknown> = Ref<E> | HTMLElement;

  /** 没有参数的方法类型 */
  type EmptyParamsFunc = () => unknown;

  /** 通用对象定义 */
  type UniversalParams<V = unknown> = {
    [key: string]: V;
  };

  /** 项目构建时间 */
  const PROJECT_BUILD_TIME: string;

  /** 项目版本号 */
  const PROJECT_VERSION: string;

  /** 观看页 SDK 加载的环境 */
  const WATCH_SDK_ENV: SdkLoaderEnv;

  /** 处于 sdk-inject 构建模式下 */
  const IN_SDK_INJECT_MODE: boolean;

  /** 是否需要内部打包 Vue 文件 */
  const NEED_INTERNAL_BUILD_VUE: boolean;

  /** 是否启用运行时公共路径 */
  const ENABLE_RUNTIME_PUBLIC_PATH: boolean;

  /** 构建环境 */
  const BUILD_ENV: string;

  /** 是否启用用量上报 */
  const RUM_ENABLED: boolean;

  /** 是否为静态打包构建模式 */
  const IS_STATIC_BUILD_MODE: boolean;

  // eslint-disable-next-line
  var __webpack_public_path__: string | undefined;

  interface NavigatorLanguage {
    readonly browserLanguage: string;
  }

  interface FontFaceSet extends Set<FontFace> {}
}
