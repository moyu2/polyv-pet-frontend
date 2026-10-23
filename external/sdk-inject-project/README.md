# 处理 sdk 注入项目脚本

## 说明

为了能够让跨框架的项目能够直接加载观看页应用，因此使用该独立工程去做打包构建出相关的产物，以提供 sdk 注入使用

为了方便说明，以下 "子项目" 即指代当前 `sdk-inject-project` 项目，"父项目" 即指代外层的观看页项目

## 接入方式

`polyv-watch-app-sdk-loader.js`

```js
import { loadScript } from '@just4/load-script';

let loadPromise = null;

/**
 * 加载 sdk
 */
export const loadPolyvWatchAppSdk = () => {
  if (window.PolyvWatchAppSdk) {
    return Promise.resolve(window.PolyvWatchAppSdk);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      (async () => {
        // 此处以调试模式的链接为例
        await loadScript('http://localhost:15020/sdk-inject-project/dist/polyv-watch-app/inject-sdk.js');

        if (window.PolyvWatchAppSdk) {
          resolve(window.PolyvWatchAppSdk);
        } else {
          reject(new Error('loadPolyvWatchAppSdk fail, window.PolyvWatchAppSdk is undefined'));
        }
      })();
    });
  }

  return loadPromise;
};
```

`example.js`

```js
import { loadPolyvWatchAppSdk } from '@/plugins/polyv-watch-app-sdk-loader.js';

// 加载 SDK
const PolyvWatchAppSdk = await loadPolyvWatchAppSdk();

/** 全局的观看页应用实例 */
let globalPolyvWatchApp = null;

function setGlobalPolyvWatchApp(plvWatchApp) {
  globalPolyvWatchApp = plvWatchApp;
}

// 外部项目提供方法注入：获取当前激活的观看页应用实例
PolyvWatchAppSdk.getActivePolyvWatchApp = () => {
  return globalPolyvWatchApp; // 此处示例仅返回全局实例
};

// 外部项目提供方法注入：获取指定 id 的观看页应用实例
PolyvWatchAppSdk.getPolyvWatchApp = id => {
  return globalPolyvWatchApp; // 此处示例仅返回全局实例
};

// 绑定事件--初始化
PolyvWatchAppSdk.eventEmitter.on('init', () => {
  // 创建观看页应用实例
  const plvWatchApp = PolyvWatchAppSdk.createPolyvWatchApp({
    id: 'plv-watch-app-container',
  });

  // 同步存储实例
  setGlobalPolyvWatchApp(plvWatchApp);

  // 设置必要的请求参数
  plvWatchApp.setQueryParams({
    channelId: 'xxx',
  });

  // 应用挂载
  plvWatchApp.getVueInstance().$mount('#plv-watch-app-container');
});

// 加载应用资源
PolyvWatchAppSdk.loadPolyvWatchAppSource();

```

## 调试方式

主项目执行以下命令，生成 `lib/inject-assets`

```sh
npm run dev-sdk-inject
```

子项目执行以下命令，生成必要的 `sdk-inject` 文件

```sh
npm run dev
```

以上命令执行完成后，接入方就可以使用 `http://localhost:15020/sdk-inject-project/dist/polyv-watch-app/inject-sdk.js` 来引入 SDK

这种方式可以实时去调试，作为主推方案

## 构建方式

### 构建前提

在一般情况下，需要确认好 `publicPath` 进行更改项后才能正常部署

- 如果只想用静态的 `publicPath`, 则需要更改**主项目** `build/build-config.js` 中对应的配置即可
- 如果想动态处理 `publicPath`，则需要更改**主项目** `build/build-config.js` 中的 `enableRuntimePublicPath` 标志位设置为 `true`。同时，接入方在调用 `window.PolyvWatchAppSdk.loadPolyvWatchAppSource` 方法时需要传入对应的 `publicPath` 参数，这样才能正常使用

### 构建步骤

主项目需要执行以下命令，生成 `dist-sdk-inject` 目录

```sh
npm run build-sdk-inject
```

子项目，则需要执行以下命令，生成 `dist/polyv-watch-app`

```sh
npm run build
```

`dist/polyv-watch-app` 即最后的打包产物，该产物最后需要根据约定好的 `publicPath` 上传至对应的位置

### 构建注意项

- 主项目构建时，默认会提取 `vue.js`，因此需要在加载 `sdk-inject` 时先加载运行时的 `vue.js`【建议】
- 如果不想外链加载 `vue.js`, 可以更改主项目的 `build/tag-config` 中的 `externalConfigs`，这样就能不提取 `vue.js`, 而是将 `vue.js` 直接打包到主项目工程里
