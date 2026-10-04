module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  overrides: [
    {
      files: ['libs/features/*/src/{domain,application}/**/*.ts'],
      excludedFiles: ['**/*.spec.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            '@nestjs/*', '**/infrastructure/**', '**/presentation/**', '**/modules/**',
            'fs', 'fs/*', 'node:fs', 'node:fs/*',
          ],
        }],
      },
    },
    {
      files: ['libs/features/*/src/domain/**/*.ts'],
      excludedFiles: ['**/*.spec.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            '@nestjs/*', '**/application/**', '**/infrastructure/**',
            '**/presentation/**', '**/modules/**', '**/tokens/**',
            'fs', 'fs/*', 'node:fs', 'node:fs/*',
          ],
        }],
      },
    },
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
