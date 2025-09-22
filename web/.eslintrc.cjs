/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: false,
  },
  env: { es2022: true, browser: true, node: true },
  extends: [
    'next/core-web-vitals',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'eslint-config-prettier', // turn off rules that conflict with Prettier
  ],
  plugins: ['@typescript-eslint', 'unused-imports', 'import'],
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
      node: { extensions: ['.ts', '.tsx', '.js', '.mjs'] },
    },
  },
  rules: {
    // Unused imports/vars
    'unused-imports/no-unused-imports': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Import hygiene
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'error',

    // Quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
  },
  overrides: [
    // Allow devDeps in config, scripts, and tooling
    {
      files: [
        '**/*.config.{js,cjs,mjs,ts}',
        'scripts/**/*.{js,mjs,ts}',
        'postcss.config.cjs',
        'tailwind.config.{js,ts}',
      ],
      rules: { 'import/no-extraneous-dependencies': 'off' },
    },
  ],
};
