import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginPromise from 'eslint-plugin-promise';
import pluginReact from 'eslint-plugin-react';
import tailwind from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
  { files: ['**/*.{ts,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...tailwind.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginPromise.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    rules: {
      'react/prop-types': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-function': ['error'],
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': 'error',
    },
  },
  {
    ignores: ['dist/*', 'src-tauri/target', '*.config.*js'],
  },
];
