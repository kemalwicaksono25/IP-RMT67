// Type definitions untuk models dari server

export const UserRole = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

// Unified status for both Brief and BriefDetail
export const BriefStatus = {
  DRAFT: 'draft',
  READY: 'ready',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled',
};

// Keep BriefDetailStatus for backward compatibility, but use same values
export const BriefDetailStatus = {
  DRAFT: 'draft',
  READY: 'ready',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled',
};

export const FunnelStage = {
  AWARENESS: 'awareness',
  CONSIDERATION: 'consideration',
  RETARGETING_VISITOR: 'retargeting_visitor',
  RETARGETING_ATC_NOT_PURCHASE: 'retargeting_atc_not_purchase',
  AFTER_PURCHASE: 'after_purchase',
  REVENUE: 'revenue',
  LOYALTY: 'loyalty',
};

export const ContentTag = {
  VIDEO: 'video',
  CAROUSEL: 'carousel',
  IMAGE: 'image',
};

