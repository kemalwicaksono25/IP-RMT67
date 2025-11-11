module.exports = {
  USER_ROLE: {
    ADMIN: "admin",
    STAFF: "staff",
  },
  // Unified status for both Brief and BriefDetail
  BRIEF_STATUS: {
    DRAFT: "draft",
    READY: "ready",
    PENDING_APPROVAL: "pending_approval",
    APPROVED: "approved",
    REJECTED: "rejected",
    SCHEDULED: "scheduled",
  },
  // Keep BRIEF_DETAIL_STATUS for backward compatibility, but use same values
  BRIEF_DETAIL_STATUS: {
    DRAFT: "draft",
    READY: "ready",
    PENDING_APPROVAL: "pending_approval",
    APPROVED: "approved",
    REJECTED: "rejected",
    SCHEDULED: "scheduled",
  },
  FUNNEL_STAGE: {
    AWARENESS: "awareness",
    CONSIDERATION: "consideration",
    RETARGETING_VISITOR: "retargeting_visitor",
    RETARGETING_ATC_NOT_PURCHASE: "retargeting_atc_not_purchase",
    AFTER_PURCHASE: "after_purchase",
    REVENUE: "revenue",
    LOYALTY: "loyalty",
  },
  CONTENT_TAG: {
    VIDEO: "video",
    CAROUSEL: "carousel",
    IMAGE: "image",
  },
};

