const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const { USER_ROLE } = require("../helpers/enums");

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Admin only
router.post(
  "/staff/add",
  authentication,
  authorization(USER_ROLE.ADMIN),
  AuthController.addStaff
);

module.exports = router;

