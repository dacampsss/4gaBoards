const reactHooks = require('eslint-plugin-react-hooks');
const reactPlugin = require('eslint-plugin-react');
const jsxPlugin = require('eslint-plugin-jsx-a11y');
const babelEslintParser = require('@babel/eslint-parser');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const baseConfig = require('../eslint-configs/base');
const clientConfig = require('../eslint-configs/client');

module.exports = [
  ...baseConfig,
  ...clientConfig,
  {
    ignores: ['node_modules', 'public', 'build'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelEslintParser,
      parserOptions: {
        babelOptions: {
          presets: ['@babel/preset-react', ['babel-preset-react-app', false]],
        },
        ecmaFeatures: {
          jsx: true,
          generators: false,
          objectLiteralDuplicateProperties: false,
        },
        requireConfigFile: false,
      },
      // Using only limited globals to avoid long import/no-cycle times - should be using full sets
      globals: {
        // From ...globals.node, ...globals.es6, _: true, sails: true
        require: false,
        module: false,
        process: false,
        Buffer: false,
        __filename: false,
        console: false,
        FormData: false,
        setTimeout: false,
        clearTimeout: false,
        File: false,
        URLSearchParams: false,
        fetch: false,
        setInterval: false,
        clearInterval: false,
        // From ...globals.browser
        window: false,
        document: false,
        getComputedStyle: false,
        localStorage: false,
        IntersectionObserver: false,
        // From ...globals.jest
        describe: false,
        test: false,
        expect: false,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react: reactPlugin,
      prettier: prettierPlugin,
      'jsx-a11y': jsxPlugin,
    },
    rules: {
      // region react reactPlugin.configs.flat.recommended
      // endregion
      // region jsx-a11y jsxPlugin.flatConfigs.recommended
      'jsx-a11y/anchor-ambiguous-text': 'off',
      // endregion
      // region react-hooks reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // endregion
      // region prettier
      ...prettierPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      // endregion
      // region custom
      'no-unused-vars': 'warn',
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          warnOnDuplicates: true,
        },
      ],
      // endregion
    },
  },
];
