import { EventEmitter } from '@polyv/utils/event';
import { injectAssets } from '../lib/inject-assets';

/**
 * 加载 WatchApp 资源
 */
function loadPolyvWatchAppSource(opts = {}) {
  // http://localhost:5500/polyv-watch-app/
  const publicPath = opts.publicPath || '';

  if (publicPath) {
    window.PolyvWatchAppSdk.publicPath = publicPath;
  }

  injectAssets.forEach(function (item) {
    const elt = document.createElement(item.tagName);

    if (item.tagName === 'script') {
      // 脚本有依赖关系，要按顺序加载
      elt.async = false;

      // 需要处理一遍 publicPath
      if (publicPath) {
        item.attrs.src = `${publicPath}/${item.attrs.src}`;
      }
    }

    if (item.tagName === 'link' && publicPath) {
      item.attrs.href = `${publicPath}/${item.attrs.href}`;
    }

    Object.keys(item.attrs).forEach(function (key) {
      elt.setAttribute(key, item.attrs[key]);
    });

    document.head.appendChild(elt);
  });
}

// 主流程
(function main() {
  /**
   * 对外暴露的变量
   */
  window.PolyvWatchAppSdk = {
    eventEmitter: new EventEmitter(),
    loadPolyvWatchAppSource,
  };
})();
