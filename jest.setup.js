/**
 * Component tests inject in-memory service implementations, so native Firebase
 * is never loaded. Only genuinely native-only modules are stubbed.
 */

// The library's mock is a default export, so it has to be unwrapped for the
// named imports (`SafeAreaProvider`, `SafeAreaView`) to resolve.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// MMKV v4 loads Nitro at import time (via getMMKVFactory). In Jest it still
// uses createMockMMKV, but the Nitro import would otherwise look for a native
// TurboModule that does not exist in Node.
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => ({})),
  },
}));
