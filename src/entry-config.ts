if (typeof BUILD_ENV !== 'undefined' && !window.BUILD_ENV) {
  window.BUILD_ENV = BUILD_ENV;
}

if (
  IN_SDK_INJECT_MODE &&
  ENABLE_RUNTIME_PUBLIC_PATH &&
  window.PolyvWatchAppSdk &&
  window.PolyvWatchAppSdk.publicPath
) {
  // eslint-disable-next-line
  __webpack_public_path__ = window.PolyvWatchAppSdk.publicPath;
}
