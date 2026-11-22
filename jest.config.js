module.exports = {
  roots: ['<rootDir>/tests/unit', '<rootDir>/tests/components'],
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
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/tests/mocks/react-native.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/tests/mocks/async-storage.js',
    '^@react-native-community/netinfo$': '<rootDir>/tests/mocks/netinfo.js',
    '^@supabase/supabase-js$': '<rootDir>/tests/mocks/supabase.js',
    '^lucide-react-native$': '<rootDir>/tests/mocks/lucide-react-native.js',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};
