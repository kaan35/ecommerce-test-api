import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
  },
  {
    ignores: ['**/node_modules/*', '**/dist/*', '**/tests/*', 'tsconfig.json'],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslintConfigPrettier,
  eslintPluginPrettier,
  pluginJs.configs.recommended,
  {
    rules: {
      'arrow-body-style': 'warn',
      'no-duplicate-imports': ['error', { includeExports: true }],
      'no-undef': 'warn',
      'no-unused-vars': 'warn',
      // 'require-await': 'warn',
      // 'sort-keys': 'warn',
      'sort-vars': 'warn',
    },
  },
];
