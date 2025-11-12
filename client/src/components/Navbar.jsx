import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LogOut, User, LogIn, Sparkles, Clock, FileText, Send, X } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const briefs = useSelector((state) => state.brief.briefs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [showNotification, setShowNotification] = useState(false);

  // Filter brief yang memiliki detail
  const briefsWithDetails = useMemo(() => {
    if (!briefs || !Array.isArray(briefs)) return [];
    return briefs.filter(brief => brief && brief.details && Array.isArray(brief.details) && brief.details.length > 0);
  }, [briefs]);

  // Hitung ide konten dengan status 'ready' (belum disubmit)
  const readyToSubmitIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      const readyDetails = brief.details.filter(d => d && d.status === 'ready');
      return total + readyDetails.length;
    }, 0);
  }, [briefsWithDetails]);

  // Dapatkan brief yang memiliki detail dengan status 'ready'
  const briefsReadyToSubmit = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return [];
    try {
      return briefsWithDetails
        .filter(brief => {
          if (!brief || !brief.details || !Array.isArray(brief.details)) return false;
          return brief.details.some(d => d && d.status === 'ready');
        })
        .map(brief => ({
          ...brief,
          readyDetails: brief.details.filter(d => d && d.status === 'ready'),
        }))
        .sort((a, b) => {
          if (!a || !b) return 0;
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bDate - aDate;
        });
    } catch (error) {
      return [];
    }
  }, [briefsWithDetails]);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotification && !event.target.closest('.notification-container')) {
        setShowNotification(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotification]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Berhasil logout');
    navigate('/login');
  };

  // Selalu render navbar - jangan pernah return null
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
              {/* Notification Badge */}
              {readyToSubmitIdeas > 0 && (
                <div className="relative notification-container">
                  <button
                    onClick={() => setShowNotification(!showNotification)}
                    className="relative flex items-center justify-center w-11 h-11 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-primary-200/50 hover:shadow-lg transition-all hover:bg-white"
                  >
                    <Clock className="w-5 h-5 text-gray-800" />
                    {readyToSubmitIdeas > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">
                        {readyToSubmitIdeas > 9 ? '9+' : readyToSubmitIdeas}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotification && (
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          <div>
                            <h3 className="font-bold text-lg">Brief Siap Submit</h3>
                            <p className="text-xs text-gray-300">{readyToSubmitIdeas} ide konten siap</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowNotification(false)}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="overflow-y-auto flex-1 p-4">
                        {briefsReadyToSubmit.length > 0 ? (
                          <div className="space-y-3">
                            {briefsReadyToSubmit.filter(b => b && b.id && b.readyDetails && Array.isArray(b.readyDetails)).map((brief) => {
                              const readyDetails = brief.readyDetails || [];
                              return (
                                <div
                                  key={brief.id}
                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-400 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-gray-800 flex-shrink-0" />
                                        <h4 className="text-sm font-bold text-gray-900 truncate">
                                          Brief #{brief.id}
                                        </h4>
                                      </div>
                                      {brief.product && brief.product.name && (
                                        <p className="text-xs text-gray-600 truncate mb-1">
                                          {brief.product.name}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-800 font-medium">
                                        {readyDetails.length} ide siap submit
                                      </p>
                                    </div>
                                    <span className="px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                                      {readyDetails.length}
                                    </span>
                                  </div>
                                  <Link
                                    to={`/briefs/${brief.id}`}
                                    onClick={() => setShowNotification(false)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-xs font-semibold"
                                  >
                                    <Send className="w-3 h-3" />
                                    Lihat & Submit
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Tidak ada brief siap submit</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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

