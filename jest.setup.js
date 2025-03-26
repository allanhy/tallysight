// Jest setup file

// Extend the timeout for all tests (useful for tests that might take longer)
jest.setTimeout(30000);

// Add global mocks if needed
// For example, if you want to mock fetch:
// global.fetch = jest.fn();

// You can add custom matchers
// expect.extend({
//   yourCustomMatcher(received, expected) {
//     // Implementation
//   }
// });

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Add any other global setup you might need for your tests
console.log('Jest setup file loaded successfully'); 