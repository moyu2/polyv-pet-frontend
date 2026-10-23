/**
 * 注入 PolyvWatchAppSdk 方法
 */
export function injectPolyvWatchAppSdkMethods(param: {
  createPolyvWatchApp: PolyvWatchAppSdkType['createPolyvWatchApp'];
}) {
  if (!window.PolyvWatchAppSdk) return;

  // 注意不要用 Object.assign 来处理
  window.PolyvWatchAppSdk.createPolyvWatchApp = param.createPolyvWatchApp;
}

export * from './helper';
export * from './class';
