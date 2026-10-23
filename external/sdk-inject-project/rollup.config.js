import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/polyv-watch-app/inject-sdk.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      configFile: './.babelrc',
      exclude: 'node_modules/**',
    }),
    terser(),
  ],
};
