const { FUNNEL_STAGE } = require('../../helpers/enums');

const validFunnelStages = Object.values(FUNNEL_STAGE);

const validateBriefId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID brief tidak valid' });
  }

  next();
};

const validateBriefDetailId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID detail brief tidak valid' });
  }

  next();
};

const validateGenerateBrief = (req, res, next) => {
  const { ProductId, funnelStage, briefType, toneOfVoice, targetMarket, count } = req.body;
  const errors = [];

  if (!ProductId) {
    errors.push('ProductId is required');
  } else if (isNaN(parseInt(ProductId))) {
    errors.push('ProductId must be a valid number');
  }

  if (!funnelStage) {
    errors.push('FunnelStage is required');
  } else {
    const funnelArray = Array.isArray(funnelStage) 
      ? funnelStage 
      : (typeof funnelStage === 'string' ? funnelStage.split(',').map(s => s.trim()) : [funnelStage]);
    
    if (funnelArray.length === 0) {
      errors.push('FunnelStage cannot be empty');
    }
    
    funnelArray.forEach(stage => {
      if (!validFunnelStages.includes(stage)) {
        errors.push(`Invalid funnel stage: ${stage}. Valid values: ${validFunnelStages.join(', ')}`);
      }
    });
  }

  if (briefType !== undefined && briefType !== null) {
    const briefTypeArray = Array.isArray(briefType)
      ? briefType
      : (typeof briefType === 'string' ? briefType.split(',').map(t => t.trim()).filter(t => t.length > 0) : [briefType]);
    
    if (briefTypeArray.length === 0) {
      errors.push('BriefType cannot be empty if provided');
    }
  }

  if (count !== undefined && count !== null) {
    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum < 1 || countNum > 20) {
      errors.push('Count must be a number between 1 and 20');
    }
  }
  if (targetMarket !== undefined && targetMarket !== null && typeof targetMarket !== 'string') {
    errors.push('TargetMarket must be a string');
  } else if (targetMarket && targetMarket.length > 500) {
    errors.push('TargetMarket must be less than 500 characters');
  }

  if (toneOfVoice !== undefined && toneOfVoice !== null && typeof toneOfVoice !== 'string') {
    errors.push('ToneOfVoice must be a string');
  } else if (toneOfVoice && toneOfVoice.length > 100) {
    errors.push('ToneOfVoice must be less than 100 characters');
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateUpdateBriefDetail = (req, res, next) => {
  const { platform, tag, title, funnel, cta, detail, caption, hashtags, status, scheduledAt } = req.body;
  const errors = [];

  if (platform !== undefined && platform !== null) {
    const validPlatforms = ['TikTok', 'Instagram', 'Shopee', 'Meta', 'YouTube'];
    if (!validPlatforms.includes(platform)) {
      errors.push(`Platform must be one of: ${validPlatforms.join(', ')}`);
    }
  }

  if (tag !== undefined && tag !== null) {
    const validTags = ['video', 'carousel', 'image'];
    if (!validTags.includes(tag)) {
      errors.push(`Tag must be one of: ${validTags.join(', ')}`);
    }
  }

  if (title !== undefined && title !== null) {
    if (typeof title !== 'string') {
      errors.push('Title must be a string');
    } else if (title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }
  }

  if (funnel !== undefined && funnel !== null) {
    if (!validFunnelStages.includes(funnel)) {
      errors.push(`Invalid funnel stage: ${funnel}. Valid values: ${validFunnelStages.join(', ')}`);
    }
  }

  if (cta !== undefined && cta !== null && typeof cta !== 'string') {
    errors.push('CTA must be a string');
  } else if (cta && cta.length > 100) {
    errors.push('CTA must be less than 100 characters');
  }

  if (detail !== undefined && detail !== null && typeof detail !== 'object') {
    errors.push('Detail must be an object');
  }

  if (caption !== undefined && caption !== null && typeof caption !== 'string') {
    errors.push('Caption must be a string');
  } else if (caption && caption.length > 2000) {
    errors.push('Caption must be less than 2000 characters');
  }

  if (hashtags !== undefined && hashtags !== null) {
    if (!Array.isArray(hashtags)) {
      errors.push('Hashtags must be an array');
    } else {
      hashtags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Hashtag at index ${index} must be a string`);
        } else if (tag.length > 100) {
          errors.push(`Hashtag at index ${index} must be less than 100 characters`);
        }
      });
    }
  }

  if (status !== undefined && status !== null) {
    const validStatuses = ['draft', 'ready', 'pending_approval', 'approved', 'rejected', 'scheduled'];
    if (!validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (scheduledAt !== undefined && scheduledAt !== null && scheduledAt !== '') {
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('ScheduledAt must be a valid date');
    }
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateSubmitDetail = (req, res, next) => {
  const { scheduledAt, scheduledTime } = req.body;
  const errors = [];

  if (!scheduledAt || !scheduledTime) {
    errors.push('ScheduledAt and ScheduledTime are required for submission');
  } else {
    const scheduledDate = new Date(`${scheduledAt}T${scheduledTime}`);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Invalid scheduled date or time format');
    } else {
      const now = new Date();
      if (scheduledDate < now) {
        errors.push('Scheduled date cannot be in the past');
      }
    }
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

module.exports = {
  validateBriefId,
  validateBriefDetailId,
  validateGenerateBrief,
  validateUpdateBriefDetail,
  validateSubmitDetail
};

