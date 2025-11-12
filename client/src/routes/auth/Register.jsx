import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login as loginAction } from '../../store/authSlice';
import { register } from '../../services/auth.api';
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
      const response = await register({
        ...tempFormData,
        projectName: projectName.trim(),
      });
      const { access_token, id, email, name, role, ProjectId, projectName: projectNameFromResponse } = response.data;

      dispatch(loginAction({
        user: { id, email, name, role, ProjectId, projectName: projectNameFromResponse },
        token: access_token,
      }));

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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
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
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader size="sm" /> : 'Lanjutkan'}
            </button>
          </form>
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
              Nama Project *
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
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleProjectSubmit}
              disabled={loading || !projectName.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader size="sm" /> : 'Buat Project'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

