module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/migrations/**',
    '!**/scripts/**',
    '!app.js', // Will test via integration tests
    '!jest.config.js', // Config file, not application code
    '!ecosystem.config.js', // PM2 config file, not application code
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js',
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
};

