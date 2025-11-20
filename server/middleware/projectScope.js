module.exports = (req, res, next) => {
  if (!req.user || !req.user.ProjectId) {
    return res.status(401).json({ message: "Tidak memiliki akses" });
  }
  req.projectScope = {
    ProjectId: req.user.ProjectId,
  };

  next();
};

