### @subframe7536/eslint-config

self use eslint config, extends [antfu's config](https://github.com/antfu/eslint-config)

### difference

- add [solid-js](https://github.com/solidjs/solid) support
- prefer curly
- prefer global `Buffer`, `process`
- loose some rules

### setup

in `eslint.config.js`

```js
import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({ type: 'solid' })
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
    "source.fixAll.eslint": true,
    "source.organizeImports": false
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