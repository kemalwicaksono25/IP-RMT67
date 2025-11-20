const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRegister = (req, res, next) => {
  const { name, email, password, projectName } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validateEmail(email.trim())) {
    errors.push('Email must be a valid email address');
  } else if (email.trim().length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }
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

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validateEmail(email.trim())) {
    errors.push('Email must be a valid email address');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

const validateAddStaff = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validateEmail(email.trim())) {
    errors.push('Email must be a valid email address');
  } else if (email.trim().length > 255) {
    errors.push('Email must be less than 255 characters');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    const firstError = errors[0];
    return res.status(400).json({ message: firstError, errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAddStaff
};

