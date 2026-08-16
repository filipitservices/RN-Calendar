module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // React Navigation 7, MMKV, Nitro, and related native modules ship
  // untranspiled ESM, so they must be transformed rather than skipped.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-mmkv|react-native-nitro-modules|react-native-keychain|react-native-svg|lucide-react-native)/)',
  ],
  // Ship code and test helpers only; index/config files contain no logic worth measuring.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    // Type-level assertions; checked by `npm run typecheck`, no runtime to cover.
    '!src/**/*.test-d.ts',
    '!src/**/index.ts',
    '!src/app/services.ts',
    '!src/testing/**',
    // Native Firebase adapters: exercised on device, not in Jest.
    '!src/services/auth/firebaseAuthService.ts',
    '!src/services/events/firestoreEventService.ts',
    '!src/services/storage/keychainSecureCredentialStore.ts',
  ],
  // Thresholds sit just below the current numbers, so the suite fails on a
  // regression rather than being a target to game. Note that Jest excludes
  // files matched by a path threshold from the global group, so `global` here
  // covers everything *except* `src/domain`.
  coverageThreshold: {
    global: {
      statements: 84,
      branches: 72,
      functions: 82,
      lines: 84,
    },
    // The domain layer is pure and cheap to test, so it is held to a far
    // higher bar than the UI.
    'src/domain/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
};
