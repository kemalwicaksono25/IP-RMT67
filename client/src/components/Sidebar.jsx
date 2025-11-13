import { memo, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Package, FileText, Calendar, Users, X, User, Mail, Shield, Folder, Edit2 } from 'lucide-react';
import { toggleSidebar } from '../store/uiSlice';
import { setUser } from '../store/authSlice';
import { updateProjectName } from '../services/admin.api';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Loader from './Loader';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Produk', icon: Package },
  { path: '/briefs/new', label: 'Buat Brief', icon: FileText },
  { path: '/calendar', label: 'Kalender', icon: Calendar },
];

const adminMenuItems = [
  { path: '/admin/approvals', label: 'Approval', icon: FileText },
  { path: '/settings/team', label: 'Tim', icon: Users },
];

function Sidebar() {
  const location = useLocation();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);
  const briefs = useSelector((state) => state.brief.briefs);
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        // Tambahkan 1px buffer untuk memastikan tidak ada tumpang tindih
        setNavbarHeight(navbar.offsetHeight + 1);
      }
    };

    // Tunggu sedikit untuk memastikan navbar sudah di-render
    const timer = setTimeout(updateNavbarHeight, 100);
    updateNavbarHeight();
    
    window.addEventListener('resize', updateNavbarHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  // Hitung pending approvals count dari Redux store (realtime seperti notifikasi)
  const pendingCount = useMemo(() => {
    if (!user || user.role !== 'admin' || !briefs || !Array.isArray(briefs)) return 0;
    
    return briefs.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      const pendingDetails = brief.details.filter(d => d && d.status === 'pending_approval');
      return total + pendingDetails.length;
    }, 0);
  }, [briefs, user]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleOpenEdit = () => {
    setProjectNameInput(user?.projectName || '');
    setShowEditModal(true);
  };

  const handleUpdateProjectName = async () => {
    if (!projectNameInput || projectNameInput.trim() === '') {
      toast.error('Nama project wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await updateProjectName(projectNameInput.trim());
      const updatedProjectName = response.data.name;

      // Update user di store
      dispatch(setUser({
        ...user,
        projectName: updatedProjectName,
      }));

      toast.success('Nama project berhasil diupdate');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate nama project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile overlay - hanya muncul di mobile dan ketika sidebar terbuka */}
      {sidebarOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[40] lg:hidden"
          style={{ top: `${navbarHeight}px` }}
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 z-[50] w-72 sm:w-64 lg:w-64 bg-gradient-to-br from-white via-primary-50/20 to-primary-50/10 border-r border-primary-200/50 transform transition-transform duration-300 ease-in-out overflow-hidden shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ top: `${navbarHeight}px` }}
      >
        <div className="flex flex-col h-full relative z-10 bg-white/95">
          <div className="flex items-center justify-between p-4 sm:p-5 lg:pt-6 border-b border-primary-200/50 flex-shrink-0 bg-gradient-to-r from-primary-600/10 via-primary-600/5 to-primary-600/5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg">
                <LayoutDashboard className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Menu
              </h2>
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden text-gray-700 hover:text-primary-700 hover:bg-primary-50 p-2 rounded-lg transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 sm:p-5 lg:p-4 overflow-y-auto min-h-0">
            <div className="space-y-2.5 lg:space-y-2.5">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isLastMenuItem = index === menuItems.length - 1;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      // Auto close sidebar on mobile when clicking menu item
                      if (window.innerWidth < 1024) {
                        dispatch(toggleSidebar());
                      }
                    }}
                    className={`group relative flex items-center gap-3.5 lg:gap-3 px-4 sm:px-5 lg:px-4 py-3.5 sm:py-4 lg:py-3.5 rounded-xl transition-all duration-300 active:scale-95 ${
                      active
                        ? 'bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/40 transform scale-[1.02]'
                        : 'text-gray-800 hover:bg-gradient-to-r hover:from-primary-50/80 hover:to-primary-50/80 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                  >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 sm:h-10 lg:h-8 bg-white rounded-r-full shadow-lg"></div>
                  )}
                  <div className={`relative ${active ? 'bg-white/20' : 'bg-gradient-to-br from-primary-100 to-primary-200'} p-2.5 sm:p-3 lg:p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <Icon className={`w-6 h-6 lg:w-5 lg:h-5 ${active ? 'text-white' : 'text-primary-700'} transition-colors`} />
                    {active && (
                      <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                    )}
                  </div>
                  <span className={`text-base sm:text-lg lg:text-base font-semibold ${active ? 'text-white' : 'text-gray-800'} transition-colors`}>
                    {item.label}
                  </span>
                    {active && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {user && user.role === 'admin' && (
              <>
                <div className="mt-10 sm:mt-16 lg:mt-10 border-t-2 border-primary-200/50 relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-300 to-transparent"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-md">
                      Admin Panel
                    </div>
                  </div>
                  <div className="pt-6 sm:pt-7"></div>
                </div>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const showCount = item.path === '/admin/approvals' && pendingCount > 0;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        // Auto close sidebar on mobile when clicking menu item
                        if (window.innerWidth < 1024) {
                          dispatch(toggleSidebar());
                        }
                      }}
                      className={`group relative flex items-center gap-3.5 lg:gap-3 px-4 sm:px-5 lg:px-4 py-3.5 sm:py-4 lg:py-3.5 rounded-xl transition-all duration-300 active:scale-95 ${
                        active
                          ? 'bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/40 transform scale-[1.02]'
                          : 'text-gray-800 hover:bg-gradient-to-r hover:from-primary-50/80 hover:to-primary-50/80 hover:shadow-lg hover:scale-[1.01]'
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 lg:h-8 bg-white rounded-r-full shadow-lg"></div>
                      )}
                      <div className={`relative ${active ? 'bg-white/20' : 'bg-gradient-to-br from-primary-100 to-primary-200'} p-2.5 sm:p-3 lg:p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <Icon className={`w-6 h-6 lg:w-5 lg:h-5 ${active ? 'text-white' : 'text-primary-700'} transition-colors`} />
                        {active && (
                          <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                        )}
                      </div>
                      <span className={`text-base sm:text-lg lg:text-base font-semibold ${active ? 'text-white' : 'text-gray-800'} transition-colors flex-1`}>
                        {item.label}
                      </span>
                      {showCount && (
                        <div className={`ml-auto flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${
                          active 
                            ? 'bg-white/30 text-white' 
                            : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                        } shadow-md shadow-primary-500/40`}>
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </div>
                      )}
                      {active && !showCount && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Detail Akun di Bawah Sidebar */}
          {user && (
            <div className="border-t-2 border-primary-200/50 p-3 sm:p-4 lg:p-2 bg-gradient-to-br from-white via-primary-50/20 to-primary-50/10 flex-shrink-0 shadow-inner relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-300 to-transparent"></div>
              <div className="flex items-center gap-2 lg:gap-1.5 mb-2 sm:mb-3 lg:mb-1.5">
                <div className="p-1.5 lg:p-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-white" />
                </div>
                <h3 className="text-[10px] sm:text-xs lg:text-[10px] font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent uppercase tracking-wider">
                  Detail Akun
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2 lg:space-y-1">
                {/* Project Name */}
                <div className="group relative bg-white rounded-lg sm:rounded-xl lg:rounded-lg p-2 sm:p-3 lg:p-1.5 border-2 border-primary-200/50 hover:border-primary-400/70 hover:shadow-lg transition-all duration-300 active:scale-95">
                  <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-1.5">
                    <div className="p-1.5 sm:p-2 lg:p-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg sm:rounded-xl lg:rounded-lg shadow-md group-hover:scale-110 transition-transform">
                      <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0.5 sm:mb-1 lg:mb-0.5 font-medium">Project</p>
                      <p className="text-[11px] sm:text-xs lg:text-[10px] font-bold text-gray-800 truncate" title={user?.projectName || 'Belum ada project'}>
                        {user?.projectName || 'Belum ada project'}
                      </p>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        onClick={handleOpenEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-1.5 lg:p-0.5 hover:bg-primary-100 rounded-lg hover:scale-110 active:scale-95"
                        title="Edit nama project"
                      >
                        <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-2.5 lg:h-2.5 text-primary-700" />
                      </button>
                    )}
                  </div>
                </div>

                {/* User Name & Role */}
                <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-lg p-2 sm:p-3 lg:p-1.5 border-2 border-primary-200/50 hover:border-primary-400/70 hover:shadow-lg transition-all duration-300 active:scale-95">
                  <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-1.5">
                    <div className="p-1.5 sm:p-2 lg:p-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg sm:rounded-xl lg:rounded-lg shadow-md">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0.5 sm:mb-1 lg:mb-0.5 font-medium">Nama</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-1 flex-wrap">
                        <p className="text-[11px] sm:text-xs lg:text-[10px] font-bold text-gray-800 truncate">{user?.name || '-'}</p>
                        <div className={`inline-flex items-center gap-0.5 sm:gap-1 lg:gap-0.5 px-1.5 sm:px-2 lg:px-1 py-0.5 sm:py-1 lg:py-0.5 rounded-full text-[9px] sm:text-[10px] lg:text-[8px] font-bold flex-shrink-0 shadow-md ${
                          user?.role === 'admin'
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                            : 'bg-gray-800 text-primary-400'
                        }`}>
                          <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-2 lg:h-2" />
                          <span className="capitalize">{user?.role || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-lg p-2 sm:p-3 lg:p-1.5 border-2 border-primary-200/50 hover:border-primary-400/70 hover:shadow-lg transition-all duration-300 active:scale-95">
                  <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-1.5">
                    <div className="p-1.5 sm:p-2 lg:p-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg sm:rounded-xl lg:rounded-lg shadow-md">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0.5 sm:mb-1 lg:mb-0.5 font-medium">Email</p>
                      <p className="text-[11px] sm:text-xs lg:text-[10px] font-bold text-gray-800 truncate">{user?.email || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Modal Edit Project Name */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setProjectNameInput('');
        }}
        title="Edit Nama Project"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Ubah nama project Anda. Perubahan ini akan terlihat oleh semua anggota tim.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Nama Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Contoh: Project Marketing 2025"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUpdateProjectName();
                }
              }}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setProjectNameInput('');
              }}
              className="flex-1 px-4 py-2.5 text-sm border border-primary-200 text-gray-800 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleUpdateProjectName}
              disabled={loading || !projectNameInput.trim()}
              className="flex-1 px-4 py-2.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? <Loader size="sm" /> : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </aside>
    </>
  );
}

// Memoize Sidebar untuk mencegah re-render yang tidak perlu
export default memo(Sidebar);

