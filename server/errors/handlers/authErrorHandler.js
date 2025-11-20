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

module.exports = {
  handleJsonWebTokenError,
  handleTokenExpiredError
};

