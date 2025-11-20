const router = require("express").Router();
const AuthController = require("../controllers/authController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const { USER_ROLE } = require("../helpers/enums");
const { auth: authValidator } = require("../middleware/validators");

router.post("/register", authValidator.validateRegister, AuthController.register);
router.post("/login", authValidator.validateLogin, AuthController.login);
router.post("/login/google", AuthController.googleLogin);

router.post(
  "/staff/add",
  authentication,
  authorization(USER_ROLE.ADMIN),
  authValidator.validateAddStaff,
  AuthController.addStaff
);

module.exports = router;

