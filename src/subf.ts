import type { Linter } from 'eslint'
import type { OptionsOverrides, OptionsTypescript, OptionsVue, Rules } from 'src/types'

export const basicRules: Rules & Linter.RulesRecord = {
  'accessor-pairs': 'off',
  'curly': ['error', 'all'],
  'eslint-comments/no-unlimited-disable': 'off',
  'max-statements-per-line': ['off'],
  'no-console': 'off',
  'no-constant-binary-expression': 'error',
  'no-sequences': 'off',
  'no-unused-vars': 'off',
  'prefer-const': 'off',
  'prefer-promise-reject-errors': 'off',
}
export const preventAntfuRules: Rules & Linter.RulesRecord = {
  'antfu/no-import-dist': 'off',
  'antfu/no-top-level-await': 'off',
}
export const nodeRules: Rules & Linter.RulesRecord = {
  // always use global Buffer
  'node/prefer-global/buffer': ['error', 'always'],
  // always use global process
  'node/prefer-global/process': ['error', 'always'],
}

export const styleRules: Rules & Linter.RulesRecord = {
  'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],
  'style/jsx-one-expression-per-line': ['error', { allow: 'single-line' }],
}

export const typescriptConfig: OptionsTypescript['overrides'] = {
  'ts/consistent-type-definitions': ['off'], // whether to force to use interface or type
  'ts/explicit-member-accessibility': 'off',
  'ts/no-empty-function': 'off',
  'ts/no-empty-object-type': 'off',
  'ts/no-namespace': 'off',
  'ts/no-unused-vars': 'off',
}

export const typeAwareConfig: OptionsTypescript['overrides'] = {
  'ts/no-unsafe-return': 'off',
  'ts/return-await': ['error', 'always'],
}

export const vueConfig: OptionsVue['overrides'] = {
  'vue/component-definition-name-casing': 'off',
  'vue/max-attributes-per-line': ['error', {
    multiline: { max: 1 },
    singleline: { max: 2 },
  }],
}

export const solidConfig: OptionsOverrides['overrides'] = {
  'solid/reactivity': [
    'warn',
    {
      customReactiveFunctions: [
        'watch',
        'watchOnce',
        'watchRendered',
        'watchInstant',
      ],
    },
  ],
}
