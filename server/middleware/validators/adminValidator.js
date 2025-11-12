const validateProjectName = (req, res, next) => {
  const { projectName } = req.body;
  const errors = [];

  if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
    errors.push('Project name is required');
  } else if (projectName.trim().length < 2) {
    errors.push('Project name must be at least 2 characters');
  } else if (projectName.trim().length > 100) {
    errors.push('Project name must be less than 100 characters');
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateApprovalId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID approval tidak valid' });
  }

  next();
};

const validateRejectBrief = (req, res, next) => {
  const { rejectionReason } = req.body;
  const errors = [];

  if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
    errors.push('Rejection reason is required');
  } else if (rejectionReason.trim().length < 5) {
    errors.push('Rejection reason must be at least 5 characters');
  } else if (rejectionReason.length > 500) {
    errors.push('Rejection reason must be less than 500 characters');
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateApproveBrief = (req, res, next) => {
  const { scheduledAt, scheduledTime } = req.body;
  const errors = [];

  if (scheduledAt !== undefined && scheduledAt !== null && scheduledAt !== '') {
    if (typeof scheduledAt !== 'string') {
      errors.push('ScheduledAt must be a string');
    } else {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        errors.push('ScheduledAt must be a valid date');
      }
    }
  }

  if (scheduledTime !== undefined && scheduledTime !== null && scheduledTime !== '') {
    if (typeof scheduledTime !== 'string') {
      errors.push('ScheduledTime must be a string');
    } else {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(scheduledTime)) {
        errors.push('ScheduledTime must be in HH:MM format');
      }
    }
  }

  if (scheduledAt && scheduledTime) {
    // Parse tanggal dan waktu dengan mempertimbangkan timezone lokal server
    const [year, month, day] = scheduledAt.split('-').map(Number);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(year, month - 1, day, hours, minutes);
    
    if (isNaN(scheduledDateTime.getTime())) {
      errors.push('Invalid scheduled date or time format');
    } else {
      const now = new Date();
      // Berikan buffer 1 menit untuk menghindari masalah precision
      if (scheduledDateTime.getTime() < now.getTime() - 60000) {
        errors.push('Tanggal dan waktu posting tidak boleh di masa lalu');
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
  validateProjectName,
  validateApprovalId,
  validateRejectBrief,
  validateApproveBrief
};

