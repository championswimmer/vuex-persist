import typescript from 'rollup-plugin-typescript2'

export default {
    input: 'src/index.ts',
    output: {
        file: "dist/index.js",
        format: "cjs",
        name: "vuex-persist",
        sourcemap: true,
        exports: 'named'
    },
    external: [
        "lodash.merge",
        "vuex"
    ],
    plugins: [
        typescript()
    ]
};