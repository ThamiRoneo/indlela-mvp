module.exports = {
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.(ts|tsx|js|jsx)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', {}],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/tests/mocks/react-native.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/tests/mocks/async-storage.js',
    '^@react-native-community/netinfo$': '<rootDir>/tests/mocks/netinfo.js',
  },
  setupFiles: ['<rootDir>/tests/integration/setup.ts'],
  testTimeout: 30000,
};
