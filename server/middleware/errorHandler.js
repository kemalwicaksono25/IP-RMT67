const {
  handleSequelizeValidationError,
  handleSequelizeUniqueConstraintError,
  handleSequelizeForeignKeyConstraintError,
  handleSequelizeDatabaseError
} = require('../errors/handlers/databaseErrorHandler');

const {
  handleJsonWebTokenError,
  handleTokenExpiredError
} = require('../errors/handlers/authErrorHandler');

const {
  handleCastError,
  handleMulterError,
  handleDefaultError
} = require('../errors/handlers/generalErrorHandler');

module.exports = (err, req, res, next) => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  let errorResponse;

  if (err.name === "SequelizeValidationError") {
    errorResponse = handleSequelizeValidationError(err);
  } else if (err.name === "SequelizeUniqueConstraintError") {
    errorResponse = handleSequelizeUniqueConstraintError(err);
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    errorResponse = handleSequelizeForeignKeyConstraintError(err);
  } else if (err.name === "SequelizeDatabaseError") {
    errorResponse = handleSequelizeDatabaseError(err);
  } else if (err.name === "JsonWebTokenError") {
    errorResponse = handleJsonWebTokenError();
  } else if (err.name === "TokenExpiredError") {
    errorResponse = handleTokenExpiredError();
  } else if (err.name === "MulterError") {
    errorResponse = handleMulterError(err);
  } else if (err.name === "CastError") {
    errorResponse = handleCastError(err);
  } else {
    errorResponse = handleDefaultError(err);
  }
  res.status(errorResponse.statusCode).json({
    message: errorResponse.message,
    ...(errorResponse.errors && { errors: errorResponse.errors }),
    ...(errorResponse.error && { error: errorResponse.error })
  });
};

