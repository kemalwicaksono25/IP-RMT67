const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const projectScope = require("../middleware/projectScope");
const { USER_ROLE } = require("../helpers/enums");

// Admin only routes
router.use(authentication);
router.use(authorization(USER_ROLE.ADMIN));
router.use(projectScope);

router.get("/approvals", AdminController.getPendingApprovals);
router.put("/approvals/:id/approve", AdminController.approveBrief);
router.put("/approvals/:id/reject", AdminController.rejectBrief);
router.get("/calendar", AdminController.getCalendar);
router.put("/calendar/:id/schedule", AdminController.scheduleBriefDetail);
router.get("/team", AdminController.getTeam);
router.put("/project/name", AdminController.updateProjectName);

module.exports = router;

