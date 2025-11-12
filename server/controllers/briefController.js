const db = require("../models");
const AIService = require("../services/aiService");
const { BRIEF_STATUS, BRIEF_DETAIL_STATUS } = require("../helpers/enums");

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
        return res.status(404).json({ message: "Produk tidak ditemukan" });
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
        briefIdeas.map((idea) => {
          const detailData = {
            objectiveCampaign: idea.objectiveCampaign || "",
            decisionTrigger: idea.decisionTrigger || "",
            productValueHighlight: idea.productValueHighlight || "",
            communicationApproach: idea.communicationApproach || "",
            hookOpening: idea.hookOpening || "",
            mainContentPoints: Array.isArray(idea.mainContentPoints) ? idea.mainContentPoints : [],
            breakdownDetail: idea.breakdownDetail || "",
            visualIdentityNote: idea.visualIdentityNote || "",
          };

          return db.BriefDetail.create({
            BriefId: brief.id,
            ProjectId: req.user.ProjectId,
            platform: idea.platform || "TikTok",
            tag: idea.tag || "video",
            title: idea.title || "Ide Konten",
            funnel: idea.funnel || funnelStageArray[0] || "awareness",
            cta: idea.cta || "BELI SEKARANG",
            detail: detailData,
            status: BRIEF_DETAIL_STATUS.READY,
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
        return res.status(404).json({ message: "Detail brief tidak ditemukan" });
      }

      const brief = briefDetail.brief;
      const product = await db.Product.findByPk(brief.ProductId);

      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }

      let aiResult;
      try {
        aiResult = await AIService.generateDetail(
          briefDetail,
          product,
          brief.toneOfVoice || "Friendly"
        );
      } catch (aiError) {
        console.error("Generate Detail AI Error:", aiError.message);
        return res.status(500).json({ 
          message: aiError.message || "Gagal generate detail",
          error: process.env.NODE_ENV === 'development' ? {
            stack: aiError.stack,
            name: aiError.name,
            details: aiError.toString()
          } : undefined
        });
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
        objectiveCampaign: existingDetail.objectiveCampaign,
        decisionTrigger: existingDetail.decisionTrigger,
        productValueHighlight: existingDetail.productValueHighlight,
        communicationApproach: existingDetail.communicationApproach,
        hookOpening: existingDetail.hookOpening,
        mainContentPoints: existingDetail.mainContentPoints,
        breakdownDetail: existingDetail.breakdownDetail,
        visualIdentityNote: existingDetail.visualIdentityNote,
      };

      await briefDetail.update({
        detail: {
          ...aiResult.detail || {},
          ...ideaContentFields,
        },
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
          return res.status(404).json({ message: "Brief tidak ditemukan" });
        }

        res.json({ brief: updatedBrief });
      } catch (queryError) {
        console.error("Error reloading brief:", queryError.message);
        throw queryError;
      }
    } catch (error) {
      console.error("Generate Detail Controller Error:", error.message);
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
        return res.status(404).json({ message: "Brief tidak ditemukan" });
      }

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  static async updateDetail(req, res, next) {
    try {
      const { id } = req.params;
      const { platform, tag, title, funnel, cta, detail, caption, hashtags, status, scheduledAt } = req.body;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Detail brief tidak ditemukan" });
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

      await briefDetail.update(updateData);

      res.json(briefDetail);
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
        return res.status(404).json({ message: "Detail brief tidak ditemukan" });
      }

      const isAdmin = req.user.role === "admin";
      const newStatus = isAdmin ? BRIEF_DETAIL_STATUS.SCHEDULED : BRIEF_DETAIL_STATUS.PENDING_APPROVAL;

      // Parse tanggal dan waktu dengan mempertimbangkan timezone lokal
      const [year, month, day] = scheduledAt.split('-').map(Number);
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(year, month - 1, day, hours, minutes);
      
      await briefDetail.update({
        status: newStatus,
        scheduledAt: scheduledDateTime,
      });

      res.json(briefDetail);
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
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Detail brief tidak ditemukan" });
      }

      await briefDetail.destroy();

      res.json({ message: "Brief detail deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BriefController;

