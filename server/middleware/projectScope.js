// Middleware untuk memastikan user hanya mengakses data dari project mereka
module.exports = (req, res, next) => {
  if (!req.user || !req.user.ProjectId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach ProjectId ke query untuk filtering
  req.projectScope = {
    ProjectId: req.user.ProjectId,
  };

  next();
};

