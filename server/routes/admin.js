const router = require("express").Router();
const AdminController = require("../controllers/adminController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const projectScope = require("../middleware/projectScope");
const { USER_ROLE } = require("../helpers/enums");
const { admin: adminValidator } = require("../middleware/validators");

router.use(authentication);
router.use(authorization(USER_ROLE.ADMIN));
router.use(projectScope);

router.get("/approvals", AdminController.getPendingApprovals);
router.get("/approvals/count", AdminController.getPendingApprovalsCount);
router.put("/approvals/:id/approve", adminValidator.validateApprovalId, adminValidator.validateApproveBrief, AdminController.approveBrief);
router.put("/approvals/:id/reject", adminValidator.validateApprovalId, adminValidator.validateRejectBrief, AdminController.rejectBrief);
router.put("/approvals/detail/:detailId/approve", AdminController.approveDetail);
router.put("/approvals/detail/:detailId/reject", AdminController.rejectDetail);
router.get("/calendar", AdminController.getCalendar);
router.get("/team", AdminController.getTeam);
router.put("/project/name", adminValidator.validateProjectName, AdminController.updateProjectName);

module.exports = router;

