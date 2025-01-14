import type { OptionsFiles, OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '../types'

import { GLOB_JSON, GLOB_JSON5, GLOB_JSONC } from '../globs'
import { interopDefault } from '../utils'

export async function jsonc(
  options: OptionsFiles & OptionsStylistic & OptionsOverrides = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    files = [GLOB_JSON, GLOB_JSON5, GLOB_JSONC],
    overrides = {},
    stylistic = true,
  } = options

  const {
    indent = 2,
  } = typeof stylistic === 'boolean' ? {} : stylistic

  const pluginJsonc = await interopDefault(import('eslint-plugin-jsonc'))

  return [
    ...pluginJsonc.configs['flat/recommended-with-jsonc'],
    {
      files,
      name: 'subf/jsonc/rules',
      rules: {
        ...stylistic
          ? {
              'jsonc/array-bracket-spacing': ['error', 'never'],
              'jsonc/comma-dangle': ['error', 'never'],
              'jsonc/comma-style': ['error', 'last'],
              'jsonc/indent': ['error', indent],
              'jsonc/key-spacing': ['error', { afterColon: true, beforeColon: false }],
              'jsonc/object-curly-newline': ['error', { consistent: true, multiline: true }],
              'jsonc/object-curly-spacing': ['error', 'always'],
              'jsonc/object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
              'jsonc/quote-props': 'error',
              'jsonc/quotes': 'error',
            }
          : {},

        ...overrides,
      },
    },
  ]
}
