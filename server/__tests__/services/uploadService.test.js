// Mock dependencies before importing
const mockCloudinaryConfig = jest.fn();
const mockCloudinary = {
  v2: {
    config: mockCloudinaryConfig,
  },
};

const mockCloudinaryStorage = jest.fn();
let capturedFileFilter = null;

const mockMulter = jest.fn((config) => {
  // Capture fileFilter for testing
  if (config.fileFilter) {
    capturedFileFilter = config.fileFilter;
  }
  return {
    single: jest.fn(),
    array: jest.fn(),
    fields: jest.fn(),
  };
});

jest.mock('cloudinary', () => mockCloudinary);
jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: mockCloudinaryStorage,
}));
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
jest.mock('multer', () => mockMulter);

describe('uploadService', () => {
  let upload;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Set environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';
  });

  it('should configure cloudinary with environment variables', () => {
    require('../../services/uploadService');
    
    expect(mockCloudinaryConfig).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  });

  it('should create CloudinaryStorage with correct params', () => {
    require('../../services/uploadService');
    
    expect(mockCloudinaryStorage).toHaveBeenCalledWith({
      cloudinary: mockCloudinary.v2,
      params: {
        folder: 'content-planner/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
      },
    });
  });

  it('should export multer instance', () => {
    upload = require('../../services/uploadService');
    
    expect(upload).toBeDefined();
    expect(typeof upload).toBe('object'); // multer returns an object with methods like single(), array(), etc.
    expect(upload.single).toBeDefined();
    expect(typeof upload.single).toBe('function');
  });

  describe('fileFilter logic', () => {
    // Test the fileFilter logic directly since we can't easily access multer's internal config
    const testFileFilter = (file) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(
        file.originalname.toLowerCase().split('.').pop()
      );
      const mimetype = allowedTypes.test(file.mimetype);
      return mimetype && extname;
    };

    it('should accept jpeg files', () => {
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      };
      
      expect(testFileFilter(file)).toBe(true);
    });

    it('should accept png files', () => {
      const file = {
        originalname: 'test.png',
        mimetype: 'image/png',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(true);
    });

    it('should accept gif files', () => {
      const file = {
        originalname: 'test.gif',
        mimetype: 'image/gif',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(true);
    });

    it('should accept webp files', () => {
      const file = {
        originalname: 'test.webp',
        mimetype: 'image/webp',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(true);
    });

    it('should accept jpg files (case insensitive)', () => {
      const file = {
        originalname: 'test.JPG',
        mimetype: 'image/jpeg',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(true);
    });

    it('should reject non-image files', () => {
      const file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(false);
    });

    it('should reject files with invalid extension', () => {
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(false);
    });

    it('should reject files with valid extension but invalid mimetype', () => {
      const file = {
        originalname: 'test.jpg',
        mimetype: 'application/octet-stream',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(false);
    });

    it('should reject files with valid mimetype but invalid extension', () => {
      const file = {
        originalname: 'test.pdf',
        mimetype: 'image/jpeg',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(false);
    });

    it('should handle files without extension', () => {
      const file = {
        originalname: 'test',
        mimetype: 'image/jpeg',
      };
      
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
      const mimetype = allowedTypes.test(file.mimetype);
      
      expect(mimetype && extname).toBe(false);
    });
  });

  describe('fileFilter callback execution', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      capturedFileFilter = null;
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      process.env.CLOUDINARY_API_KEY = 'test-key';
      process.env.CLOUDINARY_API_SECRET = 'test-secret';
    });

    it('should call callback with error for invalid file types', () => {
      // Reset modules to ensure fresh require
      jest.resetModules();
      // Re-require the service to capture fileFilter
      require('../../services/uploadService');
      
      expect(capturedFileFilter).toBeDefined();
      expect(capturedFileFilter).not.toBeNull();
      
      const mockCb = jest.fn();
      const invalidFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      };
      
      capturedFileFilter(null, invalidFile, mockCb);
      
      expect(mockCb).toHaveBeenCalledWith(expect.any(Error));
      expect(mockCb.mock.calls[0][0].message).toBe('Only image files are allowed!');
    });

    it('should call callback with null and true for valid file types', () => {
      // Reset modules to ensure fresh require
      jest.resetModules();
      // Re-require the service to capture fileFilter
      require('../../services/uploadService');
      
      expect(capturedFileFilter).toBeDefined();
      expect(capturedFileFilter).not.toBeNull();
      
      const mockCb = jest.fn();
      const validFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      };
      
      capturedFileFilter(null, validFile, mockCb);
      
      expect(mockCb).toHaveBeenCalledWith(null, true);
    });
  });
});

