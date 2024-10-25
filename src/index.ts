import type {
  OptionsConfig,
  OptionsOverrides,
  OptionsTypescript,
  OptionsVue,
  Rules,
  TypedFlatConfigItem,
} from '@antfu/eslint-config'
import type { Linter } from 'eslint'
import { antfu, GLOB_ASTRO, toArray } from '@antfu/eslint-config'
import { isPackageExists } from 'local-pkg'

type Arrayable<T> = T | T[]

type Options = Omit<OptionsConfig, 'overrides'> & Omit<TypedFlatConfigItem, 'files'> & {
  /**
   * project type
   * @default 'lib'
   */
  type?: 'app' | 'lib'
  /**
   * @deprecated use `ignores` instead
   * Ignore files
   */
  ignoreAll?: Arrayable<string>
  /**
   * Ignore target rules on target files
   * @example
   * export default defineEslintConfig({
   *   ignoreRulesOnFiles: {
   *     files: [GLOB_MARKDOWN_CODE],
   *     rules: ['ts/explicit-function-return-type'],
   *   },
   * })
   */
  ignoreRuleOnFile?: Arrayable<{
    /**
     * You can use `GLOB_MARKDOWN_CODE` and other predefined globs
     */
    files: Arrayable<string>
    rules: Arrayable<keyof Rules>
  }>
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

  // prevent antfu's rule
  'antfu/no-top-level-await': 'off',

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
  'ts/consistent-type-definitions': ['off'], // whether to force to use interface or type
  'ts/no-empty-function': 'off',
  'ts/no-empty-object-type': 'off',
}

export const typeAwareConfig: OptionsTypescript['overrides'] = {
  'ts/return-await': ['error', 'always'],
  'ts/no-unsafe-return': 'off',
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
    type = 'lib',
    ignoreAll,
    ignoreRuleOnFile,
    overrideRules,
    solid = isPackageExists('solid-js'),
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

  if (solid === true) {
    solid = { overrides: solidConfig }
  } else if (solid !== false) {
    solid = {
      ...solid,
      overrides: {
        ...solidConfig,
        ...solid.overrides,
      },
    }
  }

  const overrideRulesConfig = overrideRules
    ? {
      name: 'subframe7536/override',
      rules: overrideRules,
    } satisfies TypedFlatConfigItem
    : {}

  const ignoreAllConfig = ignoreAll
    ? {
      name: 'subframe7536/ignore',
      ignores: toArray(ignoreAll).map(i => i.startsWith('./') ? i.slice(2) : i),
    } satisfies TypedFlatConfigItem
    : {}

  const ignoreRulesOnFilesConfig: TypedFlatConfigItem[] = []
  if (ignoreRuleOnFile) {
    for (const [i, conf] of Object.entries(toArray(ignoreRuleOnFile))) {
      ignoreRulesOnFilesConfig.push({
        name: `subframe7536/ignore-rules-on-files-${i}`,
        files: toArray(conf.files).map(i => i.startsWith('./') ? i.slice(2) : i),
        rules: Object.fromEntries(toArray(conf.rules).map(r => [r, 'off'])),
      })
    }
  }

  const finalConfig = antfu({
    name: 'subframe7536/rules',
    type,
    solid,
    ...rest,
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
      ...rest.linterOptions,
    },

    rules: {
      ...basicRules,
      ...rest.rules,
    },
  })
  if (rest.astro) {
    finalConfig.append({
      files: [GLOB_ASTRO],
      rules: {
        'style/jsx-one-expression-per-line': 'off',
      },
    })
  }
  if (overrideRules) {
    finalConfig.append(overrideRulesConfig)
  }
  if (ignoreRulesOnFilesConfig.length) {
    finalConfig.append(...ignoreRulesOnFilesConfig)
  }
  if (ignoreAll) {
    finalConfig.append(ignoreAllConfig)
  }
  return finalConfig
}

export default defineEslintConfig

export {
  GLOB_ALL_SRC,
  GLOB_ASTRO,
  GLOB_ASTRO_TS,
  GLOB_CSS,
  GLOB_EXCLUDE,
  GLOB_GRAPHQL,
  GLOB_HTML,
  GLOB_JS,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_JSX,
  GLOB_LESS,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_CODE,
  GLOB_MARKDOWN_IN_MARKDOWN,
  GLOB_POSTCSS,
  GLOB_SCSS,
  GLOB_SRC,
  GLOB_SRC_EXT,
  GLOB_STYLE,
  GLOB_SVELTE,
  GLOB_SVG,
  GLOB_TESTS,
  GLOB_TOML,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
  GLOB_XML,
  GLOB_YAML,
} from '@antfu/eslint-config'
