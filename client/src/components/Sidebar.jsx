import { memo, useState } from 'react';
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
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [loading, setLoading] = useState(false);

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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-[73px] lg:top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-white via-primary-50/20 to-white border-r border-primary-200/50 transform transition-transform duration-300 ease-in-out overflow-hidden shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 lg:pt-[50px] border-b border-primary-200/50 flex-shrink-0 bg-gradient-to-r from-primary-600/5 to-primary-700/5">
            <h2 className="text-lg font-bold text-primary-600">
              Menu
            </h2>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:shadow-md'
                  }`}
                >
                  <div className={`${active ? 'bg-white/20' : 'bg-primary-100'} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-primary-600'}`} />
                  </div>
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {user && user.role === 'admin' && (
              <>
                <div className="pt-6 mt-4 border-t border-primary-200/50">
                  <p className="px-4 text-xs font-bold text-primary-600 uppercase mb-3 tracking-wider">
                    Admin Panel
                  </p>
                </div>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 transform scale-[1.02]'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:shadow-md'
                      }`}
                    >
                      <div className={`${active ? 'bg-white/20' : 'bg-primary-100'} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      <span className={`font-medium ${active ? 'text-white' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Detail Akun di Bawah Sidebar */}
          {user && (
            <div className="border-t border-primary-200/50 p-2 bg-gradient-to-br from-white via-primary-50/30 to-white flex-shrink-0 backdrop-blur-sm">
              <h3 className="text-[10px] font-bold text-primary-600 uppercase mb-1.5 tracking-wider px-1">Detail Akun</h3>
              <div className="space-y-1.5">
                {/* Project Name */}
                <div className="group relative bg-white/60 backdrop-blur-sm rounded-lg p-1.5 border border-primary-200/50 hover:border-primary-300/50 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                      <Folder className="w-3 h-3 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-gray-500 mb-0.5">Project</p>
                      <p className="text-[11px] font-semibold text-gray-900 truncate" title={user?.projectName || 'Belum ada project'}>
                        {user?.projectName || 'Belum ada project'}
                      </p>
                    </div>
                    {user?.role === 'admin' && (
                      <button
                        onClick={handleOpenEdit}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-primary-100 rounded-lg"
                        title="Edit nama project"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-primary-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* User Name & Role */}
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1.5 border border-primary-200/50 hover:border-primary-300/50 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                      <User className="w-3 h-3 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-gray-500 mb-0.5">Nama</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-semibold text-gray-900 truncate">{user?.name || '-'}</p>
                        <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                          user?.role === 'admin'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <Shield className={`w-2 h-2 ${
                            user?.role === 'admin'
                              ? 'text-primary-600'
                              : 'text-emerald-600'
                          }`} />
                          <span className="capitalize">{user?.role || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1.5 border border-primary-200/50 hover:border-primary-300/50 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                      <Mail className="w-3 h-3 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-gray-500 mb-0.5">Email</p>
                      <p className="text-[11px] font-semibold text-gray-900 truncate">{user?.email || '-'}</p>
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
          <p className="text-sm text-gray-600">
            Ubah nama project Anda. Perubahan ini akan terlihat oleh semua anggota tim.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Project *
            </label>
            <input
              type="text"
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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

