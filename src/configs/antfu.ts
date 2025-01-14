import type { TypedFlatConfigItem } from 'src/types'
import { interopDefault } from 'src/utils'

export async function antfu(): Promise<TypedFlatConfigItem[]> {
  const pluginAntfu = await interopDefault(import('eslint-plugin-antfu'))
  return [
    {
      name: 'subf/antfu/setup',
      plugins: [pluginAntfu],
      rules: {
        'antfu/consistent-chaining': 'error',
        'antfu/consistent-list-newline': 'error',
        'antfu/import-dedupe': 'error',
        'antfu/no-import-node-modules-by-path': 'error',
        'antfu/top-level-function': 'error',
      },
    },
  ]
}
