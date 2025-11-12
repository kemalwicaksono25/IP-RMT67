import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { store, persistor } from '../../store';
import { login as loginAction } from '../../store/authSlice';
import { login } from '../../services/auth.api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

export default function Login() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect jika sudah login
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || formData.email.trim() === '') {
      toast.error('Email wajib diisi');
      return;
    }
    
    if (!formData.password || formData.password.trim() === '') {
      toast.error('Password wajib diisi');
      return;
    }
    
    setLoading(true);

    try {
      const response = await login(formData);
      
      const { access_token, user: userFromResponse } = response.data;

      if (!access_token) {
        toast.error('Token tidak diterima dari server');
        setLoading(false);
        return;
      }

      // Gunakan data user dari response jika tersedia, jika tidak decode dari JWT
      let userData;
      if (userFromResponse) {
        userData = userFromResponse;
      } else {
        try {
          const payload = JSON.parse(atob(access_token.split('.')[1]));
          userData = {
            id: payload.id,
            email: payload.email,
            name: payload.name || formData.email.split('@')[0],
            role: payload.role,
            ProjectId: payload.ProjectId,
            projectName: null,
          };
        } catch (error) {
          userData = {
            email: formData.email,
            name: formData.email.split('@')[0],
            role: 'staff',
            projectName: null,
          };
        }
      }

      // Dispatch login action
      dispatch(loginAction({
        user: userData,
        token: access_token,
      }));

      // Force flush Redux Persist untuk memastikan data tersimpan ke localStorage
      await persistor.flush();

      // Tunggu lebih lama untuk memastikan Redux Persist menyimpan dan rehydrate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verifikasi token tersimpan dengan membaca dari store
      const currentState = store.getState();
      
      // Verifikasi juga dari localStorage
      const authStorage = localStorage.getItem('persist:auth-storage');
      
      if (!currentState.auth.token || currentState.auth.token.trim() === '') {
        // Coba ambil dari localStorage sebagai fallback
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            const authData = JSON.parse(parsed.auth);
            if (!authData.token || authData.token.trim() === '') {
              toast.error('Gagal menyimpan session. Silakan coba lagi.');
              setLoading(false);
              return;
            }
          } catch (e) {
            toast.error('Gagal menyimpan session. Silakan coba lagi.');
            setLoading(false);
            return;
          }
        } else {
          toast.error('Gagal menyimpan session. Silakan coba lagi.');
          setLoading(false);
          return;
        }
      }

      toast.success('Login berhasil!');
      setFormData({ email: '', password: '' });
      
      // Tunggu sebentar lagi sebelum navigate untuk memastikan semua state ter-update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect ke dashboard - Protected route akan handle token check
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Email atau password salah';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak dapat terhubung ke server');
      } else {
        toast.error('Login gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Content Planner
        </h1>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader size="sm" /> : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
