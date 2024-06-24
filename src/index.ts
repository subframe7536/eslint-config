import type {
  OptionsConfig,
  OptionsOverrides,
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
  'style/jsx-one-expression-per-line': ['error', { allow: 'single-line' }],

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

export function defineEslintConfig(
  {
    ignores = [],
    overrideRules,
    ...rest
  }: Options = {},
): ReturnType<typeof antfu> {
  // setup override Vue rules

  if (rest.vue === true) {
    rest.vue = { overrides: vueConfig }
  } else if (rest.vue !== undefined && rest.vue !== false) {
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

  if (rest.solid === true) {
    rest.solid = { overrides: solidConfig }
  } else if (rest.solid !== undefined && rest.solid !== false) {
    rest.solid = {
      ...rest.solid,
      overrides: {
        ...solidConfig,
        ...rest.solid.overrides,
      },
    }
  }

  const overrideRulesConfig = overrideRules
    ? { name: 'subframe7536/override', rules: overrideRules } satisfies TypedFlatConfigItem
    : {}

  const ignoreConfig = ignores
    ? {
      name: 'subframe7536/ignore',
      ignores: toArray(ignores).map(i => i.startsWith('./') ? i.slice(2) : i),
    } satisfies TypedFlatConfigItem
    : {}

  return antfu({
    name: 'subframe7536/rules',
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
