import type { TypedFlatConfigItem } from '../types'

import { interopDefault } from '../utils'

export async function comments(): Promise<TypedFlatConfigItem[]> {
  // @ts-expect-error no types
  const pluginComments = await interopDefault(import('@eslint-community/eslint-plugin-eslint-comments'))
  return [
    {
      name: 'antfu/eslint-comments/rules',
      plugins: {
        'eslint-comments': pluginComments,
      },
      rules: {
        'eslint-comments/no-aggregating-enable': 'error',
        'eslint-comments/no-duplicate-disable': 'error',
        'eslint-comments/no-unlimited-disable': 'error',
        'eslint-comments/no-unused-enable': 'error',
      },
    },
  ]
}
