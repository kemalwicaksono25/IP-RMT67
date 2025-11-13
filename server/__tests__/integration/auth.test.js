const request = require('supertest');
const { app, db } = require('./setup');
const jwt = require('../../helpers/jwt');
const bcrypt = require('../../helpers/bcrypt');
const { USER_ROLE } = require('../../helpers/enums');

describe('Auth Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockProject = { id: 1, name: 'Test Project' };
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: USER_ROLE.ADMIN,
        ProjectId: 1,
      };

      db.User.findOne.mockResolvedValue(null);
      db.Project.create.mockResolvedValue(mockProject);
      db.User.create.mockResolvedValue(mockUser);
      jwt.generateToken.mockReturnValue('mock_token');

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          projectName: 'Test Project',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 400 when email already exists', async () => {
      const existingUser = { id: 1, email: 'existing@example.com' };
      db.User.findOne.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          projectName: 'Test Project',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email sudah terdaftar');
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const mockProject = { id: 1, name: 'Test Project' };
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: USER_ROLE.ADMIN,
        ProjectId: 1,
        project: mockProject,
      };

      db.User.findOne.mockResolvedValue(mockUser);
      bcrypt.comparePassword.mockReturnValue(true);
      jwt.generateToken.mockReturnValue('mock_token');

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 when credentials are invalid', async () => {
      db.User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Email atau password salah');
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login/google', () => {
    it('should login with Google successfully', async () => {
      const mockProject = { id: 1, name: "Google User's Project" };
      const mockUser = {
        id: 1,
        name: 'Google User',
        email: 'google@example.com',
        role: USER_ROLE.ADMIN,
        ProjectId: 1,
        project: mockProject,
        reload: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Google User',
          email: 'google@example.com',
          role: USER_ROLE.ADMIN,
          ProjectId: 1,
          project: mockProject,
        }),
      };

      // Mock OAuth2Client
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: 'google@example.com',
          name: 'Google User',
        }),
      };
      const mockClient = {
        verifyIdToken: jest.fn().mockResolvedValue(mockTicket),
      };
      jest.spyOn(require('google-auth-library'), 'OAuth2Client').mockImplementation(() => mockClient);

      db.User.findOne.mockResolvedValue(mockUser);
      jwt.generateToken.mockReturnValue('mock_token');

      const response = await request(app)
        .post('/auth/login/google')
        .send({
          googleAccessToken: 'google_token_123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 400 when googleAccessToken is missing', async () => {
      const response = await request(app)
        .post('/auth/login/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Google access token diperlukan');
    });

    it('should create new user when Google login with new email', async () => {
      const { OAuth2Client } = require('google-auth-library');
      const mockProject = { id: 2, name: "New User's Project" };
      const mockNewUser = {
        id: 2,
        name: 'New User',
        email: 'newuser@example.com',
        role: USER_ROLE.ADMIN,
        ProjectId: 2,
        reload: jest.fn().mockResolvedValue({
          id: 2,
          name: 'New User',
          email: 'newuser@example.com',
          role: USER_ROLE.ADMIN,
          ProjectId: 2,
          project: mockProject,
        }),
      };

      db.User.findOne.mockResolvedValue(null);
      db.Project.create.mockResolvedValue(mockProject);
      db.User.create.mockResolvedValue(mockNewUser);
      jwt.generateToken.mockReturnValue('mock_token');

      // Mock OAuth2Client
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: 'newuser@example.com',
          name: 'New User',
        }),
      };
      const mockClient = {
        verifyIdToken: jest.fn().mockResolvedValue(mockTicket),
      };
      jest.spyOn(require('google-auth-library'), 'OAuth2Client').mockImplementation(() => mockClient);

      const response = await request(app)
        .post('/auth/login/google')
        .send({
          googleAccessToken: 'google_token_123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(db.Project.create).toHaveBeenCalled();
      expect(db.User.create).toHaveBeenCalled();
    });

    it('should return 400 when Google payload has no email', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          name: 'User Without Email',
        }),
      };
      const mockClient = {
        verifyIdToken: jest.fn().mockResolvedValue(mockTicket),
      };
      jest.spyOn(require('google-auth-library'), 'OAuth2Client').mockImplementation(() => mockClient);

      const response = await request(app)
        .post('/auth/login/google')
        .send({
          googleAccessToken: 'google_token_123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email tidak ditemukan dari Google account');
    });

    it('should return 401 when Google token is invalid', async () => {
      const mockClient = {
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
      };
      jest.spyOn(require('google-auth-library'), 'OAuth2Client').mockImplementation(() => mockClient);

      const response = await request(app)
        .post('/auth/login/google')
        .send({
          googleAccessToken: 'invalid_token',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token Google tidak valid');
    });
  });

  describe('POST /auth/staff/add', () => {
    it('should add staff successfully', async () => {
      const mockStaff = {
        id: 2,
        name: 'Staff User',
        email: 'staff@example.com',
        role: USER_ROLE.STAFF,
        ProjectId: 1,
      };

      const mockAdminUser = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        ProjectId: 1,
      };

      // Mock for authentication middleware (uses findByPk)
      db.User.findByPk.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        ProjectId: 1,
        name: 'Admin User',
        project: { id: 1, name: 'Test Project' },
      });
      // Mock for checking existing staff
      db.User.findOne.mockResolvedValue(null);
      db.User.create.mockResolvedValue(mockStaff);
      jwt.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        ProjectId: 1,
        name: 'Admin User',
      });

      const response = await request(app)
        .post('/auth/staff/add')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'Staff User',
          email: 'staff@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('staff@example.com');
      expect(response.body.role).toBe(USER_ROLE.STAFF);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/auth/staff/add')
        .send({
          name: 'Staff User',
          email: 'staff@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });

    it('should return 403 when not admin', async () => {
      // Mock for authentication middleware (uses findByPk)
      db.User.findByPk.mockResolvedValue({
        id: 1,
        email: 'staff@example.com',
        role: 'staff',
        ProjectId: 1,
        name: 'Staff User',
        project: { id: 1, name: 'Test Project' },
      });
      jwt.verifyToken.mockReturnValue({
        id: 1,
        email: 'staff@example.com',
        role: 'staff',
        ProjectId: 1,
        name: 'Staff User',
      });

      const response = await request(app)
        .post('/auth/staff/add')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'Staff User',
          email: 'staff@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(403);
    });

    it('should return 400 when email already exists', async () => {
      const existingUser = { id: 2, email: 'existing@example.com' };
      
      // Mock for authentication middleware
      db.User.findByPk.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        ProjectId: 1,
        name: 'Admin User',
        project: { id: 1, name: 'Test Project' },
      });
      jwt.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        ProjectId: 1,
        name: 'Admin User',
      });
      
      // Mock for checking existing user
      db.User.findOne.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/auth/staff/add')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'Staff User',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email sudah terdaftar');
    });
  });
});

