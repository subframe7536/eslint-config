import subf from './src'

export default subf(
  {
    type: 'lib',
    solid: true,
    typescript: true,
    vue: true,
    astro: true,
    overrideRules: {
      'style/max-statements-per-line': 'off',
      'curly': 'off',
      'node/prefer-global/process': 'off',
      'no-constant-binary-expression': 'off',
    },
  },
  {
    ignores: [
      'fixtures',
      '_fixtures',
    ],
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'perfectionist/sort-objects': 'error',
    },
  },
)
