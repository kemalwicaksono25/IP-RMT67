const db = require("../models");
const AIService = require("../services/aiService");
const { BRIEF_STATUS, BRIEF_DETAIL_STATUS } = require("../helpers/enums");
const AppError = require("../errors/AppError");

class BriefController {
  static async generateBrief(req, res, next) {
    try {
      const {
        ProductId,
        funnelStage,
        briefType,
        toneOfVoice,
        targetMarket,
        count = 5,
      } = req.body;

      const product = await db.Product.findOne({
        where: {
          id: ProductId,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!product) {
        throw new AppError("Produk tidak ditemukan", 404);
      }

      let briefTypeArray = briefType;
      if (typeof briefType === 'string' && briefType.includes(',')) {
        briefTypeArray = briefType.split(',').map(t => t.trim()).filter(t => t);
      } else if (typeof briefType === 'string') {
        briefTypeArray = [briefType];
      }
      
      let funnelStageArray = funnelStage;
      if (typeof funnelStage === 'string' && funnelStage.includes(',')) {
        funnelStageArray = funnelStage.split(',').map(s => s.trim()).filter(s => s);
      } else if (typeof funnelStage === 'string') {
        funnelStageArray = [funnelStage];
      }
      const briefIdeas = await AIService.generateBrief(
        product,
        funnelStageArray || ["awareness"],
        toneOfVoice || "Friendly",
        briefTypeArray || ["Problem-Agitate-Solve"],
        parseInt(count) || 5
      );

      const brief = await db.Brief.create({
        ProductId,
        UserId: req.user.id,
        ProjectId: req.user.ProjectId,
        funnelStage: typeof funnelStage === 'string' ? funnelStage : (funnelStageArray?.join(',') || "awareness"),
        briefType: typeof briefType === 'string' ? briefType : (briefTypeArray?.join(',') || ""),
        toneOfVoice: toneOfVoice || "",
        targetMarket: targetMarket || "",
        status: BRIEF_STATUS.DRAFT,
      });

      const briefDetails = await Promise.all(
        briefIdeas.map((idea, index) => {
          const detailData = {
            objectiveCampaign: (idea.objectiveCampaign && idea.objectiveCampaign.trim()) || "",
            decisionTrigger: (idea.decisionTrigger && idea.decisionTrigger.trim()) || "",
            productValueHighlight: (idea.productValueHighlight && idea.productValueHighlight.trim()) || "",
            communicationApproach: (idea.communicationApproach && idea.communicationApproach.trim()) || "",
            hookOpening: (idea.hookOpening && idea.hookOpening.trim()) || "",
            mainContentPoints: Array.isArray(idea.mainContentPoints) && idea.mainContentPoints.length > 0 
              ? idea.mainContentPoints.filter(p => p && p.trim()) 
              : [],
            breakdownDetail: (idea.breakdownDetail && idea.breakdownDetail.trim()) || "",
            visualIdentityNote: (idea.visualIdentityNote && idea.visualIdentityNote.trim()) || "",
          };

          // Log untuk debugging - hanya di development
          if (process.env.NODE_ENV === 'development') {
            const missingFields = [];
            if (!detailData.objectiveCampaign) missingFields.push('objectiveCampaign');
            if (!detailData.decisionTrigger) missingFields.push('decisionTrigger');
            if (!detailData.productValueHighlight) missingFields.push('productValueHighlight');
            if (!detailData.communicationApproach) missingFields.push('communicationApproach');
            if (!detailData.hookOpening) missingFields.push('hookOpening');
            if (!detailData.mainContentPoints || detailData.mainContentPoints.length === 0) missingFields.push('mainContentPoints');
            if (!detailData.breakdownDetail) missingFields.push('breakdownDetail');
            if (!detailData.visualIdentityNote) missingFields.push('visualIdentityNote');
            
            // Field validation untuk brief idea
          }

          return db.BriefDetail.create({
            BriefId: brief.id,
            ProjectId: req.user.ProjectId,
            platform: idea.platform || "TikTok",
            tag: idea.tag || "video",
            title: idea.title || "Ide Konten",
            funnel: idea.funnel || funnelStageArray[0] || "awareness",
            cta: idea.cta || "BELI SEKARANG",
            detail: detailData,
            status: BRIEF_DETAIL_STATUS.DRAFT,
          });
        })
      );

      const briefWithDetails = await db.Brief.findByPk(brief.id, {
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          { model: db.BriefDetail, as: "details" },
        ],
      });

      res.status(201).json(briefWithDetails);
    } catch (error) {
      next(error);
    }
  }

  static async generateDetail(req, res, next) {
    try {
      const { id } = req.params;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [{ model: db.Brief, as: "brief" }],
      });

      if (!briefDetail) {
        throw new AppError("Detail brief tidak ditemukan", 404);
      }

      const brief = briefDetail.brief;
      const product = await db.Product.findByPk(brief.ProductId);

      if (!product) {
        throw new AppError("Produk tidak ditemukan", 404);
      }

      let aiResult;
      try {
        aiResult = await AIService.generateDetail(
          briefDetail,
          product,
          brief.toneOfVoice || "Friendly"
        );
      } catch (aiError) {
        throw new AppError(aiError.message || "Gagal generate detail", 500);
      }

      let captionText = aiResult.caption || "";
      let hashtagsArray = Array.isArray(aiResult.hashtags) && aiResult.hashtags.length > 0 
        ? aiResult.hashtags 
        : [];
      
      if (hashtagsArray.length === 0 && captionText) {
        const hashtagRegex = /#[\w]+/g;
        const foundHashtags = captionText.match(hashtagRegex);
        if (foundHashtags && foundHashtags.length > 0) {
          hashtagsArray = foundHashtags;
        }
      }

      const existingDetail = briefDetail.detail || {};
      
      const ideaContentFields = {
        objectiveCampaign: existingDetail.objectiveCampaign || "",
        decisionTrigger: existingDetail.decisionTrigger || "",
        productValueHighlight: existingDetail.productValueHighlight || "",
        communicationApproach: existingDetail.communicationApproach || "",
        hookOpening: existingDetail.hookOpening || "",
        mainContentPoints: Array.isArray(existingDetail.mainContentPoints) ? existingDetail.mainContentPoints : [],
        breakdownDetail: existingDetail.breakdownDetail || "",
        visualIdentityNote: existingDetail.visualIdentityNote || "",
      };

      const mergedDetail = {
        ...(aiResult.detail || {}),
        ...ideaContentFields,
      };

      await briefDetail.update({
        detail: mergedDetail,
        caption: captionText,
        hashtags: hashtagsArray,
        status: BRIEF_DETAIL_STATUS.READY,
      });

      await briefDetail.reload();

      try {
        const updatedBrief = await db.Brief.findOne({
          where: {
            id: brief.id,
            ProjectId: req.user.ProjectId,
          },
          include: [
            { model: db.Product, as: "product" },
            {
              model: db.BriefDetail,
              as: "details",
              separate: true,
              order: [["id", "ASC"]],
            },
          ],
        });

        if (!updatedBrief) {
          throw new AppError("Brief tidak ditemukan", 404);
        }

        res.json({ brief: updatedBrief });
      } catch (queryError) {
        throw queryError;
      }
    } catch (error) {
      // Error handling untuk generate detail
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { productId } = req.query;
      const whereClause = { ProjectId: req.user.ProjectId };
      
      if (productId) {
        whereClause.ProductId = productId;
      }

      const briefs = await db.Brief.findAll({
        where: whereClause,
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          { model: db.BriefDetail, as: "details" },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(briefs);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const brief = await db.Brief.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          {
            model: db.BriefDetail,
            as: "details",
            separate: true,
            order: [["id", "ASC"]],
          },
          {
            model: db.Comment,
            as: "comments",
            include: [{ model: db.User, as: "user" }],
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      if (!brief) {
        throw new AppError("Brief tidak ditemukan", 404);
      }

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  static async updateDetail(req, res, next) {
    try {
      const { id } = req.params;
      const { platform, tag, title, funnel, cta, detail, caption, hashtags, status, scheduledAt, rejectionReason } = req.body;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        throw new AppError("Detail brief tidak ditemukan", 404);
      }

      const updateData = {};
      if (platform !== undefined) updateData.platform = platform;
      if (tag !== undefined) updateData.tag = tag;
      if (title !== undefined) updateData.title = title;
      if (funnel !== undefined) updateData.funnel = funnel;
      if (cta !== undefined) updateData.cta = cta;
      if (detail !== undefined) updateData.detail = detail;
      if (caption !== undefined) updateData.caption = caption;
      if (hashtags !== undefined) updateData.hashtags = hashtags;
      if (status !== undefined) updateData.status = status;
      if (scheduledAt !== undefined) {
        updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      }
      if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

      await briefDetail.update(updateData);

      const updatedBrief = await db.Brief.findOne({
        where: {
          id: briefDetail.BriefId,
          ProjectId: req.user.ProjectId,
        },
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          {
            model: db.BriefDetail,
            as: "details",
            separate: true,
            order: [["id", "ASC"]],
          },
        ],
      });

      res.json({ brief: updatedBrief, briefDetail });
    } catch (error) {
      next(error);
    }
  }

  static async submitDetailForApproval(req, res, next) {
    try {
      const { id } = req.params;
      const { scheduledAt, scheduledTime } = req.body;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        throw new AppError("Detail brief tidak ditemukan", 404);
      }

      const isAdmin = req.user.role === "admin";
      const newStatus = isAdmin ? BRIEF_DETAIL_STATUS.SCHEDULED : BRIEF_DETAIL_STATUS.PENDING_APPROVAL;

      const [year, month, day] = scheduledAt.split('-').map(Number);
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(year, month - 1, day, hours, minutes);
      
      const updateData = {
        status: newStatus,
        scheduledAt: scheduledDateTime,
      };
      
      if (briefDetail.rejectionReason) {
        updateData.rejectionReason = null;
      }
      
      await briefDetail.update(updateData);
      await briefDetail.reload();
      const updatedBrief = await db.Brief.findOne({
        where: {
          id: briefDetail.BriefId,
          ProjectId: req.user.ProjectId,
        },
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          {
            model: db.BriefDetail,
            as: "details",
            separate: true,
            order: [["id", "ASC"]],
          },
        ],
      });

      res.json({ brief: updatedBrief, briefDetail });
    } catch (error) {
      next(error);
    }
  }


  static async deleteDetail(req, res, next) {
    try {
      const { id } = req.params;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [{ model: db.Brief, as: "brief" }],
      });

      if (!briefDetail) {
        throw new AppError("Detail brief tidak ditemukan", 404);
      }

      const briefId = briefDetail.BriefId;
      await briefDetail.destroy();

      // Return updated brief
      const updatedBrief = await db.Brief.findOne({
        where: {
          id: briefId,
          ProjectId: req.user.ProjectId,
        },
        include: [
          { model: db.Product, as: "product" },
          { model: db.User, as: "user" },
          {
            model: db.BriefDetail,
            as: "details",
            separate: true,
            order: [["id", "ASC"]],
          },
        ],
      });

      res.json({ brief: updatedBrief, message: "Brief detail deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BriefController;

