const db = require("../models");
const { Sequelize } = require("sequelize");
const { BRIEF_DETAIL_STATUS } = require("../helpers/enums");
const AppError = require("../errors/AppError");

class AdminController {
  static async getPendingApprovals(req, res, next) {
    try {
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
      if (briefIdsWithPending.length === 0) {
        return res.json([]);
      }

      const briefs = await db.Brief.findAll({
        where: {
          ProjectId: req.user.ProjectId,
          id: {
            [Sequelize.Op.in]: briefIdsWithPending,
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
            required: true,
            separate: true,
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

      const filteredBriefs = briefs.filter(brief => 
        brief.details && 
        brief.details.length > 0 && 
        brief.details.some(detail => detail.status === BRIEF_DETAIL_STATUS.PENDING_APPROVAL)
      );

      res.json(filteredBriefs);
    } catch (error) {
      next(error);
    }
  }

  static async approveBrief(req, res, next) {
    try {
      const { id } = req.params;
      const { scheduledAt, scheduledTime } = req.body;

      const brief = await db.Brief.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [{ model: db.BriefDetail, as: "details" }],
      });

      if (!brief) {
        throw new AppError("Brief tidak ditemukan", 404);
      }

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

      let scheduledDateTime = null;
      if (scheduledAt && scheduledTime) {
        scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`);
      }

      for (const detail of details) {
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
        throw new AppError("Brief tidak ditemukan", 404);
      }

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

  static async approveDetail(req, res, next) {
    try {
      const { detailId } = req.params;
      const { scheduledAt, scheduledTime } = req.body;

      const detail = await db.BriefDetail.findOne({
        where: {
          id: detailId,
          ProjectId: req.user.ProjectId,
          status: BRIEF_DETAIL_STATUS.PENDING_APPROVAL,
        },
        include: [
          { model: db.Brief, as: "brief", include: [
            { model: db.Product, as: "product" },
            { model: db.User, as: "user" },
          ]},
        ],
      });

      if (!detail) {
        throw new AppError("Detail brief tidak ditemukan atau tidak dalam status pending approval", 404);
      }

      let scheduledDateTime = null;
      if (scheduledAt && scheduledTime) {
        scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`);
      }

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

      const brief = await db.Brief.findByPk(detail.BriefId, {
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

  static async rejectDetail(req, res, next) {
    try {
      const { detailId } = req.params;
      const { rejectionReason } = req.body;

      const detail = await db.BriefDetail.findOne({
        where: {
          id: detailId,
          ProjectId: req.user.ProjectId,
          status: BRIEF_DETAIL_STATUS.PENDING_APPROVAL,
        },
      });

      if (!detail) {
        throw new AppError("Detail brief tidak ditemukan atau tidak dalam status pending approval", 404);
      }

      await detail.update({ 
        status: BRIEF_DETAIL_STATUS.REJECTED,
        rejectionReason: rejectionReason || "",
      });

      const brief = await db.Brief.findByPk(detail.BriefId, {
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
            [Sequelize.Op.ne]: null,
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
            }]
          },
        ],
        order: [["scheduledAt", "ASC"]],
      });

      const calendarData = briefDetails.map((detail) => ({
        id: detail.id,
        title: detail.title,
        platform: detail.platform,
        tag: detail.tag,
        funnel: detail.funnel,
        cta: detail.cta,
        caption: detail.caption,
        hashtags: detail.hashtags,
        detail: detail.detail,
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

  static async getTeam(req, res, next) {
    try {
      const team = await db.User.findAll({
        where: {
          ProjectId: req.user.ProjectId,
        },
        attributes: {
          exclude: ["password"]
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

      const project = await db.Project.findByPk(req.user.ProjectId);

      if (!project) {
        throw new AppError("Project tidak ditemukan", 404);
      }

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

