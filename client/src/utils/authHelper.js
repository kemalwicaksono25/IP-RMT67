// Helper untuk debug dan verifikasi token
export const getTokenFromStorage = () => {
  try {
    const authStorage = localStorage.getItem('persist:auth-storage');
    if (!authStorage) {
      return null;
    }
    
    const parsed = JSON.parse(authStorage);
    if (!parsed?.auth) {
      return null;
    }
    
    const authData = JSON.parse(parsed.auth);
    let token = authData?.token;
    
    // Handle jika token adalah string yang di-stringify (bisa double stringify)
    if (typeof token === 'string') {
      let cleanToken = token.trim();
      
      // Hapus quotes berulang kali sampai tidak ada lagi
      // Maksimal 10 iterasi untuk menghindari infinite loop
      let maxIterations = 10;
      while (maxIterations > 0 && typeof cleanToken === 'string' && cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        try {
          // Coba parse untuk menghapus satu layer quotes
          const parsed = JSON.parse(cleanToken);
          if (typeof parsed === 'string') {
            cleanToken = parsed.trim();
            maxIterations--;
          } else {
            // Setelah parse bukan string lagi, berarti error
            break;
          }
        } catch (e) {
          // Tidak bisa di-parse, hapus quotes manual
          if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
            cleanToken = cleanToken.slice(1, -1).trim();
            maxIterations--;
          } else {
            break;
          }
        }
      }
      
      // Jika setelah cleaning masih string dan tidak kosong, return
      if (typeof cleanToken === 'string' && cleanToken.trim() !== '') {
        return cleanToken;
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

