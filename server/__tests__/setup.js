// Global test setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';

// Suppress console logs during tests unless needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(async () => {
  // Restore console output
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  
  // Close any open database connections
  try {
    const db = require('../models');
    if (db.sequelize) {
      await db.sequelize.close();
    }
  } catch (error) {
    // Ignore errors if models aren't loaded
  }
  
  // Give time for async operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

