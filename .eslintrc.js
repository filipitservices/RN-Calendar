module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // `void somePromise()` is how this project marks a deliberately
    // unawaited promise, so it is allowed as a statement but not as an expression.
    'no-void': ['error', {allowAsStatement: true}],
    // Render props such as `ItemSeparatorComponent` and `tabBarIcon` are the
    // documented API of FlatList and React Navigation; they are not remounted
    // component definitions.
    'react/no-unstable-nested-components': ['error', {allowAsProps: true}],
  },
  ignorePatterns: ['coverage/', 'android/', 'ios/', 'node_modules/'],
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', 'jest.setup.js'],
      env: {jest: true},
    },
    {
      // Type-level assertions are unused by construction: their whole purpose
      // is to fail `tsc` if a type stops holding.
      files: ['**/*.test-d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', {varsIgnorePattern: '^_'}],
      },
    },
  ],
};
