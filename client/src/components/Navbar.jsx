import { useAuthStore } from '../store/auth.store';
import { LogOut, User, LogIn, Sparkles } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout');
    navigate('/login');
  };

  // Always render navbar - never return null
  return (
    <nav className="bg-gradient-to-r from-white via-primary-50/30 to-white border-b border-primary-200/50 px-6 py-4 shadow-lg backdrop-blur-sm fixed top-0 left-0 right-0 z-[100] w-full">
      <div className="flex items-center justify-between w-full">
        <Link 
          to={token ? "/dashboard" : "/login"} 
          className="flex items-center gap-3 group hover:opacity-90 transition-all"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-600">
              Content Planner
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Pro Writer</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {token && user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-primary-200/50 hover:shadow-lg transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800 leading-tight">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-xs text-primary-600 font-medium capitalize">
                    {user?.role || 'user'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            !isAuthPage && (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-600 bg-white/80 backdrop-blur-sm hover:bg-primary-50 rounded-xl transition-all shadow-md hover:shadow-lg border border-primary-200/50"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

