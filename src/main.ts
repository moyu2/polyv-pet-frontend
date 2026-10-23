// 入口配置需要在最前面导入
import './entry-config';

import { mainFactory } from './entry-helper';
import Vue from 'vue';
import WatchApp from './app/watch-app.vue';

console.info(
  '%c WatchApp build info: %s, %s, %s, %s',
  'color: white;background-color: #0070ed;padding: 5px 5px',
  PROJECT_VERSION,
  PROJECT_BUILD_TIME,
  `sdkLoaderEnv: ${WATCH_SDK_ENV}`,
  `sdkInjectMode: ${IN_SDK_INJECT_MODE}`,
);

mainFactory(WatchApp as unknown as Vue);
