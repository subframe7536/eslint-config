import type { OptionsFiles, OptionsOverrides, StylisticConfig, TypedFlatConfigItem } from '../types'

import { GLOB_ASTRO } from '../globs'
import { interopDefault } from '../utils'

export async function astro(
  options: OptionsOverrides & OptionsFiles & Pick<StylisticConfig, 'semi'> = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    files = [GLOB_ASTRO],
    overrides = {},
    semi,
  } = options

  const [
    pluginAstro,
    parserAstro,
    parserTs,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-astro')),
    interopDefault(import('astro-eslint-parser')),
    interopDefault(import('@typescript-eslint/parser')),
  ] as const)

  return [
    {
      name: 'subf/astro/setup',
      plugins: {
        astro: pluginAstro,
      },
    },
    {
      files,
      languageOptions: {
        globals: pluginAstro.environments.astro.globals,
        parser: parserAstro,
        parserOptions: {
          extraFileExtensions: ['.astro'],
          parser: parserTs,
        },
        sourceType: 'module',
      },
      name: 'subf/astro/rules',
      processor: 'astro/client-side-ts',
      rules: {
        // use recommended rules
        'astro/missing-client-only-directive-value': 'error',
        'astro/no-conflict-set-directives': 'error',
        'astro/no-deprecated-astro-canonicalurl': 'error',
        'astro/no-deprecated-astro-fetchcontent': 'error',
        'astro/no-deprecated-astro-resolve': 'error',
        'astro/no-deprecated-getentrybyslug': 'error',
        'astro/no-set-html-directive': 'off',
        'astro/no-unused-define-vars-in-style': 'error',
        'astro/semi': 'off',
        'astro/valid-compile': 'error',

        // fix <script /> tag
        'style/indent': 'off',
        'style/jsx-closing-tag-location': 'off',
        'style/jsx-one-expression-per-line': 'off',
        'style/no-multiple-empty-lines': 'off',
        // fix style/semi not working in astro file
        ...semi !== undefined
          ? { 'astro/semi': ['error', semi ? 'always' : 'never'] }
          : {},
        ...overrides,
      },
    },
  ]
}
