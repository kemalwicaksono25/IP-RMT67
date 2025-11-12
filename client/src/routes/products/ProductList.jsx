import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Eye, Trash2, Package, Sparkles, Link as LinkIcon, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { setProducts, deleteProduct as deleteProductAction } from '../../store/productSlice';
import { getProducts, deleteProduct } from '../../services/product.api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

export default function ProductList() {
  const products = useSelector((state) => state.product.products);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      dispatch(setProducts(response.data));
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  // Filter, Sort, dan Paginate produk
  const filteredAndSortedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    let filtered = [...products];

    // Filter berdasarkan query pencarian (hanya berdasarkan nama/judul)
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) => {
        if (!product) return false;
        return product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase());
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
          if (!a || !b || !a.name || !b.name) return 0;
          return a.name.localeCompare(b.name);
        });
      } else if (sortBy === 'nameDesc') {
        filtered.sort((a, b) => {
          if (!a || !b || !a.name || !b.name) return 0;
          return b.name.localeCompare(a.name);
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

  const handleOpenDeleteModal = (id) => {
    setDeletingProductId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingProductId(null);
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;

    try {
      await deleteProduct(deletingProductId);
      dispatch(deleteProductAction(deletingProductId));
      toast.success('Produk berhasil dihapus');
      fetchProducts();
      handleCloseDeleteModal();
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Daftar Produk</h1>
              <p className="text-primary-100 text-xs sm:text-sm mt-1">Kelola semua produk Anda di satu tempat</p>
            </div>
          </div>
          <Link
            to="/products/new"
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Tambah Produk
          </Link>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Total Produk</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Array.isArray(products) ? products.length : 0}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Produk terdaftar</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Dengan Gambar</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Array.isArray(products) ? products.filter(p => p && p.imageUrl).length : 0}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Produk</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Dengan Link</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Array.isArray(products) ? products.filter(p => p && p.link).length : 0}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Produk</p>
          </div>
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
              <span className="px-3 py-1 bg-primary-700 text-white rounded-full font-bold">
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
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-base font-bold text-gray-900 line-clamp-2 flex-1 hover:text-primary-600 transition-colors cursor-pointer group-hover:text-primary-600"
                  >
                    {product.name}
                  </Link>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                  {product.description || 'Tidak ada deskripsi'}
                </p>
                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </Link>
                  <button
                    onClick={() => handleOpenDeleteModal(product.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Halaman</span>
                <span className="font-semibold text-gray-900">{currentPage}</span>
                <span>dari</span>
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCloseDeleteModal}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

