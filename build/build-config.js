/**
 * @file 包信息
 */

/* eslint-env node */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-duplicate-string */

const path = require('path');
const pkgJSON = require('../package');
const { formatDate } = require('@polyv/utils/date');

let buildEnv = process.env.BUILD_ENV || 'prod';
/** 当前是否为开发模式 */
const devMode = (exports.devMode = process.env.NODE_ENV !== 'production');

/** 开发服务器端口号 */
const devServerPort = (exports.devServerPort = 15021);

/** 开发服务器局域网ip */
exports.devServerHost = '0.0.0.0';

let livePolyvCn = 'http://live.polyv.cn';

/**
 * 本地开发服务器代理。
 * 注意：当前依赖 http-proxy-middleware 2.x，context 仅支持字符串数组
 * （非 glob 字符串按路径前缀匹配），正则与 pathFilter 均不被 2.x 支持。
 */
exports.devServerProxy = [
  {
    context: ['/v2', '/error-verify'],
    target: livePolyvCn, // 测试环境
    changeOrigin: true,
    onProxyReq(proxyReq) {
      proxyReq.setHeader('host', 'live.polyv.cn');
    },
    onProxyRes(proxyRes) {
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        const newCookie = cookies.map(item => {
          return item.replace(/;\s*Domain=([^;])+/, '');
        });
        proxyRes.headers['set-cookie'] = newCookie;
      }
    },
  },
  // 宠物养成业务后端（Django，本地开发转发，保持浏览器同源；对应技术方案 §11.1）
  {
    context: ['/api', '/integrations'],
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
];


/** 构建模式 */
const buildMode = process.env.VUE_APP_BUILD_MODE;

/** sdk 注入模式 */
const inSdkInjectMode = (exports.inSdkInjectMode = buildMode === 'SDK_INJECT');

/** 是否需要内部打包 Vue */
const needInternalBuildVue = (exports.needInternalBuildVue = false);

/** 是否为静态打包构建模式 */
const isStaticBuildMode = (exports.isStaticBuildMode = buildMode === 'STATIC');

/** 是否提取 index-webpack-assets */
let extractIndexWebpackAssetsEnabled = !!inSdkInjectMode;
exports.extractIndexWebpackAssetsEnabled = extractIndexWebpackAssetsEnabled;

/** 是否启用用量上报 */
let rumEnabled = false;

/**
 * 构建模式
 * @type { {[key:string]: { [key:string]: {publicPath:string; outputDir:string} }} }
 * dev 代表本地调试，prod 代表构建发布
 * */
let buildModeConfigMap = {
  /** 常规 */
  GENERAL: {
    dev: {
      publicPath: '/',
      outputDir: 'dist',
    },
    prod: {
      publicPath: '/',
      outputDir: 'dist',
    },
  },
  /** 静态 */
  STATIC: {
    dev: {
      publicPath: '/',
      outputDir: 'dist-static',
    },
    prod: {
      publicPath: './',
      outputDir: 'dist-static',
    },
  },
  /** SDK注入 */
  SDK_INJECT: {
    dev: {
      publicPath: `http://localhost:${devServerPort}`,
      outputDir: 'dist-sdk-inject',
    },
    prod: {
      // @PLV-WARN 如果需要使用 sdk 注入模式，需要处理此处，不然只能配合 sdk-inject-project 使用
      publicPath: `http://localhost:5500/polyv-watch-app/`,
      outputDir: 'dist-sdk-inject',
    },
  },
};


const curBuildModeConfig = buildModeConfigMap[buildMode] || buildModeConfigMap.GENERAL;

/**
 * 是否启用运行时公共路径
 * @PLV-WARN 更改该配置前，请确认已知晓更改的风险和原理，当前只建议在 {@link inSdkInjectMode} 下更改该配置
 */
const enableRuntimePublicPath = false;

/** 公共路径 */
let publicPath = (() => {
  if (enableRuntimePublicPath) return '';

  // 同一台服务器承载多个项目时，所有构建资源都使用独立的项目路径。
  if (!devMode && process.env.VUE_APP_PUBLIC_PATH) return process.env.VUE_APP_PUBLIC_PATH;

  return devMode ? curBuildModeConfig.dev.publicPath : curBuildModeConfig.prod.publicPath;
})();
exports.publicPath = publicPath;

/** 项目构建时间 */
const projectBuildTime = (exports.projectBuildTime = formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss'));

/** 项目版本号 */
let projectVersion = (exports.projectVersion = pkgJSON.version);

/**
 * 获取观看页 SDK 环境变量
 * */
const getWatchSdkEnv = (exports.getWatchSdkEnv = () => {
    return 'prod';
});

/** 注入的全局常量 */
exports.defineConstants = {
  /** 项目构建时间 */
  PROJECT_BUILD_TIME: JSON.stringify(projectBuildTime),
  /** 项目版本号 */
  PROJECT_VERSION: JSON.stringify(projectVersion),
  /** 观看页 SDK 加载的环境 */
  WATCH_SDK_ENV: JSON.stringify(getWatchSdkEnv()),
  /** 处于 sdk-inject 构建模式下 */
  IN_SDK_INJECT_MODE: JSON.stringify(inSdkInjectMode),
  /** 是否启用运行时公共路径 */
  ENABLE_RUNTIME_PUBLIC_PATH: JSON.stringify(enableRuntimePublicPath),
  /** 构建环境 */
  BUILD_ENV: JSON.stringify(buildEnv),
  /** 是否为静态打包构建模式 */
  IS_STATIC_BUILD_MODE: JSON.stringify(isStaticBuildMode),
  /** 是否需要内部打包 Vue 文件 */
  NEED_INTERNAL_BUILD_VUE: JSON.stringify(needInternalBuildVue),
  /** 是否启用用量上报 */
  RUM_ENABLED: JSON.stringify(rumEnabled),
};

/** ts 配置文件 */
exports.tsConfigFile = path.resolve(
  __dirname,
  devMode ? '../tsconfig.json' : '../tsconfig.build.json',
);

/** 需要编译的包名 */
exports.transpileDependencies = [
  'pinia',
  '@vue/devtools-api',
  'lodash-es',
  'js-base64',
  '@polyv/utils',
  'force-autoplay',
];

/** 需要配置到 sass-resources-loader 的资源 */
exports.sassResources = ['assets/styles/variables.scss', 'assets/styles/mixins.scss'];

let devAlias = {};

/** 别名 */
exports.alias = {
  '@': path.resolve(__dirname, '../src'),
  ...devAlias,
};

/** 生产环境构建文件的目录 */
let outputDir = devMode ? curBuildModeConfig.dev.outputDir : curBuildModeConfig.prod.outputDir;
exports.outputDir = outputDir;
