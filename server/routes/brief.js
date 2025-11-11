const express = require("express");
const router = express.Router();
const BriefController = require("../controllers/briefController");
const authentication = require("../middleware/authentication");
const projectScope = require("../middleware/projectScope");

// All authenticated users can access briefs
router.use(authentication);
router.use(projectScope);

router.get("/", BriefController.getAll);
router.get("/:id", BriefController.getById);
router.post("/", BriefController.generateBrief);
router.post("/:id/detail", BriefController.generateDetail);
router.put("/:id/detail", BriefController.updateDetail);
router.post("/:id/detail/submit", BriefController.submitDetailForApproval);
router.delete("/:id/detail", BriefController.deleteDetail);
router.put("/:id/submit", BriefController.submitForApproval);

module.exports = router;

