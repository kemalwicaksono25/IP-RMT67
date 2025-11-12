import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Edit, ExternalLink, Plus, X, Save, Info, AlertCircle, FileText, Package, Target, TrendingUp, Heart } from 'lucide-react';
import { getProductById, updateProduct } from '../../services/product.api';
import { updateProduct as updateProductAction } from '../../store/productSlice';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const product = useMemo(() => products.find(p => p.id === parseInt(id)), [products, id]);
  const [loading, setLoading] = useState(!product);
  const [editingPGG, setEditingPGG] = useState({ pains: false, gains: false, goals: false });
  const [pggData, setPggData] = useState({ pains: [], gains: [], goals: [] });
  const [saving, setSaving] = useState(false);

  // Fungsi helper untuk mengecek apakah PGG berisi nilai placeholder/default
  const isPlaceholderPGG = (items) => {
    if (!items || items.length === 0) return true;
    // Cek apakah semua item adalah pola placeholder
    const placeholderPatterns = [
      /^Masalah umum \d+$/i,
      /^Keuntungan \d+$/i,
      /^Tujuan \d+$/i,
    ];
    return items.every(item => 
      placeholderPatterns.some(pattern => pattern.test(item))
    );
  };

  useEffect(() => {
    // Jika product tidak ada di store, fetch dari API
    if (!product) {
      fetchProduct();
    } else {
      // Jika product sudah ada di store, set PGG data
      setPggData({
        pains: Array.isArray(product.pains) ? product.pains : [],
        gains: Array.isArray(product.gains) ? product.gains : [],
        goals: Array.isArray(product.goals) ? product.goals : [],
      });
    }
  }, [id, product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      if (response && response.data) {
        // Update Redux store
        dispatch(updateProductAction({ id: parseInt(id), updatedProduct: response.data }));
        setPggData({
          pains: Array.isArray(response.data.pains) ? response.data.pains : [],
          gains: Array.isArray(response.data.gains) ? response.data.gains : [],
          goals: Array.isArray(response.data.goals) ? response.data.goals : [],
        });
      } else {
        toast.error('Data produk tidak valid');
      }
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };


  const handleEditPGG = (type) => {
    setEditingPGG({ ...editingPGG, [type]: true });
  };

  const handleCancelEdit = (type) => {
    setEditingPGG({ ...editingPGG, [type]: false });
    // Reset ke data original
    setPggData({
      pains: product?.pains || [],
      gains: product?.gains || [],
      goals: product?.goals || [],
    });
  };

  const handleAddItem = (type) => {
    setPggData({
      ...pggData,
      [type]: [...(pggData[type] || []), ''],
    });
  };

  const handleRemoveItem = (type, index) => {
    setPggData({
      ...pggData,
      [type]: pggData[type].filter((_, i) => i !== index),
    });
  };

  const handleUpdateItem = (type, index, value) => {
    const updated = [...pggData[type]];
    updated[index] = value;
    setPggData({
      ...pggData,
      [type]: updated,
    });
  };

  const handleSavePGG = async (type) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('pains', JSON.stringify((pggData.pains || []).filter(p => p && p.trim() !== '')));
      formData.append('gains', JSON.stringify((pggData.gains || []).filter(g => g && g.trim() !== '')));
      formData.append('goals', JSON.stringify((pggData.goals || []).filter(g => g && g.trim() !== '')));

      const response = await updateProduct(id, formData);
      // Update Redux store
      dispatch(updateProductAction({ id: parseInt(id), updatedProduct: response.data }));
      toast.success(`${type === 'pains' ? 'Pain points' : type === 'gains' ? 'Gains' : 'Goals'} berhasil disimpan`);
      setEditingPGG({ ...editingPGG, [type]: false });
      // Update PGG data dari response
      setPggData({
        pains: Array.isArray(response.data.pains) ? response.data.pains : [],
        gains: Array.isArray(response.data.gains) ? response.data.gains : [],
        goals: Array.isArray(response.data.goals) ? response.data.goals : [],
      });
    } catch (error) {
      toast.error('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Produk tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{product.name}</h1>
              <p className="text-primary-100 text-xs sm:text-sm mt-1">Detail produk dan analisis untuk strategi konten</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
            <Link
              to={`/briefs/new?productId=${id}`}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm sm:text-base justify-center"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Buat Brief Baru
            </Link>
            <Link
              to={`/products/${id}/edit`}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm sm:text-base justify-center"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {/* Image Section - Left Side */}
        <div className="lg:col-span-1 flex">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col w-full h-full">
            {product.imageUrl && (
              <div className="w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
                <img
                  src={`http://localhost:3000${product.imageUrl}`}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-6 space-y-3 flex-shrink-0">
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka Link Produk
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Product Info Section - Right Side */}
        <div className="lg:col-span-2 flex">
          {/* Description Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col w-full h-full">
            <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Deskripsi Produk</h2>
            </div>
            <div className="p-6 pt-4 overflow-y-auto flex-1">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PGG Section - Full Width */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pain Points */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Heart className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Pain Points</h3>
                      {(!pggData.pains || pggData.pains.length === 0 || isPlaceholderPGG(pggData.pains)) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                          Belum diisi
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 ml-12 font-medium">Masalah yang dihadapi</p>
                </div>
                {!editingPGG.pains && (
                  <button
                    onClick={() => handleEditPGG('pains')}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                    title="Edit Pain Points"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editingPGG.pains ? (
                <div className="space-y-3">
                  {pggData.pains && pggData.pains.length > 0 ? (
                    pggData.pains.map((pain, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                        <span className="text-red-500 mt-1.5 text-lg font-bold">•</span>
                        <input
                          type="text"
                          value={pain}
                          onChange={(e) => handleUpdateItem('pains', index, e.target.value)}
                          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          placeholder="Masukkan pain point"
                        />
                        <button
                          onClick={() => handleRemoveItem('pains', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl p-4">Belum ada pain points. Klik "Tambah" untuk menambahkan.</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAddItem('pains')}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah
                    </button>
                    <button
                      onClick={() => handleSavePGG('pains')}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                    >
                      {saving ? <Loader size="sm" /> : <Save className="w-4 h-4" />}
                      Simpan
                    </button>
                    <button
                      onClick={() => handleCancelEdit('pains')}
                      disabled={saving}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-primary-50 transition-colors font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    {pggData.pains && pggData.pains.length > 0 && !isPlaceholderPGG(pggData.pains) ? (
                      <ul className="space-y-2">
                        {pggData.pains.map((pain, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                            <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                            <span className="flex-1 leading-relaxed">{pain}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 text-center">Klik Edit untuk menambahkan data</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Gains */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Gains</h3>
                      {(!pggData.gains || pggData.gains.length === 0 || isPlaceholderPGG(pggData.gains)) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                          Belum diisi
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 ml-12 font-medium">Manfaat yang didapat</p>
                </div>
                {!editingPGG.gains && (
                  <button
                    onClick={() => handleEditPGG('gains')}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                    title="Edit Gains"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editingPGG.gains ? (
                <div className="space-y-3">
                  {pggData.gains && pggData.gains.length > 0 ? (
                    pggData.gains.map((gain, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                        <span className="text-green-500 mt-1.5 text-lg font-bold">•</span>
                        <input
                          type="text"
                          value={gain}
                          onChange={(e) => handleUpdateItem('gains', index, e.target.value)}
                          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          placeholder="Masukkan gain"
                        />
                        <button
                          onClick={() => handleRemoveItem('gains', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl p-4">Belum ada gains. Klik "Tambah" untuk menambahkan.</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAddItem('gains')}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah
                    </button>
                    <button
                      onClick={() => handleSavePGG('gains')}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                    >
                      {saving ? <Loader size="sm" /> : <Save className="w-4 h-4" />}
                      Simpan
                    </button>
                    <button
                      onClick={() => handleCancelEdit('gains')}
                      disabled={saving}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-primary-50 transition-colors font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    {pggData.gains && pggData.gains.length > 0 && !isPlaceholderPGG(pggData.gains) ? (
                      <ul className="space-y-2">
                        {pggData.gains.map((gain, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                            <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                            <span className="flex-1 leading-relaxed">{gain}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 text-center">Klik Edit untuk menambahkan data</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Goals */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Target className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Goals</h3>
                      {(!pggData.goals || pggData.goals.length === 0 || isPlaceholderPGG(pggData.goals)) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                          Belum diisi
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 ml-12 font-medium">Tujuan yang ingin dicapai</p>
                </div>
                {!editingPGG.goals && (
                  <button
                    onClick={() => handleEditPGG('goals')}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                    title="Edit Goals"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editingPGG.goals ? (
                <div className="space-y-3">
                  {pggData.goals && pggData.goals.length > 0 ? (
                    pggData.goals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                        <span className="text-blue-500 mt-1.5 text-lg font-bold">•</span>
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => handleUpdateItem('goals', index, e.target.value)}
                          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                          placeholder="Masukkan goal"
                        />
                        <button
                          onClick={() => handleRemoveItem('goals', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl p-4">Belum ada goals. Klik "Tambah" untuk menambahkan.</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAddItem('goals')}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah
                    </button>
                    <button
                      onClick={() => handleSavePGG('goals')}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                    >
                      {saving ? <Loader size="sm" /> : <Save className="w-4 h-4" />}
                      Simpan
                    </button>
                    <button
                      onClick={() => handleCancelEdit('goals')}
                      disabled={saving}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-primary-50 transition-colors font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    {pggData.goals && pggData.goals.length > 0 && !isPlaceholderPGG(pggData.goals) ? (
                      <ul className="space-y-2">
                        {pggData.goals.map((goal, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                            <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                            <span className="flex-1 leading-relaxed">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 text-center">Klik Edit untuk menambahkan data</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
