import { rmSync } from 'node:fs'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import { dts } from 'rollup-plugin-dts'

const typesDir = 'dist/types'

// CSS is inlined into the JS bundle, so its side-effect import must not reach the declarations
const dropCss = {
  name: 'drop-css',
  resolveId: (id) => (id.endsWith('.css') ? id : null),
  load: (id) => (id.endsWith('.css') ? '' : null),
}

const removeTypesDir = {
  name: 'remove-types-dir',
  closeBundle: () => rmSync(typesDir, { recursive: true, force: true }),
}

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.es.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      postcss({
        modules: false,
        minimize: true,
        inject: true,
        extract: false,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declarationDir: typesDir,
      }),
    ],
  },
  {
    input: `${typesDir}/index.d.ts`,
    output: [
      { file: 'dist/index.d.ts', format: 'es' },
      // CJS consumers need a .d.cts, otherwise TS treats the types as ESM under "type": "module"
      { file: 'dist/index.d.cts', format: 'es' },
    ],
    external: [/^react($|\/)/, /^react-dom($|\/)/],
    plugins: [dropCss, dts(), removeTypesDir],
  },
]
