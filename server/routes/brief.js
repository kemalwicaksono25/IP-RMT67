const express = require("express");
const router = express.Router();
const BriefController = require("../controllers/briefController");
const authentication = require("../middleware/authentication");
const projectScope = require("../middleware/projectScope");
const { brief: briefValidator } = require("../middleware/validators");

router.use(authentication);
router.use(projectScope);

router.get("/", BriefController.getAll);
router.get("/:id", briefValidator.validateBriefId, BriefController.getById);
router.post("/", briefValidator.validateGenerateBrief, BriefController.generateBrief);
router.post("/:id/detail", briefValidator.validateBriefDetailId, BriefController.generateDetail);
router.put("/:id/detail", briefValidator.validateBriefDetailId, briefValidator.validateUpdateBriefDetail, BriefController.updateDetail);
router.post("/:id/detail/submit", briefValidator.validateBriefDetailId, briefValidator.validateSubmitDetail, BriefController.submitDetailForApproval);
router.delete("/:id/detail", briefValidator.validateBriefDetailId, BriefController.deleteDetail);

module.exports = router;

