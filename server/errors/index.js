const AppError = require('./AppError');
const errorTypes = require('./errorTypes');
const databaseErrorHandler = require('./handlers/databaseErrorHandler');
const authErrorHandler = require('./handlers/authErrorHandler');
const generalErrorHandler = require('./handlers/generalErrorHandler');

module.exports = {
  AppError,
  errorTypes,
  handlers: {
    database: databaseErrorHandler,
    auth: authErrorHandler,
    general: generalErrorHandler
  }
};

