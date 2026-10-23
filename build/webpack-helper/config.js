const path = require('path');
const webpack = require('webpack');
const pkgJson = require('../../package.json');

const { VueLoaderPlugin } = require('vue-loader');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const CorsPlugin = require('../plugins/cors-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ExtractIndexWebpackAssetPlugin } = require('../plugins/extract-index-asset-webpack-plugin');

const ESLintPlugin = require('eslint-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ParallelLintWebpackPlugin = require('../plugins/parallel-lint-webpack-plugin');

const {
  sassResources,
  alias,
  defineConstants,
  devMode,
  inSdkInjectMode,
  extractIndexWebpackAssetsEnabled,
  outputDir,
  publicPath,
} = require('../build-config');
const { externalConfigs, tagConfigs } = require('../tag-config');
const { resolveClientEnv } = require('./util');

const projectPath = path.resolve(__dirname, '../../');
const srcPath = path.join(projectPath, 'src');

// ========== loader ===========

const vueStyleLoader = devMode
  ? {
      loader: 'vue-style-loader',
      options: {
        sourceMap: false,
        shadowMode: false,
      },
    }
  : {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath,
      },
    };

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: false,
    importLoaders: 2,
  },
};

const lightningCssLoader = {
  loader: 'lightningcss-loader',
  options: {
    sourceMap: false,
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap: false,
    // 同时使用 `modern-compiler` 和 `sass-embedded` 可以显著提升构建性能
    // 需要 `sass-loader >= 14.2.1`
    api: 'modern-compiler',
    implementation: require.resolve('sass-embedded'),
  },
};

const swcLoader = opts => {
  const { isTs = false } = opts || {};

  return devMode
    ? [
        {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: isTs ? 'typescript' : 'ecmascript',
              },
            },
          },
        },
      ]
    : [
        {
          loader: 'swc-loader',
          options: {
            jsc: {
              target: 'es2015',
              parser: {
                syntax: isTs ? 'typescript' : 'ecmascript',
              },
            },
          },
        },
      ];
};

// ========== plugin ===========

const indexWebpackAssetsPlugins = extractIndexWebpackAssetsEnabled
  ? [
      inSdkInjectMode
        ? new ExtractIndexWebpackAssetPlugin({
            outputPath: path.join(projectPath, 'external/sdk-inject-project/lib'),
            fileName: 'inject-assets.js',
            buildModule: 'esm',
            indexAssetVarKey: 'injectAssets',
          })
        : new ExtractIndexWebpackAssetPlugin({
            outputPath: path.join(projectPath, outputDir),
            fileName: 'index-assets.js',
            buildModule: 'umd',
            indexAssetVarKey: 'indexAssets',
          }),
    ]
  : [];

const lintPlugins = devMode
  ? [
      new ESLintPlugin({
        lintDirtyModulesOnly: devMode,
        extensions: ['js', 'ts', 'vue'],
      }),

      new StyleLintPlugin({
        lintDirtyModulesOnly: devMode,
        files: ['**/*.{vue,css,scss}'],
      }),
    ]
  : [
      new ParallelLintWebpackPlugin({
        enabled: process.env.USE_PARALLEL_LINT === 'true',
        failOnError: true,
      }),
    ];

// ========== config ===========

/**
 * 工程共用配置
 * @type {import('webpack').Configuration}
 */
const webpackCommonConfig = {
  stats: 'minimal',

  resolve: {
    extensions: ['.js', '.mjs', '.ts', '.vue', '.css', '.scss'],
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
      ...alias,
    },
    modules: ['node_modules', path.join(projectPath, 'node_modules')],
  },

  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      // ========  core  ========

      {
        test: /\.m?jsx?$/,
        use: swcLoader(),
      },

      {
        test: /\.ts$/,
        use: swcLoader({ isTs: true }),
        exclude: /node_modules/,
        include: srcPath,
      },

      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
      {
        test: /\.vue$/,
        resourceQuery: /type=style/,
        sideEffects: true,
      },

      // ========  style  ========

      /* config.module.rule('css') */
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /\?vue/,
            use: [vueStyleLoader, cssLoader, lightningCssLoader],
          },
          {
            use: [vueStyleLoader, cssLoader, lightningCssLoader],
          },
        ],
      },
      {
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: /\?vue/,
            use: [vueStyleLoader, cssLoader, lightningCssLoader, sassLoader],
          },
          {
            use: [vueStyleLoader, cssLoader, lightningCssLoader, sassLoader],
          },
        ],
      },
      {
        test: /\.scss$/,
        include: srcPath,
        use: [
          {
            loader: 'sass-resources-loader',
            options: {
              resources: sassResources.map(function (item) {
                return path.join(srcPath, item);
              }),
            },
          },
        ],
      },

      // ========  assets  ========

      {
        test: /\.ico$/i,
        type: 'assets/resource',
        exclude: /node_modules/,
      },
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.svga$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/svga/[name][hash:8].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'assets/media/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          filename: 'assets/fonts/[name].[hash:8][ext]',
        },
      },
    ],
  },

  externals: externalConfigs,

  plugins: [
    new webpack.DefinePlugin({
      ...defineConstants,
      ...resolveClientEnv(),
    }),

    new CaseSensitivePathsPlugin(),

    new VueLoaderPlugin(),

    new HtmlWebpackPlugin({
      title: pkgJson.name,
      scriptLoading: 'defer',
      chunks: ['chunk-polyv', 'chunk-vendors', 'chunk-common', 'index'],
      template: path.join(projectPath, 'public/index.html'),
      filename: 'index.html',
    }),

    new CorsPlugin({
      crossorigin: 'anonymous',
      integrity: false,
      publicPath,
    }),

    new HtmlWebpackTagsPlugin({
      tags: tagConfigs,
    }),
  ].concat(indexWebpackAssetsPlugins),

  optimization: {
    splitChunks: {
      cacheGroups: {
        polyv: {
          name: 'chunk-polyv',
          test: /[\\/]node_modules[\\/](@polyv)[\\/]vue-components/,
          priority: 20,
          chunks: 'initial',
        },
        defaultVendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
      minSize: 0.5 * 1024 * 1024,
    },
  },
};

module.exports = {
  webpackCommonConfig,
  lintPlugins,
};
