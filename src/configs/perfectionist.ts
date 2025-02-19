import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../utils'

/**
 * Perfectionist plugin for props and items sorting.
 *
 * @see https://github.com/azat-io/eslint-plugin-perfectionist
 */
export async function perfectionist(): Promise<TypedFlatConfigItem[]> {
  const pluginPerfectionist = await interopDefault(import('eslint-plugin-perfectionist'))
  return [
    {
      name: 'subf/perfectionist/setup',
      plugins: {
        perfectionist: pluginPerfectionist,
      },
      rules: {
        'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-imports': ['error', {
          groups: [
            ['type', 'parent-type', 'sibling-type', 'index-type', 'internal-type'],
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'side-effect',
            'object',
            'unknown',
          ],
          newlinesBetween: 'always',
          order: 'asc',
          type: 'natural',
        }],
        'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
      },
    },
  ]
}
