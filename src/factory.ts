import type { Linter } from 'eslint'
import type { RuleOptions } from './typegen'

import type { Arrayable, Awaitable, OptionsConfig, TypedFlatConfigItem } from './types'
import { isPackageExists } from 'local-pkg'
import {
  astro,
  command,
  comments,
  disables,
  ignores,
  imports,
  javascript,
  jsdoc,
  jsonc,
  jsx,
  markdown,
  node,
  perfectionist,
  react,
  solid,
  sortPackageJson,
  sortTsconfig,
  stylistic,
  svelte,
  test,
  toml,
  typescript,
  unicorn,
  unocss,
  vue,
  yaml,
} from './configs'
import { formatters } from './configs/formatters'

import { regexp } from './configs/regexp'
import { basicRules, nodeRules, preventAntfuRules, solidConfig, styleRules, typeAwareConfig, typescriptConfig, vueConfig } from './subf'
import { interopDefault, isInEditorEnv, toArray, toConfigs } from './utils'

const flatConfigProps = [
  'name',
  'languageOptions',
  'linterOptions',
  'processor',
  'plugins',
  'rules',
  'settings',
] satisfies (keyof TypedFlatConfigItem)[]

export const defaultPluginRenaming = {
  '@eslint-react': 'react',
  '@eslint-react/dom': 'react-dom',
  '@eslint-react/hooks-extra': 'react-hooks-extra',
  '@eslint-react/naming-convention': 'react-naming-convention',

  '@stylistic': 'style',
  '@typescript-eslint': 'ts',
  'import-x': 'import',
  'n': 'node',
  'vitest': 'test',
  'yml': 'yaml',
}

const VuePackages = [
  'vue',
  'nuxt',
  'vitepress',
  '@slidev/cli',
]

const SolidPackages = [
  'solid-js',
  '@solidjs/start',
]
let isShown = false
let oldSignature: string | undefined
let result: TypedFlatConfigItem[]
/**
 * Construct an array of ESLint flat config items.
 *
 * @param {OptionsConfig & TypedFlatConfigItem} options
 *  The options for generating the ESLint configurations.
 * @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs
 *  The user configurations to be merged with the generated configurations.
 * @returns {Promise<TypedFlatConfigItem[]>}
 *  The merged ESLint configurations.
 */
export function defineEslintConfig(
  options: OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'> = {},
  ...userConfigs: Awaitable<Arrayable<TypedFlatConfigItem> | Linter.Config[]>[]
): Awaitable<TypedFlatConfigItem[]> {
  const sig = JSON.stringify({ options, ...userConfigs })
  if (oldSignature === sig) {
    return result
  }
  oldSignature = sig
  const {
    astro: enableAstro = isPackageExists('astro'),
    autoRenamePlugins = true,
    componentExts = [],
    gitignore: enableGitignore = true,
    jsx: enableJsx = true,
    react: enableReact = isPackageExists('react'),
    regexp: enableRegexp = true,
    solid: enableSolid = SolidPackages.some(i => isPackageExists(i)),
    svelte: enableSvelte = isPackageExists('svelte'),
    typescript: enableTypeScript = true,
    unicorn: enableUnicorn = true,
    unocss: enableUnoCSS = false,
    vue: enableVue = VuePackages.some(i => isPackageExists(i)),
  } = options

  let isInEditor = options.isInEditor
  if (isInEditor == null) {
    isInEditor = isInEditorEnv()
    if (isInEditor && !isShown) {
      console.log('[@subframe7536/eslint-config] Detected running in editor, some rules are disabled.')
      isShown = true
    }
  }

  const stylisticOptions = options.stylistic === false
    ? false
    : typeof options.stylistic === 'object'
      ? options.stylistic
      : {}

  if (stylisticOptions && !('jsx' in stylisticOptions))
    stylisticOptions.jsx = enableJsx

  const configs: Awaitable<TypedFlatConfigItem[]>[] = []

  if (enableGitignore) {
    configs.push(
      interopDefault(import('eslint-config-flat-gitignore'))
        .then(r => [
          r({
            name: 'antfu/gitignore',
            ...typeof enableGitignore !== 'boolean'
              ? enableGitignore
              : { strict: false },
          }),
        ]),
    )
  }

  const typescriptOptions = resolveSubOptions(options, 'typescript')
  const tsconfigPath = 'tsconfigPath' in typescriptOptions ? typescriptOptions.tsconfigPath : undefined

  // Base configs
  configs.push(
    ignores(),
    javascript({
      isInEditor,
      overrides: getOverrides(options, 'javascript'),
    }),
    comments(),
    node(),
    jsdoc({
      stylistic: stylisticOptions,
    }),
    imports({
      stylistic: stylisticOptions,
    }),
    command(),

    // Optional plugins (installed but not enabled by default)
    perfectionist(),
  )

  if (enableUnicorn) {
    configs.push(unicorn(enableUnicorn === true ? {} : enableUnicorn))
  }

  if (enableVue) {
    componentExts.push('vue')
  }

  if (enableJsx) {
    configs.push(jsx())
  }

  if (enableTypeScript) {
    configs.push(typescript({
      ...typescriptOptions,
      componentExts,
      overrides: getOverrides(
        options,
        'typescript',
        { ...typescriptConfig, ...tsconfigPath ? typeAwareConfig : {} },
      ),
      type: options.type ?? ((enableReact || enableSolid || enableVue) ? 'app' : 'lib'),
    }))
  }

  if (stylisticOptions) {
    configs.push(stylistic({
      ...stylisticOptions,
      lessOpinionated: options.lessOpinionated,
      overrides: getOverrides(options, 'stylistic', styleRules),
    }))
  }

  if (enableRegexp) {
    configs.push(regexp(typeof enableRegexp === 'boolean' ? {} : enableRegexp))
  }

  if (options.test ?? true) {
    configs.push(test({
      isInEditor,
      overrides: getOverrides(options, 'test'),
    }))
  }

  if (enableVue) {
    configs.push(vue({
      ...resolveSubOptions(options, 'vue'),
      overrides: getOverrides(options, 'vue', vueConfig),
      stylistic: stylisticOptions,
      typescript: !!enableTypeScript,
    }))
  }

  if (enableReact) {
    configs.push(react({
      ...typescriptOptions,
      overrides: getOverrides(options, 'react'),
      tsconfigPath,
    }))
  }

  if (enableSolid) {
    configs.push(solid({
      overrides: getOverrides(options, 'solid', solidConfig),
      tsconfigPath,
      typescript: !!enableTypeScript,
    }))
  }

  if (enableSvelte) {
    configs.push(svelte({
      overrides: getOverrides(options, 'svelte'),
      stylistic: stylisticOptions,
      typescript: !!enableTypeScript,
    }))
  }

  if (enableUnoCSS) {
    configs.push(unocss({
      ...resolveSubOptions(options, 'unocss'),
      overrides: getOverrides(options, 'unocss'),
    }))
  }

  if (enableAstro) {
    configs.push(astro({
      overrides: getOverrides(options, 'astro'),
      stylistic: stylisticOptions,
    }))
  }

  if (options.jsonc ?? true) {
    configs.push(
      jsonc({
        overrides: getOverrides(options, 'jsonc'),
        stylistic: stylisticOptions,
      }),
      sortPackageJson(),
      sortTsconfig(),
    )
  }

  if (options.yaml ?? true) {
    configs.push(yaml({
      overrides: getOverrides(options, 'yaml'),
      stylistic: stylisticOptions,
    }))
  }

  if (options.toml ?? true) {
    configs.push(toml({
      overrides: getOverrides(options, 'toml'),
      stylistic: stylisticOptions,
    }))
  }

  if (options.markdown ?? true) {
    configs.push(
      markdown(
        {
          componentExts,
          overrides: getOverrides(options, 'markdown'),
        },
      ),
    )
  }

  if (options.formatters) {
    configs.push(formatters(
      options.formatters,
      typeof stylisticOptions === 'boolean' ? {} : stylisticOptions,
    ))
  }

  configs.push(
    disables(),
    [{
      name: 'subf/basic/rules',
      rules: {
        ...basicRules,
        ...preventAntfuRules,
        ...nodeRules,
      },
    }],
  )

  if (options.overrideRules) {
    configs.push([
      {
        name: 'subf/override/all',
        rules: options.overrideRules,
      },
    ])
  }

  if (options.ignoreRuleOnFile) {
    configs.push(
      Object.entries(toArray(options.ignoreRuleOnFile))
        .map(([i, conf]) => ({
          files: toArray(conf.files).map(i => i.startsWith('./') ? i.slice(2) : i),
          name: `subf/ignore/rules-on-files-${i}`,
          rules: Object.fromEntries(toArray(conf.rules).map(r => [r, 'off'])),
        })),
    )
  }

  if (options.ignoreAll) {
    configs.push([
      {
        ignores: toArray(options.ignoreAll).map(i => i.startsWith('./') ? i.slice(2) : i),
        name: 'subf/ignore/all',
      },
    ])
  }

  if ('files' in options) {
    throw new Error('[@subframe7536/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.')
  }

  // User can optionally pass a flat config item to the first argument
  // We pick the known keys as ESLint would do schema validation
  const fusedConfig = flatConfigProps.reduce((acc, key) => {
    if (key in options)
      acc[key] = options[key] as any
    return acc
  }, {} as TypedFlatConfigItem)
  if (Object.keys(fusedConfig).length)
    configs.push([fusedConfig])

  return toConfigs(
    [...configs, ...userConfigs as any],
    autoRenamePlugins ? defaultPluginRenaming : undefined,
  ).then(data => result = data)
}

export type ResolvedOptions<T> = T extends boolean
  ? never
  : NonNullable<T>

export function resolveSubOptions<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K,
): ResolvedOptions<OptionsConfig[K]> {
  return typeof options[key] === 'boolean'
    ? {} as any
    : options[key] || {}
}

export function getOverrides<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K,
  extraRules?: TypedFlatConfigItem['rules'],
): Partial<Linter.RulesRecord & RuleOptions> {
  const sub = resolveSubOptions(options, key)
  return {
    ...extraRules,
    ...'overrides' in sub ? { ...sub.overrides as any } : {},
  }
}
