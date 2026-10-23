/**
 * @file 当前文件内容为 `inject-assets` 的备份参考文件，父级项目构建完成后，会自动生成 `lib/inject-assets`
 */

export const injectAssets = [
  {
    attrs: {
      src: 'http://localhost:15020/assets/js/chunk-polyv.js',
      crossorigin: 'anonymous',
    },
    tagName: 'script',
  },
  {
    attrs: {
      src: 'http://localhost:15020/assets/js/chunk-vendors.js',
      crossorigin: 'anonymous',
    },
    tagName: 'script',
  },
  {
    attrs: {
      src: 'http://localhost:15020/assets/js/index.js',
      crossorigin: 'anonymous',
    },
    tagName: 'script',
  },
];
