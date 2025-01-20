import type { OptionsFiles, OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '../types'

import { GLOB_ASTRO } from '../globs'
import { ensurePackages, interopDefault } from '../utils'

export async function astro(
  options: OptionsOverrides & OptionsFiles & Pick<StylisticConfig, 'semi'> = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    files = [GLOB_ASTRO],
    overrides = {},
    semi,
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
        'astro/no-set-html-directive': 'off',
        // fix <script /> tag
        'style/jsx-one-expression-per-line': ['error', { allow: 'non-jsx' }],
        // fix style/semi not working in astro file
        ...semi !== undefined
          ? { 'astro/semi': ['error', semi ? 'always' : 'never'] }
          : {},
        ...overrides,
      },
    },
  ]
}
