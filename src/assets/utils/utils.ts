/**
 * 等待一段时间
 * @param time 等待时间
 */
export function wait(time = 3000) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

/**
 * 获取事件对象中的坐标
 * @param event 事件对象
 */
export function getEventPosition(event: MouseEvent | TouchEvent): {
  clientX: number;
  clientY: number;
} {
  if (event instanceof MouseEvent) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }

  const touch = event.touches[0] || event.changedTouches[0] || event.targetTouches[0];
  const touchX = touch.pageX;
  const touchY = touch.pageY;

  return {
    clientX: touchX,
    clientY: touchY,
  };
}

/**
 * 是否为本地调试模式
 */
export function isDevBuildMode() {
  return process.env.NODE_ENV !== 'production';
}

/**
 * 是否被外部应用注入使用
 */
export function isInjectByExternalApp(): boolean {
  return !!(IN_SDK_INJECT_MODE && window.PolyvWatchAppSdk);
}

/**
 * 需要内部打包 Vue
 */
export function needInternalBuildVue(): boolean {
  return NEED_INTERNAL_BUILD_VUE;
}

/**
 * 是否使用 feed 注入模式
 */
export function isBuildForFeedMainMode(): boolean {
  return process.env.VUE_APP_MAIN_MODE === 'Feed';
  // return isInjectByExternalApp() && process.env.VUE_APP_MAIN_MODE === 'Feed';
}

/**
 * 是否为静态打包构建模式
 */
export function isStaticBuildMode(): boolean {
  return !!IS_STATIC_BUILD_MODE;
}
