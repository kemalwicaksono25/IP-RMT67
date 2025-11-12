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
router.post("/", upload.single("image"), productValidator.validateProductCreate, ProductController.create);
router.put("/:id", upload.single("image"), productValidator.validateProductId, productValidator.validateProductUpdate, ProductController.update);
router.delete("/:id", productValidator.validateProductId, ProductController.delete);

module.exports = router;

