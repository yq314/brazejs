import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'

const version = process.env.VERSION || pkg.version
const sourcemap = true
const banner = `/*
 * brazejs@${version}, https://github.com/yq314/brazejs
 * (c) 2019-${new Date().getFullYear()} QingYE
 * Released under the MIT License.
 */`
const treeshake = {
  propertyReadSideEffects: false
}
const input = './src/liquid.ts'

export default [{
  output: [{
    file: 'dist/liquid.common.js',
    name: 'Liquid',
    format: 'cjs',
    sourcemap,
    banner
  }],
  external: ['path', 'fs', 'request-promise-cache'],
  plugins: [typescript({
    tsconfigOverride: {
      include: [ 'src' ],
      exclude: [ 'test', 'benchmark' ],
      compilerOptions: {
        target: 'es5',
        module: 'ES2015'
      }
    }
  })],
  treeshake,
  input
}, {
  output: [{
    file: 'dist/liquid.js',
    name: 'Liquid',
    format: 'umd',
    sourcemap,
    banner
  }],
  plugins: [
    replace({
      include: './src/liquid.ts',
      delimiters: ['', ''],
      './fs/node': './fs/browser'
    }),
    typescript({
      tsconfigOverride: {
        include: [ 'src' ],
        exclude: [ 'test', 'benchmark' ],
        compilerOptions: {
          target: 'es5',
          module: 'ES2015'
        }
      }
    })
  ],
  treeshake,
  input
}, {
  output: [{
    file: 'dist/liquid.min.js',
    name: 'Liquid',
    format: 'umd',
    sourcemap
  }],
  plugins: [
    replace({
      include: './src/liquid.ts',
      delimiters: ['', ''],
      './fs/node': './fs/browser'
    }),
    typescript({
      tsconfigOverride: {
        include: [ 'src' ],
        exclude: [ 'test', 'benchmark' ],
        compilerOptions: {
          target: 'es5',
          module: 'ES2015'
        }
      }
    }),
    uglify()
  ],
  treeshake,
  input
}]
