/**
 * Component tests inject in-memory service implementations, so no storage
 * mock is needed here. Only genuinely native-only modules are stubbed.
 */

// The library's mock is a default export, so it has to be unwrapped for the
// named imports (`SafeAreaProvider`, `SafeAreaView`) to resolve.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
