const db = require("../models");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { USER_ROLE } = require("../helpers/enums");

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, projectName } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!projectName || projectName.trim() === '') {
        return res.status(400).json({ message: "Project name is required" });
      }

      // Check if email already exists
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create project first
      const project = await db.Project.create({
        name: projectName.trim(),
      });

      // Create admin user
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

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await db.User.findOne({ 
        where: { email },
        include: [{ model: db.Project, as: "project" }],
      });

      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid email/password" });
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

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Ensure admin has ProjectId
      if (!req.user || !req.user.ProjectId) {
        return res.status(401).json({ message: "Unauthorized: Admin must have a project" });
      }

      // Check if email already exists
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create staff user in same project as admin
      const staff = await db.User.create({
        name,
        email,
        password: hashPassword(password),
        role: USER_ROLE.STAFF,
        ProjectId: req.user.ProjectId, // Use admin's ProjectId
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

