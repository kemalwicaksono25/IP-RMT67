module.exports = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    message: 'Validation error'
  },
  DUPLICATE_ENTRY: {
    code: 'DUPLICATE_ENTRY',
    statusCode: 400,
    message: 'Duplicate entry'
  },

  NOT_FOUND: {
    code: 'NOT_FOUND',
    statusCode: 404,
    message: 'Resource not found'
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    statusCode: 401,
    message: 'Invalid token'
  },

  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    statusCode: 401,
    message: 'Unauthorized access'
  },

  FORBIDDEN: {
    code: 'FORBIDDEN',
    statusCode: 403,
    message: 'Forbidden access'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    message: 'Internal server error'
  },
  AI_SERVICE_ERROR: {
    code: 'AI_SERVICE_ERROR',
    statusCode: 500,
    message: 'AI service error'
  },
  FILE_UPLOAD_ERROR: {
    code: 'FILE_UPLOAD_ERROR',
    statusCode: 400,
    message: 'File upload error'
  }
};

