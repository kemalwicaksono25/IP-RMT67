const { app } = require('../../app');
const db = require('../../models');

// Mock database models
jest.mock('../../models', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
  };

  return {
    sequelize: mockSequelize,
  User: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Test User',
      project: { id: 1, name: 'Test Project' },
    }),
  },
  Project: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
    Product: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    Project: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    Brief: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    BriefDetail: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    Comment: {
      findOne: jest.fn(),
      findAll: jest.fn(),
    },
  };
});

// Mock AIService
jest.mock('../../services/aiService', () => ({
  generatePGG: jest.fn(),
  generateBrief: jest.fn(),
  generateDetail: jest.fn(),
}));

// Mock uploadService
jest.mock('../../services/uploadService', () => {
  const multer = require('multer');
  const memoryStorage = multer.memoryStorage();
  return multer({ storage: memoryStorage });
});

// Mock JWT - need to handle token extraction from Bearer header
const jwt = require('../../helpers/jwt');
jest.mock('../../helpers/jwt', () => ({
  generateToken: jest.fn((payload) => `mock_token_${payload.id}`),
  verifyToken: jest.fn((token) => {
    // Extract token from "Bearer token" format
    const actualToken = typeof token === 'string' ? token.split(' ')[1] || token : token;
    if (actualToken === 'valid_token' || actualToken.startsWith('mock_token_')) {
      return { id: 1, email: 'test@example.com', role: 'admin', ProjectId: 1, name: 'Test User' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock bcrypt
jest.mock('../../helpers/bcrypt', () => ({
  hashPassword: jest.fn((password) => `hashed_${password}`),
  comparePassword: jest.fn((password, hash) => {
    return hash === `hashed_${password}` || hash === 'hashed_password';
  }),
}));

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: jest.fn().mockReturnValue({
        email: 'google@example.com',
        name: 'Google User',
      }),
    }),
  })),
}));

module.exports = { app, db };

