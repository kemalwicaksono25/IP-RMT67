const db = require("../models");
const { Sequelize } = require("sequelize");
const { BRIEF_STATUS, BRIEF_DETAIL_STATUS } = require("../helpers/enums");

class AdminController {
  static async getPendingApprovals(req, res, next) {
    try {
      // Find all BriefDetails with status PENDING_APPROVAL (staff submitted for approval)
      // READY status means detail is ready but not yet submitted, so it shouldn't appear in approval page
      const pendingDetails = await db.BriefDetail.findAll({
        where: {
          ProjectId: req.user.ProjectId,
          status: {
            [Sequelize.Op.in]: [BRIEF_DETAIL_STATUS.PENDING_APPROVAL],
          },
        },
        attributes: ['BriefId'],
        raw: true,
      });

      const briefIdsWithPending = [...new Set(pendingDetails.map(d => d.BriefId))];

      // Get briefs that have details with status PENDING_APPROVAL
      // Status is only managed at BriefDetail level, not parent Brief
      const briefs = await db.Brief.findAll({
        where: {
          ProjectId: req.user.ProjectId,
          id: {
            [Sequelize.Op.in]: briefIdsWithPending.length > 0 ? briefIdsWithPending : [0], // Return empty if no pending details
          },
        },
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          {
            model: db.BriefDetail,
            as: "details",
            where: {
              status: {
                [Sequelize.Op.in]: [
                  BRIEF_DETAIL_STATUS.PENDING_APPROVAL,
                ],
              },
            },
            required: true, // Only include briefs with pending details
            order: [["id", "ASC"]],
          },
          {
            model: db.Comment,
            as: "comments",
            include: [{ model: db.User, as: "user" }],
            order: [["createdAt", "ASC"]],
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(briefs);
    } catch (error) {
      console.error('Error in getPendingApprovals:', error);
      next(error);
    }
  }

  static async approveBrief(req, res, next) {
    try {
      const { id } = req.params;
      const { scheduledAt, scheduledTime } = req.body; // Optional: admin can set schedule when approving

      const brief = await db.Brief.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [{ model: db.BriefDetail, as: "details" }],
      });

      if (!brief) {
        return res.status(404).json({ message: "Brief not found" });
      }

      // Status is only managed at BriefDetail level, not parent Brief
      // Update all brief details with PENDING_APPROVAL status (only staff-submitted briefs appear here)
      const details = await db.BriefDetail.findAll({
        where: { 
          BriefId: brief.id,
          status: {
            [Sequelize.Op.in]: [
              BRIEF_DETAIL_STATUS.PENDING_APPROVAL
            ]
          }
        }
      });

      // Combine scheduledAt and scheduledTime if provided
      let scheduledDateTime = null;
      if (scheduledAt && scheduledTime) {
        scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`);
      }

      for (const detail of details) {
        // If scheduledAt exists (from detail or from request), set to SCHEDULED
        // Otherwise set to APPROVED
        const finalScheduledAt = scheduledDateTime || detail.scheduledAt;
        
        if (finalScheduledAt) {
          await detail.update({ 
            status: BRIEF_DETAIL_STATUS.SCHEDULED,
            scheduledAt: finalScheduledAt
          });
        } else {
          await detail.update({ 
            status: BRIEF_DETAIL_STATUS.APPROVED 
          });
        }
      }

      await brief.reload({
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          { model: db.BriefDetail, as: "details" },
        ],
      });

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  static async rejectBrief(req, res, next) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const brief = await db.Brief.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [{ model: db.BriefDetail, as: "details" }],
      });

      if (!brief) {
        return res.status(404).json({ message: "Brief not found" });
      }

      // Status is only managed at BriefDetail level, not parent Brief
      // Update all brief details with PENDING_APPROVAL status to REJECTED
      // READY status means detail is ready but not yet submitted, so it shouldn't be rejected
      const details = await db.BriefDetail.findAll({
        where: { 
          BriefId: brief.id,
          status: {
            [Sequelize.Op.in]: [
              BRIEF_DETAIL_STATUS.PENDING_APPROVAL
            ]
          }
        }
      });

      for (const detail of details) {
        await detail.update({ 
          status: BRIEF_DETAIL_STATUS.REJECTED 
        });
      }

      // Update rejection reason on brief
      await brief.update({
        rejectionReason: rejectionReason || "",
      });

      await brief.reload({
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          { model: db.BriefDetail, as: "details" },
        ],
      });

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  static async getCalendar(req, res, next) {
    try {
      // Get all brief details that should appear in calendar:
      // 1. Status is SCHEDULED (admin submitted directly or admin approved with scheduledAt)
      // 2. Status is APPROVED with scheduledAt (staff approved and scheduled)
      // Must have scheduledAt to appear in calendar
      const briefDetails = await db.BriefDetail.findAll({
        where: {
          ProjectId: req.user.ProjectId,
          status: {
            [Sequelize.Op.in]: [
              BRIEF_DETAIL_STATUS.SCHEDULED,
              BRIEF_DETAIL_STATUS.APPROVED
            ],
          },
          scheduledAt: {
            [Sequelize.Op.ne]: null, // Only get items with scheduledAt
          },
        },
        include: [
          {
            model: db.Brief,
            as: "brief",
            required: false,
            include: [{ 
              model: db.Product, 
              as: "product",
              required: false
            }],
          },
        ],
        order: [["scheduledAt", "ASC"]],
      });

      // Format for calendar
      const calendarData = briefDetails.map((detail) => ({
        id: detail.id,
        title: detail.title,
        platform: detail.platform,
        tag: detail.tag,
        funnel: detail.funnel,
        cta: detail.cta,
        caption: detail.caption,
        hashtags: detail.hashtags,
        detail: detail.detail, // JSONB field with all production details
        scheduledAt: detail.scheduledAt,
        status: detail.status,
        brief: detail.brief ? {
          id: detail.brief.id,
          funnelStage: detail.brief.funnelStage,
          product: detail.brief.product,
        } : null,
      }));

      res.json(calendarData);
    } catch (error) {
      next(error);
    }
  }

  static async scheduleBriefDetail(req, res, next) {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Brief detail not found" });
      }

      await briefDetail.update({
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt
          ? BRIEF_DETAIL_STATUS.SCHEDULED
          : BRIEF_DETAIL_STATUS.APPROVED,
      });

      res.json(briefDetail);
    } catch (error) {
      next(error);
    }
  }

  static async getTeam(req, res, next) {
    try {
      // Get all users (admin + staff) in the same project
      const team = await db.User.findAll({
        where: {
          ProjectId: req.user.ProjectId,
        },
        attributes: {
          exclude: ["password"], // Don't return password
        },
        order: [["createdAt", "DESC"]],
      });

      res.json(team);
    } catch (error) {
      next(error);
    }
  }

  static async updateProjectName(req, res, next) {
    try {
      const { projectName } = req.body;

      if (!projectName || projectName.trim() === '') {
        return res.status(400).json({ message: "Project name is required" });
      }

      // Get project by ProjectId
      const project = await db.Project.findByPk(req.user.ProjectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project name
      await project.update({
        name: projectName.trim(),
      });

      res.json({
        id: project.id,
        name: project.name,
        message: "Project name updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;

