import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      name: 'vuex-persist',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/esm/index.js',
      format: 'esm',
      name: 'vuex-persist',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: [
    'lodash.merge',
    'vuex',
    'circular-json'
  ],
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext',
        }
      }
    })
  ]
}