import replace from 'rollup-plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import configs from './configs'

const externals = [
  'deepmerge',
  'vuex',
  'circular-json'
]

const genTsPlugin = (configOpts) => typescript({
  useTsconfigDeclarationDir: true,
  tsconfigOverride: {
    compilerOptions: {
      target: configOpts.target,
      declaration: configOpts.genDts
    }
  }
})

const genPlugins = (configOpts) => {
  const plugins = []
  if (configOpts.env) {
    plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(configOpts.env)
    }))
  }
  plugins.push(replace({
    'process.env.MODULE_FORMAT': JSON.stringify(configOpts.format)
  }))
  if (configOpts.plugins && configOpts.plugins.pre) {
    plugins.push(...configOpts.plugins.pre)
  }
  plugins.push(genTsPlugin(configOpts))

  if (configOpts.plugins && configOpts.plugins.post) {
    plugins.push(...configOpts.plugins.post)
  }
  return plugins
}

const genConfig = (configOpts) => ({
  input: 'src/index.ts',
  output: {
    file: configOpts.output,
    format: configOpts.format,
    name: 'VuexPersistence',
    sourcemap: true,
    exports: 'named',
    globals: configOpts.globals,
  },
  external: externals,
  plugins: genPlugins(configOpts)
})

const genAllConfigs = (configs) => (Object.keys(configs).map(key => genConfig(configs[key])))

export default genAllConfigs(configs)
