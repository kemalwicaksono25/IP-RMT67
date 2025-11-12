const handleJsonWebTokenError = () => {
  return {
    statusCode: 401,
    message: 'Token tidak valid'
  };
};

const handleTokenExpiredError = () => {
  return {
    statusCode: 401,
    message: 'Token telah kadaluarsa'
  };
};

const handleUnauthorizedError = (message = 'Unauthorized access') => {
  return {
    statusCode: 401,
    message
  };
};

const handleForbiddenError = (message = 'Forbidden access') => {
  return {
    statusCode: 403,
    message
  };
};

module.exports = {
  handleJsonWebTokenError,
  handleTokenExpiredError,
  handleUnauthorizedError,
  handleForbiddenError
};

