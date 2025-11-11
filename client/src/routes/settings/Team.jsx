import { useState, useEffect } from 'react';
import { addStaff } from '../../services/auth.api';
import { getTeam } from '../../services/admin.api';
import { Users, UserCheck, UserPlus, Sparkles, Mail, Calendar, Shield } from 'lucide-react';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Team() {
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await getTeam();
      setTeamMembers(response.data);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addStaff(formData);
      toast.success('Staff berhasil ditambahkan');
      setFormData({ name: '', email: '', password: '' });
      fetchTeam(); // Refresh team list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan staff');
    } finally {
      setLoading(false);
    }
  };

  const getAdminCount = () => {
    return teamMembers.filter(m => m.role === 'admin').length;
  };

  const getStaffCount = () => {
    return teamMembers.filter(m => m.role === 'staff').length;
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Kelola Tim</h1>
              <p className="text-primary-100 text-sm mt-1">Tambah dan kelola anggota tim Anda</p>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm text-primary-100">Total Tim</span>
            </div>
            <p className="text-2xl font-bold">{teamMembers.length}</p>
            <p className="text-xs text-primary-200 mt-1">Anggota tim</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm text-primary-100">Admin</span>
            </div>
            <p className="text-2xl font-bold">{getAdminCount()}</p>
            <p className="text-xs text-primary-200 mt-1">Administrator</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm text-primary-100">Staff</span>
            </div>
            <p className="text-2xl font-bold">{getStaffCount()}</p>
            <p className="text-xs text-primary-200 mt-1">Anggota staff</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Tambah Staff */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Tambah Staff
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? <Loader size="sm" /> : 'Tambah Staff'}
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Anggota Tim */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Daftar Anggota Tim
            </h2>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {teamMembers.length === 0 ? (
              <EmptyState
                title="Belum ada anggota tim"
                description="Mulai dengan menambahkan staff pertama Anda"
              />
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-primary-300 p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          member.role === 'admin'
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {member.role === 'admin' ? (
                            <Shield className="w-5 h-5" />
                          ) : (
                            <UserPlus className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                            member.role === 'admin'
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {member.role === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3" />
                                Admin
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                Staff
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Bergabung: {formatDate(member.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

