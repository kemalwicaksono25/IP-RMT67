const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const authentication = require("../middleware/authentication");
const projectScope = require("../middleware/projectScope");
const upload = require("../services/uploadService");

// All authenticated users can access products
router.use(authentication);
router.use(projectScope);

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post("/", upload.single("image"), ProductController.create);
router.put("/:id", upload.single("image"), ProductController.update);
router.post("/:id/analyze", ProductController.analyzeProduct);
router.delete("/:id", ProductController.delete);

module.exports = router;

