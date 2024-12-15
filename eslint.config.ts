import subf from './dist/index'

export default subf(
  {
    type: 'lib',
    solid: true,
    typescript: true,
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
