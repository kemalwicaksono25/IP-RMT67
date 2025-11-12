import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Package, FileText, CheckCircle, Eye, Plus, Calendar, Sparkles, TrendingUp, Clock, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, XCircle, Send, Hourglass } from 'lucide-react';
import { setProducts } from '../../store/productSlice';
import { setBriefs } from '../../store/briefSlice';
import { getProducts } from '../../services/product.api';
import { getBriefs } from '../../services/brief.api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';

export default function Dashboard() {
  const products = useSelector((state) => state.product.products);
  const briefs = useSelector((state) => state.brief.briefs);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    // Pastikan token tersedia sebelum fetch
    // API interceptor akan membaca dari localStorage jika token belum di Redux state
    // Tapi kita tetap cek untuk menghindari request yang tidak perlu
    let hasToken = !!token;
    
    if (!hasToken) {
      // Coba ambil dari localStorage sebagai fallback
      const authStorage = localStorage.getItem('persist:auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const authData = JSON.parse(parsed.auth);
          hasToken = !!authData.token;
        } catch (e) {
          // Error parsing, akan di-handle oleh API interceptor
        }
      }
    }

    if (!hasToken) {
      // Token tidak tersedia, skip fetch (akan di-retry setelah token tersedia)
      return;
    }

    try {
      const [productsRes, briefsRes] = await Promise.all([
        getProducts(),
        getBriefs(),
      ]);
      dispatch(setProducts(Array.isArray(productsRes?.data) ? productsRes.data : []));
      // Pastikan semua brief dan detailnya valid
      const validBriefs = (Array.isArray(briefsRes?.data) ? briefsRes.data : []).filter(brief => brief != null).map(brief => ({
        ...brief,
        details: Array.isArray(brief.details) ? brief.details.filter(d => d != null) : []
      }));
      
      dispatch(setBriefs(validBriefs));
    } catch (error) {
      toast.error('Gagal memuat data');
      dispatch(setProducts([]));
      dispatch(setBriefs([]));
    }
  };

  useEffect(() => {
    // Pastikan token tersedia sebelum fetch
    let hasToken = !!token;
    
    if (!hasToken) {
      // Coba ambil dari localStorage
      const authStorage = localStorage.getItem('persist:auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const authData = JSON.parse(parsed.auth);
          hasToken = !!authData.token && authData.token.trim() !== '';
        } catch (e) {
          // Error parsing
        }
      }
    }

    if (hasToken) {
      fetchData();
    } else {
      // Token belum tersedia, coba lagi setelah delay
      const timer = setTimeout(() => {
        fetchData();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Re-run ketika token tersedia

  // Auto-refresh data setiap 5 detik untuk menjaga statistik tetap update
  useEffect(() => {
    // Hanya setup interval jika token tersedia
    let hasToken = !!token;
    if (!hasToken) {
      const authStorage = localStorage.getItem('persist:auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const authData = JSON.parse(parsed.auth);
          hasToken = !!authData.token && authData.token.trim() !== '';
        } catch (e) {
          // Error parsing
        }
      }
    }

    if (!hasToken) {
      return; // Jangan setup interval jika token tidak tersedia
    }

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // 5 detik untuk update yang lebih cepat

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Re-run ketika token tersedia

  // Dengarkan event storage untuk refresh ketika data berubah di tab/window lain
  useEffect(() => {
    const handleStorageChange = () => {
      fetchData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Juga dengarkan custom events (untuk update di tab yang sama)
    window.addEventListener('briefsUpdated', handleStorageChange);
    window.addEventListener('productsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('briefsUpdated', handleStorageChange);
      window.removeEventListener('productsUpdated', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya setup listeners sekali

  // Filter, Sort, dan Paginate produk
  const filteredAndSortedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    let filtered = products.filter(p => p != null); // Filter produk null/undefined

    // Filter berdasarkan query pencarian (hanya berdasarkan nama/judul)
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) => {
        if (!product || !product.name) return false;
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Filter berdasarkan tipe
    if (filterBy === 'withImage') {
      filtered = filtered.filter((p) => p && p.imageUrl);
    } else if (filterBy === 'withLink') {
      filtered = filtered.filter((p) => p && p.link);
    }

    // Sort
    try {
      if (sortBy === 'newest') {
        filtered.sort((a, b) => {
          if (!a || !b) return 0;
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bDate - aDate;
        });
      } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => {
          if (!a || !b) return 0;
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return aDate - bDate;
        });
      } else if (sortBy === 'nameAsc') {
        filtered.sort((a, b) => {
          if (!a || !b) return 0;
          const aName = a.name || '';
          const bName = b.name || '';
          return aName.localeCompare(bName);
        });
      } else if (sortBy === 'nameDesc') {
        filtered.sort((a, b) => {
          if (!a || !b) return 0;
          const aName = a.name || '';
          const bName = b.name || '';
          return bName.localeCompare(aName);
        });
      }
    } catch (error) {
      // Error sorting, skip
    }

    return filtered;
  }, [products, searchQuery, sortBy, filterBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset ke halaman pertama ketika filter berubah
  }, [searchQuery, sortBy, filterBy]);

  // Filter brief yang tidak memiliki detail (semua ide konten dihapus)
  const briefsWithDetails = useMemo(() => {
    if (!briefs || !Array.isArray(briefs)) return [];
    return briefs.filter(brief => brief && brief.details && Array.isArray(brief.details) && brief.details.length > 0);
  }, [briefs]);
  
  // Hitung ide konten (BriefDetail) dengan status 'draft' dan 'ready' (belum disubmit)
  const readyToSubmitIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    const count = briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      // Hitung draft dan ready (belum final)
      const notSubmittedDetails = brief.details.filter(d => {
        if (!d) return false;
        const status = d.status || 'draft';
        const isFinalStatus = status === 'scheduled' || status === 'pending_approval' || status === 'approved' || status === 'rejected';
        return !isFinalStatus; // Semua yang belum final (draft dan ready)
      });
      return total + notSubmittedDetails.length;
    }, 0);
    return count;
  }, [briefsWithDetails]);

  // Hitung ide konten (BriefDetail) dengan status 'pending_approval' (sudah disubmit, menunggu review)
  const pendingContentIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    const count = briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      const pendingDetails = brief.details.filter(d => d && d.status === 'pending_approval');
      return total + pendingDetails.length;
    }, 0);
    return count;
  }, [briefsWithDetails]);

  // Dapatkan brief yang memiliki detail dengan status 'ready' (belum disubmit)
  const briefsReadyToSubmit = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) {
      return [];
    }
    try {
      const filtered = briefsWithDetails
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
      return filtered;
    } catch (error) {
      return [];
    }
  }, [briefsWithDetails]);
  
  // Hitung ide konten (BriefDetail) dengan status 'approved' atau 'scheduled'
  const approvedContentIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      return total + (brief.details.filter(d => d && (d.status === 'approved' || d.status === 'scheduled')).length || 0);
    }, 0);
  }, [briefsWithDetails]);
  
  // Hitung ide konten (BriefDetail) dengan status 'rejected'
  const rejectedContentIdeas = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      return total + (brief.details.filter(d => d && d.status === 'rejected').length || 0);
    }, 0);
  }, [briefsWithDetails]);
  
  const briefsThisMonth = useMemo(() => {
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999); // Sertakan akhir hari
    
    // Hitung total ide konten (details) yang dibuat bulan ini berdasarkan detail.createdAt
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      
      return total + brief.details.filter(detail => {
        if (!detail || !detail.createdAt) return false;
        try {
          const detailDate = new Date(detail.createdAt);
          return detailDate >= monthStart && detailDate <= monthEnd;
        } catch (error) {
          return false;
        }
      }).length;
    }, 0);
  }, [briefsWithDetails]);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard</h1>
              <p className="text-primary-100 text-xs sm:text-sm mt-1">Ringkasan aktivitas dan statistik proyek Anda</p>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Total Produk</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Array.isArray(products) ? products.length : 0}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Produk terdaftar</p>
          </div>
          {/* Card Brief Belum Disubmit - Status Ready */}
          <div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20"
            title="Brief dengan status draft dan siap submit (belum disubmit)"
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Belum Disubmit</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{readyToSubmitIdeas}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Draft & Siap Submit</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Hourglass className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Menunggu Review</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{pendingContentIdeas}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Menunggu review</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Disetujui</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{approvedContentIdeas}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Brief disetujui</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Ditolak</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{rejectedContentIdeas}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Brief ditolak</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Bulan Ini</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{briefsThisMonth}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Total brief</p>
          </div>
        </div>
      </div>

      {/* Aksi Cepat */}
      <div className="relative">
        {/* Background dengan gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-100/50 to-primary-50/30 rounded-3xl -z-10"></div>
        
        <div className="mb-6 sm:mb-8 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Aksi Cepat</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Mulai dengan membuat produk baru atau langsung buat ide brief untuk menghasilkan brief</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-6">
            {/* Buat Brief Baru */}
            <Link
              to="/briefs/new"
              className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 border-2 border-primary-200/50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-200/40 to-primary-300/30 rounded-full -mr-20 -mt-20 blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-100/30 to-transparent rounded-full -ml-16 -mb-16 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 group-hover:text-primary-700 transition-colors">Buat Ide Brief Baru</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Generate brief dengan AI untuk produk Anda</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl px-4 py-3 shadow-md group-hover:shadow-lg transition-all group-hover:translate-x-2">
                  <span>Mulai Sekarang</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Tambah Produk */}
            <Link
              to="/products/new"
              className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 border-2 border-primary-200/50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-200/40 to-primary-300/30 rounded-full -mr-20 -mt-20 blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-100/30 to-transparent rounded-full -ml-16 -mb-16 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 group-hover:text-primary-700 transition-colors">Tambah Produk</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Tambahkan produk baru ke dalam sistem</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl px-4 py-3 shadow-md group-hover:shadow-lg transition-all group-hover:translate-x-2">
                  <span>Tambah Sekarang</span>
                  <Package className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Lihat Kalender */}
            <Link
              to="/calendar"
              className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 border-2 border-primary-200/50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-200/40 to-primary-300/30 rounded-full -mr-20 -mt-20 blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-100/30 to-transparent rounded-full -ml-16 -mb-16 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 group-hover:text-primary-700 transition-colors">Lihat Kalender</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Kelola jadwal posting konten Anda</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl px-4 py-3 shadow-md group-hover:shadow-lg transition-all group-hover:translate-x-2">
                  <span>Buka Kalender</span>
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div>
        <div className="relative bg-white border-2 border-primary-200 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-50 rounded-full -ml-24 -mb-24 blur-2xl opacity-30"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="p-2 sm:p-4 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl sm:rounded-2xl shadow-md">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Produk Terbaru</h2>
                  <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-semibold border border-primary-200 w-fit">
                    {products?.length || 0} Produk
                  </span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">Kelola produk dan buat brief dengan mudah</p>
              </div>
            </div>
            <Link
              to="/products"
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-bold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              Lihat Semua
            </Link>
          </div>
        </div>

        {/* Search, Sort, Filter Controls */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Produk</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urutkan</label>
              <div className="relative">
                <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer font-medium"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="nameAsc">Nama A-Z</option>
                  <option value="nameDesc">Nama Z-A</option>
                </select>
              </div>
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500 pointer-events-none" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer font-medium"
                >
                  <option value="all">Semua Produk</option>
                  <option value="withImage">Dengan Gambar</option>
                  <option value="withLink">Dengan Link</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700">Menampilkan</span>
                <span className="px-3 py-1 bg-primary-600 text-white rounded-full font-bold">
                  {paginatedProducts.length}
                </span>
                <span className="font-semibold text-gray-700">dari</span>
                <span className="px-3 py-1 bg-primary-600 text-white rounded-full font-bold">
                  {filteredAndSortedProducts.length}
                </span>
                <span className="font-semibold text-gray-700">produk</span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Hapus pencarian
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <EmptyState
              title={searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
              description={searchQuery ? "Coba ubah kata kunci pencarian Anda" : "Mulai dengan menambahkan produk pertama Anda"}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {paginatedProducts.filter(p => p && p.id).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group"
              >
                {product.imageUrl ? (
                  <Link
                    to={`/products/${product.id}`}
                    className="w-full aspect-square overflow-hidden flex-shrink-0 block cursor-pointer relative"
                  >
                    <img
                      src={`http://localhost:3000${product.imageUrl}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-base font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary-700 transition-colors cursor-pointer group-hover:text-primary-700"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                    {product.description || 'Tidak ada deskripsi'}
                  </p>
                  <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-all text-sm font-medium border border-primary-200 hover:border-primary-300 hover:shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </Link>
                    <Link
                      to={`/briefs/new?productId=${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Brief
                    </Link>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-primary-600 text-white font-semibold'
                                : 'border border-gray-300 hover:bg-primary-50 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

