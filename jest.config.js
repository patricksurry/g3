export default {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  "testPathIgnorePatterns": [
    "\\.render\\.test\\.js$"
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.html',
    '!src/contrib/**'
  ],
  transform: {}
};
