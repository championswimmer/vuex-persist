import typescript from 'rollup-plugin-typescript2'
import {uglify} from 'rollup-plugin-uglify'
import merge from 'lodash.merge'

const input = 'src/index.ts'
const external = [
  'lodash.merge',
  'vuex',
  'circular-json'
]
const configNode = {
  input,
  output: ['cjs', 'esm'].map(format =>
    ({
      file: `dist/${format}/index.js`,
      format,
      sourcemap: true
    })
  ),
  external,
  plugins: [typescript({
    tsconfigOverride: {
      compilerOptions: {module: 'es2015'}
    }
  })]
}
const configBrowser = {
  input,
  output: {
    file: 'dist/umd/index.js',
    format: 'umd',
    name: 'VuexPersistence',
    sourcemap: true,
    exports: 'named',
    globals: {
      'lodash.merge': '_.merge'
    }
  },
  external,
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          module: 'es2015',
          declaration: true,
          declarationDir: 'dist/types',
          target: 'es5'
        }
      }
    })
  ]
}
const configBrowserMin = merge({}, configBrowser, {
  output: {file: 'dist/umd/index.min.js'},
  plugins: [void 0 /* skip 1 slot for ts */, uglify()]
})
export default [
  configNode,
  configBrowser
  // configBrowserMin
]