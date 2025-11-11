import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { login } from '../../services/auth.api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
            const response = await login(formData);
            const { access_token, user: userFromResponse } = response.data;

            // Use user data from response if available, otherwise decode from JWT
            let userData;
            if (userFromResponse) {
              userData = userFromResponse;
            } else {
              // Decode JWT to get user info
              try {
                const payload = JSON.parse(atob(access_token.split('.')[1]));
                userData = {
                  id: payload.id,
                  email: payload.email,
                  name: payload.name || formData.email.split('@')[0],
                  role: payload.role,
                  ProjectId: payload.ProjectId,
                  projectName: null, // Will be fetched if needed
                };
              } catch (error) {
                console.error('Error decoding JWT:', error);
                // Fallback
                userData = {
                  email: formData.email,
                  name: formData.email.split('@')[0],
                  role: 'staff',
                  projectName: null,
                };
              }
            }

            setAuth({
              token: access_token,
              user: userData,
            });

      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login gagal');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
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
              required
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

