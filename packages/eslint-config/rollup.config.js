import _dts from 'rollup-plugin-dts'
import * as _esbuild from 'rollup-plugin-esbuild'
const esbuild=_esbuild.default.default
const dts=_dts.default
const name = require('./package.json').main.replace(/\.js$/, '')
const bundle = config => ({
  ...config,
  input: 'index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true,
      }
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
  }),
]