/* eslint-disable antfu/no-import-dist */
import { defineEslintConfig } from './dist/index.js'

export default defineEslintConfig({
  ignoreRulesOnFiles: {
    files: ['README.md/*.{ts,tsx}', 'playground/**.*'],
    rules: ['ts/explicit-function-return-type'],
  },
  overrideRules: {
    'node/prefer-global/buffer': ['error', 'always'],
  },
})
