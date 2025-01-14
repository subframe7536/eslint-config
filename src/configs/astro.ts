import type { OptionsFiles, OptionsOverrides, OptionsStylistic, TypedFlatConfigItem } from '../types'

import { GLOB_ASTRO } from '../globs'
import { ensurePackages, interopDefault } from '../utils'

export async function astro(
  options: OptionsOverrides & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    files = [GLOB_ASTRO],
    overrides = {},
  } = options

  ensurePackages([
    'eslint-plugin-astro',
  ])

  return [
    ...(await interopDefault(import('eslint-plugin-astro'))).configs['flat/recommended'],
    {
      files,
      name: 'subf/astro/rules',
      rules: {
        // Astro uses top level await for e.g. data fetching
        // https://docs.astro.build/en/guides/data-fetching/#fetch-in-astro
        'antfu/no-top-level-await': 'off',
        'astro/no-set-html-directive': 'off',
        'astro/semi': 'off',
        ...overrides,
      },
    },
  ]
}
