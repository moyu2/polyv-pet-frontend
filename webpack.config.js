const path = require('path');
const {
  devServerPort,
  devServerHost,
  devServerProxy,
  publicPath,
  inSdkInjectMode,
  devMode,
  getWatchSdkEnv,
  outputDir,
} = require('./build/build-config');
const { webpackCommonConfig, lintPlugins } = require('./build/webpack-helper/config');
const { genHistoryApiFallbackRewrites } = require('./build/webpack-helper/util');

const webpack = require('webpack');
const { merge } = require('webpack-merge');

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { LightningCssMinifyPlugin } = require('lightningcss-loader');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CodeInspectorPlugin } = require('code-inspector-plugin');
const { RsdoctorWebpackPlugin } = require('@rsdoctor/webpack-plugin');
const SwcMinifyWebpackPlugin = require('./build/plugins/swc-minify-webpack-plugin');

/**
 * 本地调试服务配置
 */
const devServer = {
  host: devServerHost,
  port: devServerPort,
  allowedHosts: 'all',
  headers: {
    'Access-Control-Allow-Origin': '*',
  },

  historyApiFallback: {
    disableDotRule: true,
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    rewrites: genHistoryApiFallbackRewrites(publicPath, { index: { filename: 'index.html' } }),
  },
  client: {
    overlay: {
      runtimeErrors: false,
      warnings: false,
      errors: true,
    },
  },
  proxy: devServerProxy,
  static: [
    {
      publicPath: '/',
      directory: path.resolve(__dirname, './external/'),
    },
    // 宠物形象等静态资源：public/ 在构建时由 CopyPlugin 拷贝到 dist，
    // 本地开发时这里直接服务 public/assets（本项目二开）。
    {
      publicPath: '/assets/',
      directory: path.resolve(__dirname, './public/assets/'),
    },
  ],
};

/**
 * 仅配置入口和输出
 * @type {import('webpack').Configuration}
 */
const commonConfig = {
  entry: {
    index:
      process.env.VUE_APP_MAIN_MODE === 'Feed'
        ? path.resolve(__dirname, './src/feed-main.ts')
        : path.resolve(__dirname, './src/main.ts'),
    // 独立视觉验收页复用正式宠物组件，仅在本地开发时编译。
    ...(devMode ? { 'pet-preview': path.resolve(__dirname, './src/pet-preview.ts') } : {}),
  },

  output: {
    path: path.resolve(__dirname, outputDir),
    filename: 'assets/js/[name].js',
    publicPath,
    chunkFilename: 'assets/js/[name].js',
  },
};

/** @type {import('webpack').Configuration} */
const devConfig = merge(commonConfig, {
  mode: 'development',

  devServer,

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'pet-preview.html',
      template: path.resolve(__dirname, './public/pet-preview.html'),
      chunks: ['chunk-vendors', 'chunk-common', 'pet-preview'],
      scriptLoading: 'defer',
    }),
    new webpack.ProgressPlugin((percentage, message, ...args) => {
      const percent = Math.round(percentage * 100);
      if (percent < 100) {
        console.clear();
        console.info(`🔨 编译中... ${percent}% ${message}`, ...args);
      }
    }),
    {
      apply: compiler => {
        compiler.hooks.done.tap('DonePlugin', stats => {
          if (stats.hasErrors()) {
            console.error('❌ 编译失败！');
            return;
          }

          setTimeout(() => {
            // 获取 host 和 port
            const host = devServer.host || 'localhost';
            const port = devServer.port || 8080;
            const protocol = devServer.https ? 'https' : 'http';

            const url = `${protocol}://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;

            if (inSdkInjectMode) {
              console.log('\x1b[32m%s\x1b[0m', `🎉 编译完成！请访问： ${url}/index.html`);
              console.log(`${url}/sdk-inject-project/dist/polyv-watch-app/inject-sdk.js`);
            } else {
              console.log('\x1b[32m%s\x1b[0m', `🎉 编译完成！请访问： ${url}${publicPath}`);
            }
          }, 100);
        });
      },
    },
  ]
    .concat(lintPlugins)
    .concat(
      inSdkInjectMode
        ? []
        : [
            CodeInspectorPlugin({
              bundler: 'webpack',
              exclude: path.resolve(__dirname, '../../sdk/.dist'),
            }),
          ],
    ),
});

/** @type {import('webpack').Configuration} */
const prodConfig = merge(commonConfig, {
  mode: 'production',

  devtool: getWatchSdkEnv() === 'prod' ? false : 'source-map',

  output: {
    filename: 'assets/js/[name].[contenthash:8].js',
    chunkFilename: 'assets/js/[name].[contenthash:8].js',
    clean: true,
  },

  optimization: {
    realContentHash: false,
    minimizer: [
      new SwcMinifyWebpackPlugin({
        // 与 swc-loader 的 jsc.target 保持一致
        jscTarget: 'es2015',
        pureFuncs: ['console.log'],
      }),
      new LightningCssMinifyPlugin(),
    ],
  },

  plugins: [
    new webpack.ProgressPlugin({ profile: true }),

    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash:8].css',
      chunkFilename: 'assets/css/[name].[contenthash:8].css',
    }),

    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './public'),
          to: path.join(__dirname, outputDir),
          toType: 'dir',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/index.html', '**/pet-preview.html'],
          },
          info: {
            minimized: true,
          },
        },
      ],
    }),
  ]
    .concat(lintPlugins)
    .concat(
      process.env.USE_ANALYZER
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
            }),
            new RsdoctorWebpackPlugin(), // 替代 SpeedMeasurePlugin
          ]
        : [],
    ),
});

const webpackConfig = merge(webpackCommonConfig, devMode ? devConfig : prodConfig);

module.exports = webpackConfig;
