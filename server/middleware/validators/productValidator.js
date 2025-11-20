const validateProductCreate = (req, res, next) => {
  const { name, description, link } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (name.trim().length > 255) {
    errors.push('Product name must be less than 255 characters');
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('Description must be a string');
  }
  if (link !== undefined && link !== null && link !== '') {
    if (typeof link !== 'string') {
      errors.push('Link must be a string');
    } else {
      try {
        new URL(link);
      } catch (e) {
        errors.push('Link must be a valid URL');
      }
    }
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateProductUpdate = (req, res, next) => {
  const { name, description, link } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Product name cannot be empty');
    } else if (name.trim().length > 255) {
      errors.push('Product name must be less than 255 characters');
    }
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('Description must be a string');
  }
  if (link !== undefined && link !== null && link !== '') {
    if (typeof link !== 'string') {
      errors.push('Link must be a string');
    } else {
      try {
        new URL(link);
      } catch (e) {
        errors.push('Link must be a valid URL');
      }
    }
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateProductId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID produk tidak valid' });
  }

  next();
};

module.exports = {
  validateProductCreate,
  validateProductUpdate,
  validateProductId
};

