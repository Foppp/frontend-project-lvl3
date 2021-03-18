module.exports = {
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
};
