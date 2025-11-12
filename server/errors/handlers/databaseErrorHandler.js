const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path,
    message: e.message,
    value: e.value
  }));

  const firstError = errors[0]?.message || 'Data tidak valid';
  return {
    statusCode: 400,
    message: firstError,
    errors
  };
};

const handleSequelizeUniqueConstraintError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path,
    message: e.message,
    value: e.value
  }));

  const firstError = errors[0]?.message || 'Data sudah ada';
  return {
    statusCode: 400,
    message: firstError,
    errors
  };
};

const handleSequelizeForeignKeyConstraintError = (err) => {
  return {
    statusCode: 400,
    message: 'Data tidak dapat dihapus karena masih digunakan',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
};

const handleSequelizeDatabaseError = (err) => {
  return {
    statusCode: 500,
    message: 'Terjadi kesalahan pada database',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
};

module.exports = {
  handleSequelizeValidationError,
  handleSequelizeUniqueConstraintError,
  handleSequelizeForeignKeyConstraintError,
  handleSequelizeDatabaseError
};

