const router = require("express").Router();
const authRoutes = require("./auth");
const productRoutes = require("./product");
const briefRoutes = require("./brief");
const adminRoutes = require("./admin");
const authentication = require("../middleware/authentication");
const projectScope = require("../middleware/projectScope");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/briefs", briefRoutes);
router.use("/admin", adminRoutes);

const AdminController = require("../controllers/adminController");
router.get("/calendar", authentication, projectScope, AdminController.getCalendar);

module.exports = router;

