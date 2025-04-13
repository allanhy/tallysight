module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  reporters: [
    "default",
    ["./node_modules/jest-html-reporter", {
      pageTitle: "Test Report: TallySight",
      includeFailureMsg: true,
      invludeConsoleLog: true,
      sort: 'titleAsc'
    }]
  ]
}; 