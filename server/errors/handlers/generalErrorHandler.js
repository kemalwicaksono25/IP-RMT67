const handleCastError = (err) => {
  return {
    statusCode: 400,
    message: `Data ${err.path} tidak valid`
  };
};

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return {
      statusCode: 400,
      message: 'Ukuran file terlalu besar'
    };
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return {
      statusCode: 400,
      message: 'Terlalu banyak file'
    };
  }
  return {
    statusCode: 400,
    message: 'Gagal mengupload file',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
};

const handleDefaultError = (err) => {
  // Jika error message sudah user-friendly, gunakan langsung
  // Jika tidak, gunakan pesan default
  let message = err.message || 'Terjadi kesalahan pada server';
  
  // Jika error message terlalu teknis, ganti dengan pesan yang lebih user-friendly
  if (message.includes('Sequelize') || message.includes('SQL') || message.includes('database')) {
    message = 'Terjadi kesalahan pada database';
  } else if (message.includes('JSON') || message.includes('parse')) {
    message = 'Format data tidak valid';
  } else if (message.includes('network') || message.includes('ECONNREFUSED')) {
    message = 'Tidak dapat terhubung ke server';
  }
  
  return {
    statusCode: err.statusCode || err.status || 500,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: {
        stack: err.stack,
        name: err.name,
        details: err.details || err.toString()
      }
    })
  };
};

module.exports = {
  handleCastError,
  handleMulterError,
  handleDefaultError
};

