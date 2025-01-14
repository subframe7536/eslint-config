import type { OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '../types'

import { interopDefault } from '../utils'

export const StylisticConfigDefaults: StylisticConfig = {
  indent: 2,
  jsx: true,
  quotes: 'single',
  semi: false,
}

export interface StylisticOptions extends StylisticConfig, OptionsOverrides {}

export async function stylistic(
  options: StylisticOptions = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    indent,
    jsx,
    overrides = {},
    quotes,
    semi,
  } = {
    ...StylisticConfigDefaults,
    ...options,
  }

  const pluginStylistic = await interopDefault(import('@stylistic/eslint-plugin'))

  const config = pluginStylistic.configs.customize({
    flat: true,
    indent,
    jsx,
    pluginName: 'style',
    quotes,
    semi,
  })

  return [
    {
      name: 'subf/stylistic/rules',
      plugins: {
        style: pluginStylistic,
      },
      rules: {
        ...config.rules,
        curly: ['error', 'all'],
        ...overrides,
      },
    },
  ]
}
