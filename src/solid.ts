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
    // @ts-expect-error no dts
    import('eslint-plugin-solid'),
  )
  return [
    {
      name: 'subframe7536:solid:setup',
      plugins: { solid },
    },
    {
      name: 'subframe7536:solid:rules',
      files: [GLOB_JSX, GLOB_TSX],
      rules: {
        ...solid.configs.typescript.rules,
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
