# polyv-pet-frontend

`polyv-pet` 的前端项目，基于 POLYV 官方直播观看 SDK UI 层二次开发，提供“积萌研究所”的直播积分桌宠功能。
宠物功能、前后端联调与启动方式见 [宠物面板二开说明](./宠物面板二开说明.md)。以下保留上游 SDK 的介绍和使用说明。

狗狗桌宠现使用 v2 逐帧素材与独立动作编排，实现说明见 [v2 实现说明](./docs/狗狗桌宠-v2实现与验收.md)。执行 `npm run dev` 后可通过 [本地预览](http://localhost:15021/pet-preview.html) 查看三阶段和喂养效果；预览使用演示数据，仅在开发模式提供。

本地体验请先启动后端，再运行 `npm ci` 和 `npm run dev`。观看页地址为 `http://localhost:15021/index.html?channelId=YOUR_CHANNEL_ID`；请使用自己的有效频道。

观看页通过地址中的 `channelId` 适配不同账号。桌宠登录自动传当前 SDK 频道和观众，后端从该频道成功的平台积分回调识别 appId，并将应用身份保存到登录会话；无需在页面写死 appId。新频道接入时先配置外部积分接口并成功触发一次查询或奖励回调；未识别频道会显示提示，避免创建到演示账号下。

公开源码不包含任何特定服务器的发布脚本、SSH 主机记录或运维配置。通用构建方式见下文；服务器参数由使用者自行配置。

## 介绍

- 为了让客户能够更便捷、友好地定制观看页，保利威推出了**POLYV 直播观看 SDK**，并将该 SDK 拆分成 UI 层和逻辑层
- 该开源项目对应 **POLYV 直播观看 SDK** 的 UI 层，需要搭配逻辑层 [@polyv/live-watch-sdk](https://www.npmjs.com/package/@polyv/live-watch-sdk) 一起使用
- **注意:** 使用前请先阅读仓库中的 `LICENSE` 文件和 `CHANGELOG` 文件

## 项目说明

该开源项目基于 `webpack@5.x + vue@2.7 + typescript@5.x + pinia` 实现的单页面应用(SPA)，除 `@polyv/live-watch-sdk` 外，还集成了其他**保利威 npm 库**和部分第三方开源工具库

| 保利威 npm 库                                                                  | 备注                                                                                            |
| :----------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| [@polyv/utils](https://www.npmjs.com/package/@polyv/utils)                     | POLYV 工具函数库                                                                                |
| [@polyv/web-view-bridge](https://www.npmjs.com/package/@polyv/web-view-bridge) | POLYV 前端 WebView 桥接器库                                                                     |
| [@polyv/eslint-config](https://www.npmjs.com/package/@polyv/eslint-config)     | POLYV 前端工程 ESLint 通用配置                                                                  |
| @polyv/polyv-ui                                                                | POLYV 前端组件库【暂不对外提供文档】                                                            |
| [@polyv/icons-vue](https://www.npmjs.com/package/@polyv/icons-vue)             | POLYV 图标库工具 ，搭配 [@polyv/icons-cli](https://www.npmjs.com/package/@polyv/icons-cli) 使用 |

> 注意，如果需要 `@polyv/live-watch-sdk` 支持其他保利威 SDK 的类型推导，请参考 `node_modules/@polyv/live-watch-sdk/package.json` 中的 `peerDependencies`，自行安装对应的 `package` 到项目的 `devDependencies` 中

业务 SDK 相关的文档

- [帮助中心-旧版互动功能接收端 JS-SDK](https://help.polyv.net/#/live/js/new_sdk/interactions_receive_sdk/sdk/overview)
- [帮助中心-新版互动功能接收端 JS-SDK](https://help.polyv.net/#/live/js/new_sdk/interactions_receive_sdk_v2/introduce)
- [帮助中心-商品 SDK](https://help.polyv.net/#/live/js/new_sdk/product_sdk/introduce)
- [帮助中心-AI SDK](https://help.polyv.net/index.html#/live/js/new_sdk/live_watch_ai_sdk/articles/index)

业务 SDK 相关的开源 Demo

- [开源 Demo-旧版互动功能接收端开源](https://gitee.com/polyv_ef/polyv-web-interactions-receive-sdk-ui-default)
- 开源 Demo-新版互动功能接收端 JS-SDK 【待补充】
- 开源 Demo-商品 SDK 【待补充】
- [开源 Demo-AI SDK](https://gitee.com/polyv_ef/polyv-web-live-watch-ai-sdk)

> 从 v2.16.0 开始，为了优化本地开发调试，加快构建流程，以及后续的长期维护，弃用 vue-cli，改用 webpack 自主配置

## 项目运行

项目运行前请**注意**

- 确保 `node` 版本 `>= 20.10.0`
- 了解保利威基础业务概念，比如：频道号(channelId)
- 由于项目初始化会自动设置 `husky` 钩子，请确保项目根目录存在 `.git` 文件夹，或者通过这篇[文档](https://typicode.github.io/husky/#/?id=custom-directory)指定对应的 `.git` 文件夹位置。如果完全不使用 `git`，请删除 `package.json` 中的 `prepare` 脚本命令

在项目根目录使用 `npm` 来执行以下命令

```sh
npm ci #安装依赖，如果 CI 失败，请试一下 npm ci --no-cache --registry=https://registry.npmmirror.com/
npm run dev #启动项目
```

执行完成后，就可以在浏览器打开 `http://localhost:15021/index.html?channelId={channelId}` 来访问页面

## 构建部署

- 请先阅读和 `webpack` 相关的技术文章
- 如果需要自定义**生产环境构建文件的目录(outputDir)**，或者更改**部署应用包时的基本 URL(publicPath)**，请查看 `build/build-config.js` 和 `webpack.config.js` 后自行修改

### 基本构建和部署

如果需要用 Web 应用服务器来部署，比如 `Nginx`，那可以执行以下命令

```sh
npm run build
```

- 执行完成后，源码会构建输出到 `dist` 文件夹中，将该文件夹上传到服务器后，还需要修改 `Nginx` 的配置来支持页面访问
- 如果需要本地预览，请先执行[静态构建和部署](#静态构建和部署)

### 静态构建和部署

如果只需要简单上传代码到服务器后就能完成部署，那可以执行以下命令

```sh
npm run build-static
```

- 执行完成后，源码会构建输出到 `dist-static` 文件夹中，只要将该文件夹上传到服务器即完成部署
- 如果需要本地预览，可以启动一个 HTTP 服务器来访问 `dist-static` 文件夹，在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 [serve](https://github.com/vercel/serve)

### SDK 注入式部署

如果您需要在一个 React 项目或者其他项目内集成观看页应用，您需要借助 `external/sdk-inject-project` 这个子工程，具体详情请查阅 [处理 sdk 注入项目脚本](./external/sdk-inject-project/README.md)，如有不明之处，请咨询保利威技术团队

### 是否打包 Vue2.7

在 `build/build-config.js` 中存在一个 `needInternalBuildVue` 标志位，如果您的接入方式满足以下任一场景，请将其设置为 `true`，以确保观看页 SDK 及其依赖的 SDK 能正常工作

1、您使用正常的构建模式，但不想使用 vue 的外链的方式来全局挂载 `window.Vue`
2、您使用 SDK 注入模式，您自身的项目使用 Vue2.7.16 以下的版本，不想被观看页 SDK 影响到自身的项目 Vue 版本
3、您使用 SDK 注入模式，您自身的项目使用其他前端框架

请注意，无论如何请确保 `window.Vue` 存在，确保 `window.Vue2Module` 存在且为 `2.7.16` 的版本。

### 其他注意事项

> 从 v1.1.0 开始，外部错误页将自动使用保利威 SaaS 域名进行跳转，如有需要可以自行修改错误页地址

- 外部错误页
  - `src/hooks/core/use-error-verify` 文件跳转到的**外部错误页**，是保利威团队另外独立部署的页面。
  - 在本地调试时，由于 `webpack-dev-server` 做了一层代理转发，能够正常访问
  - 在实际部署时，错误页的域名默认会跟随当前页面的域名，会导致页面访问 `404`
  - 如果想保持和保利威 SaaS 观看页一致，请写死外部错误页的域名

## 目录说明

项目根目录说明

| 路径       | 说明                                                  |
| :--------- | :---------------------------------------------------- |
| .husky/    | [husky](https://github.com/typicode/husky) 钩子文件夹 |
| build/     | 构建逻辑                                              |
| public/    | 静态资源文件夹                                        |
| icon-svgs/ | svg 图标文件夹                                        |
| types/     | 全局的 typescript 类型                                |
| src/       | 项目源码                                              |
| external/  | 存放一些额外的文件/工程                               |

`src` 目录说明

| 路径           | 说明                                                                                                                                      |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| src/core       | 搭配 `@polyv/live-watch-sdk` 逻辑层                                                                                                       |
| src/app        | 项目应用入口                                                                                                                              |
| src/store      | 项目数据存储层                                                                                                                            |
| src/pages      | 项目业务页面，分为`引导页(splash)`和`观看页(watch)`，页面内再通过 `桌面端(pc)`,`移动端横屏(mobile)`,`移动端竖屏(portrait)` 来区分使用场景 |
| src/components | [项目相关组件](src/components/README.md)                                                                                                  |
| src/hooks      | [项目公共 hooks](src/hooks/README.md)                                                                                                     |
| src/assets     | 项目静态资源 , `src/assets/lang` 存放多语言文本                                                                                           |
| src/skins      | 项目多皮肤                                                                                                                                |
| src/plugins    | 项目第三方插件                                                                                                                            |

关键文件指引

- 观看页应用主入口
  - `src/main.ts`
  - `src/app/watch-app.vue`
- 保利威信息流应用主入口
  - `src/feed-main.ts`
  - `src/app/watch-feed-app.vue`
- 搭配 SDK 逻辑层
  - `src/core/watch-sdk.ts`
  - `src/store/use-watch-app-store.ts` => `resetUpWatchCore`
- 主业务
  - 跳转应用错误页
    - `src/store/use-watch-app-store.ts` => `setPageError`
  - 跳转外部错误页（构建部署时请注意该文件）
    - `src/hooks/core/use-error-verify`
  - 引导页进观看页
    - `src/app/layout/main-enter/_hooks/use-main-enter.ts`
  - 观看条件处理
    - `src/components/page-splash-common/auth/hooks/use-auth-common.ts`
    - `src/components/page-splash-common/auth/hooks/use-auth-special.ts`
  - 互动功能加载
    - `src/app/_hooks/use-iar-setup.ts`
  - 微信配置
    - `src/app/_hooks/use-weixin-setup`
  - sdk 注入模式
    - `src/plugins/sdk-inject-helper`

## 补充说明

请注意代码中标记 `@PLV-WARN` 的注释

### 项目应用入口说明

从 2.x 开始，该项目会有两个主入口

- 【观看页】应用主入口 `src/main.ts`
- 【保利威信息流】应用主入口 `src/feed-main.ts`

对应配套的 [Feed 流容器项目](https://gitee.com/polyv_ef/polyv-web-feed-container) 能够正常接入这两个应用入口，但只以【观看页】主入口为示例接入，如果您需要改用【保利威信息流】主入口，请自行接入。

### 构建图标组件

- 图标组件通过 `@polyv/icons-cli` 脚手架生成，执行 `npm run generate-icon` 会构建到 `src/components/component-icons` 中
- 需要添加图标时，需要开发者根据移动端和桌面端对图标分类，添加 svg 文件到 `icon-svgs` 对应目录下
- 在 `icon-svgs/demo/` 文件夹中可以查看到项目中的图标示例
- `vue` 图标组件中统一使用脚手架生成的 `map.ts` 文件引入

### 关于项目校验

- 目前该项目支持在 `git commit` 时进行校验，如校验失败需自动修复，可以执行 `npm run lint-fix` 尝试修复。如不需要在提交代码时进行校验，可以移除 `package.json` 中的 `precommit` 命令，或者注释 `.husky/pre-commit` 的执行命令
- 项目调试时会使用 `eslint + stylelint` 来校验代码，如不需要，可以到 `src/build/webpack.vue.config` 文件中注释相关的插件
- 2.x 不在使用 `fork-ts-checker-webpack-plugin` 对 `vue` 的 `script` 区块进行代码校验，建议在生产构建前，执行 `npm run check` 来检查一遍代码

### 关于 vscode 插件

- 项目中的 `.vscode` 文件默认会推荐使用的插件，可以根据需要进行安装
- 由于项目使用 `vue@2.7` 进行开发，推荐配合 `volar` 使用 （建议使用 v3.0.8 版本）
