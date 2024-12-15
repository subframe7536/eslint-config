// @ts-expect-error missing types
import styleMigrate from '@stylistic/eslint-plugin-migrate'

// eslint-disable-next-line antfu/no-import-dist
import subf from './dist/index'

export default subf(
  {
    type: 'lib',
    solid: true,
    typescript: true,
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
  {
    files: ['src/configs/*.ts'],
    plugins: {
      'style-migrate': styleMigrate,
    },
    rules: {
      'style-migrate/migrate': ['error', { namespaceTo: 'style' }],
    },
  },
)
