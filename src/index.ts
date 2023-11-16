import type { ConfigItem, OptionsOverrides, Rules } from '@antfu/eslint-config'
import { antfu } from '@antfu/eslint-config'
import type { Arrayable } from '@subframe7536/type-utils'
import { SolidjsPlugin } from './solid.js'

type AvailableType = 'ts' | 'tsx' | 'vue' | 'vue-tsx' | 'solid'
type RuleOption = 'error' | 'warn' | 'off'
type RuleConfig = RuleOption | [RuleOption, ...any]
type Options = {
  type?: AvailableType
  ignores?: string[]
  rulesOverrideAll?: Partial<Rules & Record<string, RuleConfig>>
  rulesOverrideAntfu?: OptionsOverrides
  extraConfig?: Arrayable<ConfigItem>
}

function isSolid(type: AvailableType): boolean {
  return type === 'solid'
}

function isVueTsx(type: AvailableType): boolean {
  return type === 'vue-tsx'
}

function isJsx(type: AvailableType): boolean {
  return type === 'tsx' || isSolid(type) || isVueTsx(type)
}

export function defineEslintConfig({
  type = 'ts',
  ignores = [],
  rulesOverrideAll,
  rulesOverrideAntfu,
  extraConfig = [],
}: Options = {}) {
  return antfu(
    {
      // vue: isVue(type), auto detect by default
      jsx: isJsx(type),

      linterOptions: {
        noInlineConfig: false,
        reportUnusedDisableDirectives: true,
      },

      stylistic: {
        jsx: isJsx(type),
      },

      rules: {
        // base
        'curly': ['error', 'all'],
        'no-console': 'off',
        'no-sequences': 'off',
        'accessor-pairs': 'off',
        'jsx-quotes': ['error', 'prefer-double'],
        'prefer-const': 'off',
        'prefer-promise-reject-errors': 'off',
        'max-statements-per-line': ['off'],
        'no-unused-vars': 'off',

        // comments
        'eslint-comments/no-unlimited-disable': 'off',

        // styles
        'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],

        ...(isJsx(type)
          ? {
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
                children: false,
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
            }
          : {}),

        // node
        // always use global Buffer
        'node/prefer-global/buffer': ['error', 'always'],
        // always use global process
        'node/prefer-global/process': ['error', 'always'],
      },

      overrides: {
        typescript: {
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
        },
        vue: {
          'vue/component-definition-name-casing': 'off',
          'vue/max-attributes-per-line': ['error', {
            singleline: { max: 2 },
            multiline: { max: 1 },
          }],
          ...(isVueTsx(type)
            ? {
                'vue/no-ref-as-operand': 'off',
              }
            : {}),
        },
        ...rulesOverrideAntfu,
      },
    },
    SolidjsPlugin(isSolid(type)),
    { rules: rulesOverrideAll ?? {} },
    { ignores },
    extraConfig,
  )
}

export type ScriptProps = Pick<
  HTMLScriptElement,
  'defer' | 'crossOrigin' | 'noModule' | 'referrerPolicy' | 'type' | 'async'
>
