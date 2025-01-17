import type { TypedFlatConfigItem } from '../types'
import { GLOB_JSON, GLOB_JSON5, GLOB_JSONC } from '../globs'
import { interopDefault } from '../utils'

export async function antfu(): Promise<TypedFlatConfigItem[]> {
  const pluginAntfu = await interopDefault(import('eslint-plugin-antfu'))
  return [
    {
      name: 'subf/antfu/setup',
      plugins: { antfu: pluginAntfu },
      rules: {
        'antfu/consistent-chaining': 'error',
        'antfu/consistent-list-newline': 'error',
        'antfu/import-dedupe': 'error',
        'antfu/no-import-node-modules-by-path': 'error',
        'antfu/top-level-function': 'error',
      },
    },
    {
      files: [GLOB_JSON, GLOB_JSON5, GLOB_JSONC],
      name: 'subf/antfu/ban-json',
      rules: {
        'antfu/consistent-list-newline': 'off',
      },
    },
  ]
}
