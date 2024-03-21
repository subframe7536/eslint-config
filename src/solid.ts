import {
  type FlatConfigItem,
  GLOB_JSX,
  GLOB_TSX,
  ensurePackages,
  interopDefault,
} from '@antfu/eslint-config'

export async function solidPlugin(): Promise<FlatConfigItem[]> {
  await ensurePackages(['eslint-plugin-solid'])
  const solid = await interopDefault(
    import('eslint-plugin-solid/configs/typescript'),
  )
  return [
    {
      name: 'subframe7536:solid:setup',
      plugins: solid.plugins,
    },
    {
      name: 'subframe7536:solid:rules',
      files: [GLOB_JSX, GLOB_TSX],
      // @ts-expect-error ignore
      rules: {
        ...solid.rules,
        'solid/no-react-deps': 'error',
        'solid/no-react-specific-props': 'error',
        'solid/components-return-once': 'error',
        'solid/self-closing-comp': 'error',
        // fix event handler naming
        'solid/event-handlers': ['error', {
        // if true, don't warn on ambiguously named event handlers like `onclick` or `onchange`
          ignoreCase: false,
          // if true, warn when spreading event handlers onto JSX. Enable for Solid < v1.6.
          warnOnSpread: false,
        }],
        // fix solid imports names
        'solid/imports': 'error',
        // enforce kebab-case in style
        'solid/style-prop': ['error', { styleProps: ['style', 'css'] }],
      },
    },
  ]
}
