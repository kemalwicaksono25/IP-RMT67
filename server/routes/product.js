const router = require("express").Router();
const ProductController = require("../controllers/productController");
const authentication = require("../middleware/authentication");
const projectScope = require("../middleware/projectScope");
const upload = require("../services/uploadService");
const { product: productValidator } = require("../middleware/validators");

router.use(authentication);
router.use(projectScope);

router.get("/", ProductController.getAll);
router.get("/:id", productValidator.validateProductId, ProductController.getById);
// Handle both "images" (multiple) and "image" (single, backward compatibility)
// Use fields to accept both field names
const uploadMiddleware = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'image', maxCount: 1 }
]);

router.post("/", uploadMiddleware, productValidator.validateProductCreate, ProductController.create);
router.put("/:id", uploadMiddleware, productValidator.validateProductId, productValidator.validateProductUpdate, ProductController.update);
router.delete("/:id", productValidator.validateProductId, ProductController.delete);

module.exports = router;

