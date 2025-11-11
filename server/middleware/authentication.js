const { verifyToken } = require("../helpers/jwt");
const db = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await db.User.findByPk(decoded.id, {
      include: [{ model: db.Project, as: "project" }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ProjectId: user.ProjectId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

