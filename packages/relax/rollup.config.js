import _dts from 'rollup-plugin-dts'
import * as _esbuild from 'rollup-plugin-esbuild'
import {resolve} from "path"
const esbuild=_esbuild.default.default
const dts=_dts.default
const name = require('./package.json').main.replace(/\.js$/, '')
const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})
const bundleDotenv = config => ({
  ...config,
  input: 'src/dotenv.ts',
  external: id => !/^[./]/.test(id),
})
export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        file: `${name}.js`,
        format: 'es',
        sourcemap: true,
      },
       {
        file: `${name}.cjs`,
        format: 'cjs',
        sourcemap: true,
      },
    ],
  }),
  bundleDotenv({
    plugins: [esbuild()],
    output: [
      {
        file: `dotenv.js`,
        format: 'es',
        sourcemap: false,
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