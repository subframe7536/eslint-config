### @subframe7536/eslint-config

self use eslint config, extends [antfu's config](https://github.com/antfu/eslint-config)

### difference

- prefer curly everywhere
- prefer global `Buffer`, `process`
- ignores can start with `./`
- loose some rules
- ignore `solid/reactivity` in `watch()`

### setup

in `eslint.config.js`

```js
import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({ solid: true })
```

types:

```ts
import type { OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config'

type Options = Omit<OptionsConfig, 'overrides'> & {
  /**
   * Enable Solid-js rules
   */
  solid?: boolean
  /**
   * Ignore files
   */
  ignores?: string | string[]
  /**
   * Override all rules
   */
  overrideRules?: TypedFlatConfigItem['rules']
}
```

in `.vscode/settings.json`

```json
{
  // Enable the ESlint flat config support
  "eslint.experimental.useFlatConfig": true,

  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml"
  ]
}
```
