/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  // SDK 57 installs expo-modules-core under the expo package. Let Jest resolve
  // that nested runtime exactly as Metro does without duplicating the native module.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules/expo/node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
