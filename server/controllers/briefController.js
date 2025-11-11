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

      if (!ProductId || !funnelStage || (Array.isArray(funnelStage) && funnelStage.length === 0)) {
        return res
          .status(400)
          .json({ message: "ProductId and funnelStage are required" });
      }

      // Verify product belongs to user's project
      const product = await db.Product.findOne({
        where: {
          id: ProductId,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Handle briefType: can be string (comma-separated) or array
      let briefTypeArray = briefType;
      if (typeof briefType === 'string' && briefType.includes(',')) {
        briefTypeArray = briefType.split(',').map(t => t.trim()).filter(t => t);
      } else if (typeof briefType === 'string') {
        briefTypeArray = [briefType];
      }
      
      // Handle funnelStage: can be string (comma-separated) or array
      let funnelStageArray = funnelStage;
      if (typeof funnelStage === 'string' && funnelStage.includes(',')) {
        funnelStageArray = funnelStage.split(',').map(s => s.trim()).filter(s => s);
      } else if (typeof funnelStage === 'string') {
        funnelStageArray = [funnelStage];
      }
      
      // Generate brief ideas using AI
      const briefIdeas = await AIService.generateBrief(
        product,
        funnelStageArray || ["awareness"],
        toneOfVoice || "Friendly",
        briefTypeArray || ["Problem-Agitate-Solve"],
        parseInt(count) || 5
      );

      // Create Brief record
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

      // Create BriefDetail records for each idea - ensure all AI results are saved
      const briefDetails = await Promise.all(
        briefIdeas.map((idea) => {
          // Store additional fields in detail JSONB
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
            status: BRIEF_DETAIL_STATUS.READY, // Set to READY when detail is created
          });
        })
      );

      // Status is only managed at BriefDetail level, not parent Brief

      // Reload brief with relations
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
      const { id } = req.params; // BriefDetail ID

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
        include: [{ model: db.Brief, as: "brief" }],
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Brief detail not found" });
      }

      const brief = briefDetail.brief;
      const product = await db.Product.findByPk(brief.ProductId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Generate detail using AI
      let aiResult;
      try {
        aiResult = await AIService.generateDetail(
          briefDetail,
          product,
          brief.toneOfVoice || "Friendly"
        );
      } catch (aiError) {
        console.error("Generate Detail Error:", aiError);
        return res.status(500).json({ 
          message: aiError.message || "Gagal generate detail",
          error: process.env.NODE_ENV === 'development' ? aiError.stack : undefined
        });
      }

      // Extract hashtags from caption if hashtags array is empty
      let captionText = aiResult.caption || "";
      let hashtagsArray = Array.isArray(aiResult.hashtags) && aiResult.hashtags.length > 0 
        ? aiResult.hashtags 
        : [];
      
      // If hashtags not in array, try to extract from caption
      if (hashtagsArray.length === 0 && captionText) {
        const hashtagRegex = /#[\w]+/g;
        const foundHashtags = captionText.match(hashtagRegex);
        if (foundHashtags && foundHashtags.length > 0) {
          hashtagsArray = foundHashtags;
          // Remove hashtags from caption text (optional, or keep them)
          // captionText = captionText.replace(hashtagRegex, '').trim();
        }
      }

      // Preserve existing idea content fields when updating detail
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

      // Update brief detail - ensure all AI results are saved to database, preserving idea content fields
      await briefDetail.update({
        detail: {
          ...aiResult.detail || {},
          ...ideaContentFields, // Preserve idea content fields
        },
        caption: captionText,
        hashtags: hashtagsArray,
        status: BRIEF_DETAIL_STATUS.READY,
      });

      await briefDetail.reload();

      res.json(briefDetail);
    } catch (error) {
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
        return res.status(404).json({ message: "Brief not found" });
      }

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  static async updateDetail(req, res, next) {
    try {
      const { id } = req.params; // BriefDetail ID
      const { platform, tag, title, funnel, cta, detail, caption, hashtags, status, scheduledAt } = req.body;

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Brief detail not found" });
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
      const { id } = req.params; // BriefDetail ID
      const { scheduledAt, scheduledTime } = req.body;

      // Validate scheduled date and time
      if (!scheduledAt || !scheduledTime) {
        return res.status(400).json({ message: "Tanggal dan waktu posting wajib diisi" });
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`);

      // Validate date is not in the past
      if (scheduledDateTime < new Date()) {
        return res.status(400).json({ message: "Tanggal dan waktu posting tidak boleh di masa lalu" });
      }

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Brief detail not found" });
      }

      // Check if detail and caption are filled
      if (!briefDetail.detail || !briefDetail.caption) {
        return res.status(400).json({ message: "Detail produksi dan caption harus diisi terlebih dahulu" });
      }

      // Determine status based on user role
      // Admin: directly scheduled, Staff: pending_approval
      const isAdmin = req.user.role === "admin";
      const newStatus = isAdmin ? BRIEF_DETAIL_STATUS.SCHEDULED : BRIEF_DETAIL_STATUS.PENDING_APPROVAL;

      await briefDetail.update({
        status: newStatus,
        scheduledAt: scheduledDateTime,
      });

      // Status is only managed at BriefDetail level, not parent Brief

      res.json(briefDetail);
    } catch (error) {
      next(error);
    }
  }

  static async submitForApproval(req, res, next) {
    try {
      const { id } = req.params;

      const brief = await db.Brief.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!brief) {
        return res.status(404).json({ message: "Brief not found" });
      }

      // Status is only managed at BriefDetail level, not parent Brief

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDetail(req, res, next) {
    try {
      const { id } = req.params; // BriefDetail ID

      const briefDetail = await db.BriefDetail.findOne({
        where: {
          id,
          ProjectId: req.user.ProjectId,
        },
      });

      if (!briefDetail) {
        return res.status(404).json({ message: "Brief detail not found" });
      }

      await briefDetail.destroy();

      res.json({ message: "Brief detail deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BriefController;

