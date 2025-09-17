import { resolve } from 'path'

import { defineConfig } from 'tsup'
import type { Options } from 'tsup'

export default defineConfig((options) => {
  const isNode = options.env?.TARGET === 'node'
  const isBrowser = options.env?.TARGET === 'browser'

  if (!isNode && !isBrowser) {
    throw new Error(
      'TARGET environment variable must be set to either "node" or "browser"'
    )
  }

  const target = isNode ? 'node18' : 'esnext'
  const platform = isNode ? 'node' : 'browser'
  const outDir = isNode ? 'dist/node' : 'dist/browser'

  const config: Options = {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target,
    platform,
    outDir,
    outExtension: ({ format }) => {
      return {
        js: format === 'esm' ? `.${platform}.js` : `.${platform}.cjs`,
      }
    },
    sourcemap: true,
    minify: true,
    clean: true,
    dts: isNode,
    external: [
      // Node.js built-ins
      ...(isNode
        ? ['path', 'fs', 'crypto', 'stream', 'util', 'events', 'buffer']
        : ['crypto', 'stream', 'util', 'events', 'buffer']),
      // External dependencies that should not be bundled
      '@near-js/accounts',
      '@near-js/crypto',
      '@near-js/keystores',
      '@near-js/transactions',
      '@near-js/types',
      'bs58',
      'chain-registry',
      'coinselect',
      'js-sha3',
      'viem',
    ],
    treeshake: true,
    splitting: false,
    esbuildOptions: (options) => {
      options.conditions = isNode
        ? ['node', 'import', 'default']
        : ['browser', 'import', 'default']
      options.mainFields = isNode
        ? ['module', 'main']
        : ['browser', 'module', 'main']

      // Configure for proper ESM handling
      if (options.format === 'esm') {
        options.packages = 'external'
      }
    },
  }

  return config
})
