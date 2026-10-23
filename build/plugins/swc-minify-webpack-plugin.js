const swc = require('@swc/core');
const { Compilation } = require('webpack');
const { RawSource, SourceMapSource } = require('webpack-sources');

/**
 * SWC 压缩 Webpack 插件
 *
 * 在 processAssets 的 OPTIMIZE_SIZE 阶段用 swc 压缩 JS 资源，替代 esbuild-loader 的 EsbuildPlugin。
 * 选择 swc 的原因：压缩器不会把 swc-loader 已降级的 ES2020+ 语法（可选链 / 空值合并的
 * 判空三元形式）重新还原为高版本语法，与转译阶段的 jsc.target 天然保持一致，无需额外约束。
 *
 * 行为对齐原 EsbuildPlugin 配置（css: false / pure: ['console.log']）：
 * - 仅处理 JS 资源（test 可配置），CSS 交给 LightningCssMinifyPlugin；
 * - pure_funcs 移除指定函数调用；
 * - comments: 'some' 保留 /*! license 类法律注释；
 * - devtool 为 source-map 时接续 sourcemap 链（SourceMapSource）。
 */
class SwcMinifyWebpackPlugin {
  /**
   * @param {Object} [options]
   * @param {RegExp} [options.test] 资源匹配规则，默认所有 .js
   * @param {string} [options.jscTarget] 与 swc-loader 的 jsc.target 保持一致，默认 es2015
   * @param {string[]} [options.pureFuncs] 视为无副作用可移除的函数名，默认 ['console.log']
   */
  constructor(options = {}) {
    const {
      test = /\.js(\?.*)?$/i,
      jscTarget = 'es2015',
      pureFuncs = ['console.log'],
      compressOptions = {},
    } = options;

    this.test = test;

    this.swcOptions = {
      minify: true,
      jsc: {
        target: jscTarget,
        minify: {
          compress: {
            pure_funcs: pureFuncs,
            ...compressOptions,
          },
          mangle: true,
          format: {
            // 保留 /*! 与 @license/@preserve 注释
            comments: 'some',
          },
        },
      },
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('SwcMinifyWebpackPlugin', compilation => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'SwcMinifyWebpackPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          additionalAssets: true,
        },
        assets => this.minifyAssets(compilation, assets),
      );
    });
  }

  /**
   * 压缩所有命中的 JS 资源
   * @param {import('webpack').Compilation} compilation
   * @param {Record<string, unknown>} assets 本阶段新增/变更的资源
   */
  async minifyAssets(compilation, assets) {
    const devtool = compilation.options.devtool;
    // eval 类 devtool 无法接续压缩后的 sourcemap，跳过 map 处理
    const useSourceMap =
      typeof devtool === 'string' && devtool.includes('source-map') && !devtool.includes('eval');

    const names = Object.keys(assets).filter(name => this.test.test(name));
    await Promise.all(
      names.map(async name => {
        try {
          const asset = compilation.getAsset(name);
          if (!asset || (asset.info && asset.info.minimized)) return;

          let source;
          let map;
          if (useSourceMap) {
            const sourceAndMap = asset.source.sourceAndMap();
            source = sourceAndMap.source;
            map = sourceAndMap.map;
          } else {
            source = asset.source.source();
          }

          const result = await swc.transform(source, {
            ...this.swcOptions,
            filename: name,
            // webpack 打包产物是脚本而非 ESM 模块
            isModule: false,
            sourceMaps: useSourceMap,
            inputSourceMap: map ? JSON.stringify(map) : undefined,
          });

          if (useSourceMap && result.map) {
            compilation.updateAsset(
              name,
              new SourceMapSource(result.code, name, JSON.parse(result.map)),
              { minimized: true },
            );
          } else {
            compilation.updateAsset(name, new RawSource(result.code), { minimized: true });
          }
        } catch (error) {
          compilation.errors.push(
            new Error(`SwcMinifyWebpackPlugin: 压缩 ${name} 失败\n${error && error.message}`),
          );
        }
      }),
    );
  }
}

module.exports = SwcMinifyWebpackPlugin;
