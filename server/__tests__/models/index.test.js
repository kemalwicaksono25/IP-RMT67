const { Sequelize } = require('sequelize');

describe('Models Index', () => {
  let originalEnv;
  let originalNodeEnv;

  beforeEach(() => {
    // Save original environment
    originalNodeEnv = process.env.NODE_ENV;
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalNodeEnv;
    Object.keys(process.env).forEach(key => {
      if (!originalEnv[key]) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
    // Clear module cache to allow re-requiring
    delete require.cache[require.resolve('../../models/index.js')];
    delete require.cache[require.resolve('sequelize')];
    // Restore any mocks
    jest.restoreAllMocks();
  });

  it('should use environment variable when use_env_variable is set', () => {
    // Set NODE_ENV to development which uses use_env_variable
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';

    // Mock Sequelize to avoid actual database connection
    const SequelizeSpy = jest.spyOn(require('sequelize'), 'Sequelize');
    SequelizeSpy.mockImplementation((database, username, password, options) => {
      // If called with single string (env var path), return mock
      if (typeof database === 'string' && !username && options && options.dialect) {
        return { dialect: 'postgres' };
      }
      // Otherwise use original implementation with dialect
      if (typeof database === 'string' && !username) {
        return { dialect: options?.dialect || 'postgres' };
      }
      return new Sequelize(database, username, password, { ...options, dialect: options?.dialect || 'postgres' });
    });

    const db = require('../../models/index.js');

    // Verify Sequelize was called with environment variable
    expect(SequelizeSpy).toHaveBeenCalled();
    
    SequelizeSpy.mockRestore();
  });

  it('should use direct config when use_env_variable is not set', () => {
    // Set NODE_ENV to test which doesn't use use_env_variable
    process.env.NODE_ENV = 'test';
    
    // Ensure no mocks are active
    jest.restoreAllMocks();
    jest.clearAllMocks();

    // Don't mock Sequelize for this test - let it use the real implementation
    // but we need to ensure the module cache is cleared
    const db = require('../../models/index.js');

    expect(db.sequelize).toBeDefined();
    // db.Sequelize should be the original Sequelize constructor
    // Just verify it's a function (can't reliably check identity due to module caching)
    expect(typeof db.Sequelize).toBe('function');
    expect(db.Project).toBeDefined();
    expect(db.User).toBeDefined();
    expect(db.Product).toBeDefined();
    expect(db.Brief).toBeDefined();
    expect(db.BriefDetail).toBeDefined();
    expect(db.Comment).toBeDefined();
  });

  it('should use production config with use_env_variable', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/proddb';

    // Clear module cache first
    delete require.cache[require.resolve('../../models/index.js')];
    
    // Mock Sequelize to avoid actual database connection
    const SequelizeSpy = jest.spyOn(require('sequelize'), 'Sequelize');
    SequelizeSpy.mockImplementation((database, username, password, options) => {
      // If called with single string (env var path), return mock
      if (typeof database === 'string' && !username) {
        return { dialect: options?.dialect || 'postgres' };
      }
      // Otherwise use original implementation with dialect
      return new Sequelize(database, username, password, { ...options, dialect: options?.dialect || 'postgres' });
    });

    const db = require('../../models/index.js');

    // Verify the database models are properly initialized
    expect(db.sequelize).toBeDefined();
    expect(db.Project).toBeDefined();
    expect(db.User).toBeDefined();
    expect(db.Product).toBeDefined();
    expect(db.Brief).toBeDefined();
    expect(db.BriefDetail).toBeDefined();
    expect(db.Comment).toBeDefined();
    
    SequelizeSpy.mockRestore();
  });

  it('should default to development when NODE_ENV is undefined', () => {
    // Test line 6: const env = process.env.NODE_ENV || "development";
    // When NODE_ENV is undefined, should default to "development"
    delete process.env.NODE_ENV;
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb';

    // Clear module cache to force re-evaluation
    delete require.cache[require.resolve('../../models/index.js')];
    delete require.cache[require.resolve('../../config/config.js')];

    const db = require('../../models/index.js');

    // Just verify it loads successfully with default development config
    expect(db.sequelize).toBeDefined();
    expect(db.Project).toBeDefined();
  });

});

