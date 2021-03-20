module.exports = {
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testEnvironment: 'jsdom',
  verbose: true,
  testURL: 'http://localhost/',
};
