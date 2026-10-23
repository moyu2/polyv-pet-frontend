/**
 * @file 错误日志记录处理
 *
 * @PLV-WARN
 * 从 v1.0.0 开始，保利威不再通过该文件去处理错误日志
 */

import { VueConstructor } from 'vue';

type VueIns = InstanceType<VueConstructor>;

interface ErrorCatchModel {
  /** 错误名称 */
  name: string;
  /** 错误类型 */
  type: string;
  /** 错误消息 */
  msg: string | Event;
  /** 对应的目标 */
  target: string;
  /** 额外信息 */
  ext: string;
}

/** 处理 Error 对堆栈信息返回为 msg */
const processStackMsg = (error: Error) => {
  let stack = error.stack || '';
  stack = stack
    .replace(/\n/gi, '')
    .split(/\bat\b/)
    .slice(0, 9)
    .join('@')
    .replace(/\?[^:]+/gi, '');
  const msg = error.toString();
  stack = stack.indexOf(msg) < 0 ? `${msg}@${stack}` : stack;
  return stack;
};

/**
 * @hook 错误捕获钩子
 * @param cb 回调函数
 */
export const useErrorCatch = (cb: (data: ErrorCatchModel) => void) => {
  /**
   *  捕获"暴露到全局错误"的钩子函数
   */
  function windowErrorHandler() {
    window.onerror = (
      message: string | Event,
      target?: string,
      row?: number,
      col?: number,
      error?: Error,
    ) => {
      const msg = error && error.stack ? processStackMsg(error) : message;

      const data: ErrorCatchModel = {
        name: (error && error.name) || 'unCatchWindowErrorName',
        type: 'windowError',
        msg,
        target: target || 'global',
        ext: JSON.stringify({
          row,
          col,
        }),
      };
      cb(data);
    };
  }

  /**
   * 捕获"promise 暴露到全局错误"的钩子函数
   */
  function promiseErrorHandler() {
    window.addEventListener('unhandledrejection', event => {
      if (event.reason instanceof Error) {
        event.preventDefault();
        throw event.reason;
      }
      const data: ErrorCatchModel = {
        name: event.type,
        type: 'promiseError',
        msg: event.reason,
        target: 'global',
        ext: '',
      };
      cb(data);
    });
  }

  /**
   * 提供接管 Vue 错误的钩子函数
   */
  function vueErrorHandler(error: Error, vm: VueIns, info: string) {
    const msg = error && error.stack ? processStackMsg(error) : error.toString();

    const target = vm.$options.name || vm.$options.__name || 'notFound';

    const data: ErrorCatchModel = {
      name: error ? error.name : 'unCatchVueErrorName',
      type: 'vueCatchError',
      msg,
      target: `Component/Tag：${target}`,
      ext: JSON.stringify({
        info: `Error In ${info}`,
      }),
    };
    cb(data);

    throw error; // 抛还给 Vue，这里抛出的错误不会造成重复记错
  }

  /**
   * 提供在 try catch 进行错误捕获的钩子函数,，可以挂在 Vue.prototype 上
   * vm 支持用 vue 实例，也可以传一个字符串之类的
   */
  function tryCatchHandler(error: Error, vm: VueIns | string, info: string) {
    const msg = error && error.stack ? processStackMsg(error) : error.toString();

    const target =
      typeof vm === 'string'
        ? vm
        : vm && vm.$options
        ? `Component/Tag：${vm.$options.name || vm.$options.__name || 'notFound'}`
        : String(vm);

    const data: ErrorCatchModel = {
      name: error && error.name,
      type: 'tryCatchError',
      msg,
      target,
      ext: JSON.stringify({
        info: `Error In ${info}`,
      }),
    };
    cb(data);
  }

  return {
    windowErrorHandler,
    promiseErrorHandler,
    vueErrorHandler,
    tryCatchHandler,
  };
};
