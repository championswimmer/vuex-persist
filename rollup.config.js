import typescript from 'rollup-plugin-typescript2'

const input = 'src/index.ts'
const external = [
  'lodash.merge',
  'vuex',
  'circular-json'
]
export default [
  {
    input,
    output: ['cjs', 'esm'].map(format =>
      ({
        file: `dist/${format}/index.js`,
        format,
        sourcemap: true
      })
    ),
    external,
    plugins: [typescript({})]
  },
  {
    input,
    output: {
      file: 'dist/umd/index.js',
      format: 'umd',
      name: 'VuexPersist',
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
            declaration: true,
            declarationDir: 'dist/types',
            target: 'es5'
          }
        }
      })
    ]
  }]