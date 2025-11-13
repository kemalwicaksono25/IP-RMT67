import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { store, persistor } from '../../store';
import { login as loginAction } from '../../store/authSlice';
import { register, googleLogin } from '../../services/auth.api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

export default function Register() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [tempFormData, setTempFormData] = useState(null);

  // Redirect jika sudah login
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form pertama
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Harap lengkapi semua field');
      return;
    }

    // Simpan data form dan tampilkan modal nama project
    setTempFormData(formData);
    setShowProjectModal(true);
  };

  const handleProjectSubmit = async () => {
    if (!projectName || projectName.trim() === '') {
      toast.error('Nama project wajib diisi');
      return;
    }

    setLoading(true);
    setShowProjectModal(false);

    try {
      // Normal registration flow
      const response = await register({
        ...tempFormData,
        projectName: projectName.trim(),
      });
      const { access_token, id, email, name, role, ProjectId, projectName: projectNameFromResponse } = response.data;

      dispatch(loginAction({
        user: { id, email, name, role, ProjectId, projectName: projectNameFromResponse },
        token: access_token,
      }));

      await persistor.flush();
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Registrasi berhasil!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      toast.error(errorMessage);
      setShowProjectModal(true); // Tampilkan kembali modal jika terjadi error
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(async (response) => {
    if (!response.credential) {
      toast.error('Gagal mendapatkan token dari Google');
      return;
    }

    setLoading(true);

    try {
      const result = await googleLogin(response.credential);
      
      const { access_token, user: userFromResponse } = result.data;

      if (!access_token) {
        toast.error('Token tidak diterima dari server');
        setLoading(false);
        return;
      }

      let userData;
      if (userFromResponse) {
        userData = userFromResponse;
      } else {
        try {
          const payload = JSON.parse(atob(access_token.split('.')[1]));
          userData = {
            id: payload.id,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            role: payload.role,
            ProjectId: payload.ProjectId,
            projectName: null,
          };
        } catch (error) {
          userData = {
            email: userFromResponse?.email || '',
            name: userFromResponse?.name || '',
            role: 'staff',
            projectName: null,
          };
        }
      }

      // Backend sudah auto-create project untuk Google login, jadi seharusnya selalu ada ProjectId
      // Tapi handle edge case jika tidak ada
      if (!userData.ProjectId) {
        toast.error('Project tidak ditemukan. Silakan hubungi administrator.');
        setLoading(false);
        return;
      }

      dispatch(loginAction({
        user: userData,
        token: access_token,
      }));

      await persistor.flush();
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentState = store.getState();
      if (!currentState.auth.token || currentState.auth.token.trim() === '') {
        toast.error('Gagal menyimpan session. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      toast.success('Login berhasil!');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Login dengan Google gagal';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak dapat terhubung ke server');
      } else {
        toast.error('Login dengan Google gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (token) {
      return;
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });
      const buttonDiv = document.getElementById('google-signin-button-register');
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
        });
      }
    }
  }, [handleGoogleSignIn, token]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
            Daftar Akun Baru
          </h1>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? <Loader size="sm" /> : 'Lanjutkan'}
            </button>
          </form>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">atau</span>
              </div>
            </div>
            
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="mt-4">
                <div id="google-signin-button-register" className="flex justify-center w-full"></div>
              </div>
            )}
          </div>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Modal untuk input nama project */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setProjectName('');
        }}
        title="Buat Project Baru"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sebagai admin baru, Anda perlu membuat project untuk mengelola konten Anda.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Contoh: Project Marketing 2025"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleProjectSubmit();
                }
              }}
            />
            <p className="mt-1 text-xs text-gray-500">
              Nama project akan digunakan untuk mengidentifikasi workspace Anda
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowProjectModal(false);
                setProjectName('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleProjectSubmit}
              disabled={loading || !projectName.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? <Loader size="sm" /> : 'Buat Project'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

