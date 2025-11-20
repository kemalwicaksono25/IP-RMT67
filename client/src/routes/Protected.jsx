import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Loader from '../components/Loader';

export default function Protected({ children, roles }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [isChecking, setIsChecking] = useState(true);

  // Helper function untuk mendapatkan token dari localStorage
  const getTokenFromStorage = () => {
    try {
      const authStorage = localStorage.getItem('persist:auth-storage');
      if (!authStorage) {
        return null;
      }
      
      const parsed = JSON.parse(authStorage);
      if (!parsed.auth) {
        return null;
      }
      
      const authData = JSON.parse(parsed.auth);
      const tokenFromStorage = authData?.token;
      
      if (tokenFromStorage && typeof tokenFromStorage === 'string' && tokenFromStorage.trim() !== '') {
        return tokenFromStorage;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Cek token dari localStorage sebagai fallback jika Redux state belum ter-rehydrate
  useEffect(() => {
    if (!isChecking) return;
    
    // Cek token dari Redux state terlebih dahulu
    if (token && typeof token === 'string' && token.trim() !== '') {
      setIsChecking(false);
      return;
    }

    // Jika token belum ada di Redux state, cek localStorage
    const tokenFromStorage = getTokenFromStorage();
    
    if (tokenFromStorage) {
      // Token ada di localStorage, tunggu sebentar untuk rehydrate
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 500);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
    
    // Token tidak ditemukan, tunggu lebih lama untuk memastikan rehydrate selesai
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1000); // Tunggu lebih lama untuk rehydrate
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token, isChecking]);

  // Tampilkan loading saat masih checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Cek token dari Redux state atau localStorage
  let hasToken = !!(token && typeof token === 'string' && token.trim() !== '');
  
  if (!hasToken) {
    const tokenFromStorage = getTokenFromStorage();
    hasToken = !!tokenFromStorage;
  }

  // Jika token kosong atau null, redirect ke login
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada roles requirement dan user tidak memiliki role yang sesuai
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

