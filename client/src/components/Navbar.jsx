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
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
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
                    className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-primary-200/50 hover:shadow-xl hover:border-primary-400 transition-all hover:bg-white hover:scale-105"
                  >
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                    {readyToSubmitIdeas > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                        {readyToSubmitIdeas > 9 ? '9+' : readyToSubmitIdeas}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotification && (
                    <>
                      {/* Backdrop untuk mobile */}
                      <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
                        onClick={() => setShowNotification(false)}
                      />
                      <div className="fixed sm:absolute right-2 sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-3 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-primary-100 z-50 max-h-[calc(100vh-5rem)] sm:max-h-[600px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header dengan gradient elegan */}
                      <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-800 p-4 sm:p-5 text-white overflow-hidden flex-shrink-0">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-400/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
                        
                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex-shrink-0">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm sm:text-lg mb-0.5 truncate">Brief Siap Submit</h3>
                              <p className="text-xs text-gray-300 font-medium truncate">{readyToSubmitIdeas} ide konten siap</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowNotification(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="overflow-y-auto flex-1 p-3 sm:p-4 bg-gradient-to-b from-white to-primary-50/30 min-h-0">
                        {briefsReadyToSubmit.length > 0 ? (
                          <div className="space-y-3">
                            {briefsReadyToSubmit.filter(b => b && b.id && b.readyDetails && Array.isArray(b.readyDetails)).map((brief) => {
                              const readyDetails = brief.readyDetails || [];
                              return (
                                <div
                                  key={brief.id}
                                  className="group relative bg-white rounded-xl p-3 sm:p-4 border-2 border-primary-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  {/* Decorative gradient corner */}
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-50/50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                          <div className="p-1 sm:p-1.5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex-shrink-0">
                                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
                                          </div>
                                          <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                                            Brief #{brief.id}
                                          </h4>
                                        </div>
                                        {brief.product && brief.product.name && (
                                          <p className="text-xs text-gray-600 truncate mb-1.5 sm:mb-2 leading-relaxed">
                                            {brief.product.name}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary-50 text-primary-700 rounded-lg text-[10px] sm:text-xs font-semibold border border-primary-200 whitespace-nowrap">
                                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            {readyDetails.length} ide siap
                                          </span>
                                        </div>
                                      </div>
                                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 shadow-md">
                                        {readyDetails.length}
                                      </span>
                                    </div>
                                    <Link
                                      to={`/briefs/${brief.id}`}
                                      onClick={() => setShowNotification(false)}
                                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                                    >
                                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span className="whitespace-nowrap">Lihat & Submit</span>
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Clock className="w-8 h-8 text-primary-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">Tidak ada brief siap submit</p>
                            <p className="text-xs text-gray-500">Semua brief sudah diproses</p>
                          </div>
                        )}
                      </div>
                    </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-primary-200/50 hover:shadow-lg transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-full flex items-center justify-center">
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
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-800 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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

