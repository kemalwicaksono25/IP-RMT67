import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LogOut, User, LogIn, Sparkles, Clock, FileText, Send, X, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isReadyToSubmit } from '../utils/detailHelper';

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const briefs = useSelector((state) => state.brief.briefs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [showNotification, setShowNotification] = useState(false);
  const [showRejectedNotification, setShowRejectedNotification] = useState(false);
  const [notificationTab, setNotificationTab] = useState('draft'); // 'draft' or 'ready'

  // Filter brief yang memiliki detail
  const briefsWithDetails = useMemo(() => {
    if (!briefs || !Array.isArray(briefs)) return [];
    return briefs.filter(brief => brief && brief.details && Array.isArray(brief.details) && brief.details.length > 0);
  }, [briefs]);

  // Hitung ide konten dengan status 'draft'
  const draftIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      const draftDetails = brief.details.filter(d => d && (d.status || 'draft') === 'draft');
      return total + draftDetails.length;
    }, 0);
  }, [briefsWithDetails]);

  // Hitung ide konten yang benar-benar siap submit (lengkap dan belum final)
  const readyToSubmitIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      const readyDetails = brief.details.filter(d => d && isReadyToSubmit(d));
      return total + readyDetails.length;
    }, 0);
  }, [briefsWithDetails]);

  // Dapatkan brief yang memiliki detail dengan status 'draft'
  const briefsDraft = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return [];
    try {
      return briefsWithDetails
        .filter(brief => {
          if (!brief || !brief.details || !Array.isArray(brief.details)) return false;
          return brief.details.some(d => d && (d.status || 'draft') === 'draft');
        })
        .map(brief => {
          const draftDetails = brief.details.filter(d => d && (d.status || 'draft') === 'draft');
          return {
            ...brief,
            details: draftDetails,
            draftDetails: draftDetails,
          };
        })
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

  // Dapatkan brief yang memiliki detail yang benar-benar siap submit (lengkap dan belum final)
  const briefsReadyToSubmit = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return [];
    try {
      return briefsWithDetails
        .filter(brief => {
          if (!brief || !brief.details || !Array.isArray(brief.details)) return false;
          return brief.details.some(d => d && isReadyToSubmit(d));
        })
        .map(brief => {
          const readyDetails = brief.details.filter(d => d && isReadyToSubmit(d));
          return {
            ...brief,
            details: readyDetails,
            readyDetails: readyDetails,
          };
        })
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

  // Hitung ide konten dengan status 'rejected'
  const rejectedIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      const rejectedDetails = brief.details.filter(d => d && d.status === 'rejected');
      return total + rejectedDetails.length;
    }, 0);
  }, [briefsWithDetails]);

  // Dapatkan brief yang memiliki detail dengan status 'rejected'
  // Hanya tampilkan detail rejected saja, bukan semua detail
  const briefsRejected = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return [];
    try {
      return briefsWithDetails
        .filter(brief => {
          if (!brief || !brief.details || !Array.isArray(brief.details)) return false;
          return brief.details.some(d => d && d.status === 'rejected');
        })
        .map(brief => {
          const rejectedDetails = brief.details.filter(d => d && d.status === 'rejected');
          return {
            ...brief,
            details: rejectedDetails, // Hanya detail rejected yang disimpan
            rejectedDetails: rejectedDetails, // Untuk kompatibilitas
          };
        })
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

  // Auto-open notification based on URL filter (hanya saat pertama kali atau saat filter berubah)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');
    
    // Hanya buka jika ada filter di URL dan halaman adalah brief detail
    if (location.pathname.startsWith('/briefs/') && filter) {
      if (filter === 'draft' || filter === 'ready') {
        // Buka notifikasi dan set tab yang sesuai
        setShowNotification(true);
        setNotificationTab(filter);
      } else if (filter === 'rejected') {
        // Buka notifikasi rejected
        setShowRejectedNotification(true);
      }
    }
  }, [location.pathname, location.search]);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotification && !event.target.closest('.notification-container')) {
        setShowNotification(false);
      }
      if (showRejectedNotification && !event.target.closest('.rejected-notification-container')) {
        setShowRejectedNotification(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotification, showRejectedNotification]);

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
              {/* Notification Badge - Draft & Siap Submit */}
              {(draftIdeas > 0 || readyToSubmitIdeas > 0) && (
                <div className="relative notification-container">
                  <button
                    onClick={() => {
                      setShowNotification(!showNotification);
                      // Set default tab berdasarkan notifikasi yang ada
                      if (draftIdeas > 0) {
                        setNotificationTab('draft');
                      } else if (readyToSubmitIdeas > 0) {
                        setNotificationTab('ready');
                      }
                    }}
                    className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-primary-200/50 hover:shadow-xl hover:border-primary-400 transition-all hover:bg-white hover:scale-105"
                  >
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                    {(draftIdeas + readyToSubmitIdeas) > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                        {(draftIdeas + readyToSubmitIdeas) > 9 ? '9+' : (draftIdeas + readyToSubmitIdeas)}
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
                        
                        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex-shrink-0">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm sm:text-lg mb-0.5 truncate">Notifikasi</h3>
                              <p className="text-xs text-gray-300 font-medium truncate">
                                {notificationTab === 'draft' 
                                  ? `${draftIdeas} ide draft`
                                  : `${readyToSubmitIdeas} ide siap submit`
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowNotification(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Tabs */}
                        <div className="relative z-10 flex gap-2">
                          <button
                            onClick={() => setNotificationTab('draft')}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                              notificationTab === 'draft'
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'bg-white/10 text-white/70 hover:bg-white/15'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Draft</span>
                              {draftIdeas > 0 && (
                                <span className="px-1.5 py-0.5 bg-primary-600 rounded-full text-[10px] font-bold">
                                  {draftIdeas}
                                </span>
                              )}
                            </div>
                          </button>
                          <button
                            onClick={() => setNotificationTab('ready')}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                              notificationTab === 'ready'
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'bg-white/10 text-white/70 hover:bg-white/15'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <Send className="w-3.5 h-3.5" />
                              <span>Siap Submit</span>
                              {readyToSubmitIdeas > 0 && (
                                <span className="px-1.5 py-0.5 bg-primary-600 rounded-full text-[10px] font-bold">
                                  {readyToSubmitIdeas}
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-y-auto flex-1 p-3 sm:p-4 bg-gradient-to-b from-white to-primary-50/30 min-h-0">
                        {notificationTab === 'draft' ? (
                          briefsDraft.length > 0 ? (
                            <div className="space-y-3">
                              {briefsDraft.filter(b => b && b.id && b.draftDetails && Array.isArray(b.draftDetails)).map((brief) => {
                                const draftDetails = brief.draftDetails || [];
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
                                              <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                              {draftDetails.length} ide
                                            </span>
                                          </div>
                                        </div>
                                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 shadow-md">
                                          {draftDetails.length}
                                        </span>
                                      </div>
                                    <Link
                                      to={`/briefs/${brief.id}?filter=draft`}
                                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                                    >
                                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span className="whitespace-nowrap">Lihat Detail</span>
                                    </Link>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-8 h-8 text-primary-400" />
                              </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">Tidak ada brief draft</p>
                            <p className="text-xs text-gray-500">Semua brief sudah diproses</p>
                            </div>
                          )
                        ) : notificationTab === 'ready' ? (
                          briefsReadyToSubmit.length > 0 ? (
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
                                              <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                              {readyDetails.length} ide
                                            </span>
                                          </div>
                                        </div>
                                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 shadow-md">
                                          {readyDetails.length}
                                        </span>
                                      </div>
                                    <Link
                                      to={`/briefs/${brief.id}?filter=ready`}
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
                                <Send className="w-8 h-8 text-primary-400" />
                              </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">Tidak ada brief siap submit</p>
                            <p className="text-xs text-gray-500">Semua brief sudah diproses</p>
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                    </>
                  )}
                </div>
              )}

              {/* Rejected Notification Badge - Terpisah */}
              {rejectedIdeas > 0 && (
                <div className="relative rejected-notification-container">
                  <button
                    onClick={() => setShowRejectedNotification(!showRejectedNotification)}
                    className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-red-200/50 hover:shadow-xl hover:border-red-400 transition-all hover:bg-white hover:scale-105"
                  >
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    {rejectedIdeas > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                        {rejectedIdeas > 9 ? '9+' : rejectedIdeas}
                      </span>
                    )}
                  </button>

                  {/* Rejected Notification Dropdown */}
                  {showRejectedNotification && (
                    <>
                      {/* Backdrop untuk mobile */}
                      <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
                        onClick={() => setShowRejectedNotification(false)}
                      />
                      <div className="fixed sm:absolute right-2 sm:right-0 top-[4.5rem] sm:top-full mt-0 sm:mt-3 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-red-100 z-50 max-h-[calc(100vh-5rem)] sm:max-h-[600px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header dengan gradient elegan */}
                      <div className="relative bg-gradient-to-br from-red-800 via-red-700 to-red-800 p-4 sm:p-5 text-white overflow-hidden flex-shrink-0">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-400/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
                        
                        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm sm:text-lg mb-0.5 truncate">Ditolak</h3>
                              <p className="text-xs text-gray-300 font-medium truncate">
                                {rejectedIdeas} ide ditolak
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowRejectedNotification(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="overflow-y-auto flex-1 p-3 sm:p-4 bg-gradient-to-b from-white to-red-50/30 min-h-0">
                        {briefsRejected.length > 0 ? (
                          <div className="space-y-3">
                            {briefsRejected.filter(b => b && b.id && b.rejectedDetails && Array.isArray(b.rejectedDetails)).map((brief) => {
                              const rejectedDetails = brief.rejectedDetails || [];
                              return (
                                <div
                                  key={brief.id}
                                  className="group relative bg-white rounded-xl p-3 sm:p-4 border-2 border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  {/* Decorative gradient corner */}
                                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-50/50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                          <div className="p-1 sm:p-1.5 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex-shrink-0">
                                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
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
                                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-red-50 text-red-700 rounded-lg text-[10px] sm:text-xs font-semibold border border-red-200 whitespace-nowrap">
                                            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            {rejectedDetails.length} ide
                                          </span>
                                        </div>
                                      </div>
                                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 shadow-md">
                                        {rejectedDetails.length}
                                      </span>
                                    </div>
                                    <Link
                                      to={`/briefs/${brief.id}?filter=rejected`}
                                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                                    >
                                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span className="whitespace-nowrap">Lihat Detail</span>
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">Tidak ada brief ditolak</p>
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

