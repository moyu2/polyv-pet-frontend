const path = require('path');

function genHistoryApiFallbackRewrites(baseUrl, pages = {}) {
  const multiPageRewrites = Object.keys(pages)
    // sort by length in reversed order to avoid overrides
    // eg. 'page11' should appear in front of 'page1'
    .sort((a, b) => b.length - a.length)
    .map(name => ({
      from: new RegExp(`^/${name}`),
      to: path.posix.join(baseUrl, pages[name].filename || `${name}.html`),
    }));
  return [...multiPageRewrites, { from: /./, to: path.posix.join(baseUrl, 'index.html') }];
}

const prefixRE = /^VUE_APP_/;

function resolveClientEnv() {
  const env = {};
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV') {
      env[key] = process.env[key];
    }
  });

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }
  return {
    'process.env': env,
  };
}

module.exports = {
  genHistoryApiFallbackRewrites,
  resolveClientEnv,
};
