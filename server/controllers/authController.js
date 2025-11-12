const db = require("../models");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { USER_ROLE } = require("../helpers/enums");
const AppError = require("../errors/AppError");

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, projectName } = req.body;

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError("Email sudah terdaftar", 400);
      }

      const project = await db.Project.create({
        name: projectName.trim(),
      });
      const user = await db.User.create({
        name,
        email,
        password: hashPassword(password),
        role: USER_ROLE.ADMIN,
        ProjectId: project.id,
      });

      const access_token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ProjectId: user.ProjectId,
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ProjectId: user.ProjectId,
        projectName: project.name,
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await db.User.findOne({ 
        where: { email },
        include: [{ model: db.Project, as: "project" }],
      });

      if (!user || !comparePassword(password, user.password)) {
        throw new AppError("Email atau password salah", 401);
      }

      const access_token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ProjectId: user.ProjectId,
      });

      res.json({ 
        access_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ProjectId: user.ProjectId,
          projectName: user.project?.name || null,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async addStaff(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError("Email sudah terdaftar", 400);
      }

      const staff = await db.User.create({
        name,
        email,
        password: hashPassword(password),
        role: USER_ROLE.STAFF,
        ProjectId: req.user.ProjectId,
      });

      res.status(201).json({
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        ProjectId: staff.ProjectId,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

