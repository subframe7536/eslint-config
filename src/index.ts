import type {
  OptionsConfig,
  OptionsTypescript,
  OptionsVue,
  Rules,
  TypedFlatConfigItem,
} from '@antfu/eslint-config'
import { antfu, toArray } from '@antfu/eslint-config'
import type { Linter } from 'eslint'

type Options = Omit<OptionsConfig, 'overrides'> & {
  /**
   * Ignore files
   */
  ignores?: string | string[]
  /**
   * Override all rules
   */
  overrideRules?: TypedFlatConfigItem['rules']
}

export const basicRules: Rules & Linter.RulesRecord = {
  'curly': ['error', 'all'],
  'no-console': 'off',
  'no-sequences': 'off',
  'no-constant-binary-expression': 'error',
  'accessor-pairs': 'off',
  'prefer-const': 'off',
  'prefer-promise-reject-errors': 'off',
  'max-statements-per-line': ['off'],
  'no-unused-vars': 'off',

  // comments
  'eslint-comments/no-unlimited-disable': 'off',

  // styles
  'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],

  'style/jsx-quotes': ['error', 'prefer-double'],
  'style/jsx-child-element-spacing': 'error',
  'style/jsx-closing-bracket-location': ['error', 'line-aligned'],
  'style/jsx-closing-tag-location': 'error',
  'style/jsx-curly-brace-presence': ['error', {
    children: 'never',
    propElementValues: 'always',
    props: 'never',
  }],
  'style/jsx-curly-newline': ['error'],
  'style/jsx-curly-spacing': ['error', {
    when: 'never',
    allowMultiline: false,
    children: true,
  }],
  'style/jsx-equals-spacing': ['error', 'never'],
  'style/jsx-first-prop-new-line': 'error',
  'style/jsx-indent-props': ['error', 2],
  'style/jsx-indent': ['error', 2, {
    checkAttributes: true,
    indentLogicalExpressions: true,
  }],
  'style/jsx-max-props-per-line': ['error', {
    maximum: { multi: 1, single: 2 },
  }],
  'style/jsx-newline': 'off',
  'style/jsx-one-expression-per-line': 'off',
  'style/jsx-props-no-multi-spaces': 'error',
  'style/jsx-sort-props': 'off',
  'style/jsx-tag-spacing': [
    'error',
    {
      afterOpening: 'never',
      beforeClosing: 'never',
      beforeSelfClosing: 'always',
      closingSlash: 'never',
    },
  ],
  'style/jsx-wrap-multilines': ['error', {
    arrow: 'parens-new-line',
    assignment: 'parens-new-line',
    condition: 'parens-new-line',
    declaration: 'parens-new-line',
    logical: 'parens-new-line',
    prop: 'parens-new-line',
    return: 'parens-new-line',
  }],

  // node
  // always use global Buffer
  'node/prefer-global/buffer': ['error', 'always'],
  // always use global process
  'node/prefer-global/process': ['error', 'always'],
}

export const typescriptConfig: OptionsTypescript['overrides'] = {
  'ts/explicit-member-accessibility': 'off',
  'ts/no-unused-vars': 'off',
  'ts/no-namespace': 'off',
  'ts/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  'ts/consistent-type-definitions': ['off'], // whether to force to use interface or type
  'ts/ban-types': [
    'error',
    {
      types: {
        '{}': false,
        'Function': false,
      },
      extendDefaults: true,
    },
  ],
}

export const vueConfig: OptionsVue['overrides'] = {
  'vue/component-definition-name-casing': 'off',
  'vue/max-attributes-per-line': ['error', {
    singleline: { max: 2 },
    multiline: { max: 1 },
  }],
}

export function defineEslintConfig(
  {
    ignores = [],
    overrideRules,
    ...rest
  }: Options = {},
): ReturnType<typeof antfu> {
  // setup override Vue rules

  if (rest.vue === undefined || rest.vue === true) {
    rest.vue = { overrides: vueConfig }
  } else if (rest.vue !== false) {
    rest.vue = {
      ...rest.vue,
      overrides: {
        ...vueConfig,
        ...rest.vue.overrides,
      },
    }
  }

  if (rest.typescript === undefined || rest.typescript === true) {
    rest.typescript = { overrides: typescriptConfig }
  } else if (rest.typescript !== false) {
    rest.typescript = {
      ...rest.typescript,
      overrides: {
        ...typescriptConfig,
        ...rest.typescript.overrides,
      },
    }
  }

  const overrideRulesConfig = overrideRules
    ? { rules: overrideRules } satisfies TypedFlatConfigItem
    : {}

  const ignoreConfig = ignores
    ? {
      ignores: toArray(ignores).map(i => i.startsWith('./') ? i.slice(2) : i),
    } satisfies TypedFlatConfigItem
    : {}

  return antfu({
    name: 'subframe7536/basic/rules',
    ...rest,
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },

    rules: basicRules,
  })
    .append(overrideRulesConfig)
    .append(ignoreConfig)
}

export default defineEslintConfig
