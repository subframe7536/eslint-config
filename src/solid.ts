import { type ConfigItem, GLOB_JSX, GLOB_TSX } from '@antfu/eslint-config'

// @ts-expect-error no dts
import solid from 'eslint-plugin-solid/dist/configs/typescript.js'

export function SolidjsPlugin(is: boolean): ConfigItem | {} {
  return is
    ? ({
        files: [GLOB_JSX, GLOB_TSX],
        ...solid,
        rules: {
          ...solid.rules,
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
      })
    : {}
}
