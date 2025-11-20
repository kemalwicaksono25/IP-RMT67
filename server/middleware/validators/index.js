const productValidator = require('./productValidator');
const authValidator = require('./authValidator');
const briefValidator = require('./briefValidator');
const adminValidator = require('./adminValidator');

module.exports = {
  product: productValidator,
  auth: authValidator,
  brief: briefValidator,
  admin: adminValidator
};

