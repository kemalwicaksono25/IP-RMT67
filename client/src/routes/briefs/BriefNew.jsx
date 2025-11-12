import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setProducts } from '../../store/productSlice';
import { setBriefs, addBrief } from '../../store/briefSlice';
import { generateBrief, getBriefs } from '../../services/brief.api';
import { getProducts, getProductById } from '../../services/product.api';
import { FUNNEL_STAGES, BRIEF_TYPES, TONE_OF_VOICE } from '../../utils/constants';
import { Sparkles, Target, Hash, FileText, Palette, Package, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

export default function BriefNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('productId');
  const products = useSelector((state) => state.product.products);
  const briefs = useSelector((state) => state.brief.briefs);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [formData, setFormData] = useState({
    ProductId: productIdFromUrl || '',
    funnelStage: ['awareness'],
    briefType: ['ugc'],
    toneOfVoice: 'casual_mom_style',
    targetMarket: '',
    count: 5,
  });

  useEffect(() => {
    fetchProducts();
    fetchBriefs();
  }, []);

  useEffect(() => {
    if (productIdFromUrl) {
      fetchProductData(productIdFromUrl);
    }
  }, [productIdFromUrl]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      dispatch(setProducts(response.data));
    } catch (error) {
      toast.error('Gagal memuat produk');
    }
  };

  const fetchBriefs = async () => {
    try {
      const response = await getBriefs();
      dispatch(setBriefs(response.data));
    } catch (error) {
      // Gagal diam-diam
    }
  };

  const getBriefsThisMonth = () => {
    if (!briefs || !Array.isArray(briefs)) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999); // Sertakan akhir hari
    
    // Hitung total ide konten (details) yang dibuat bulan ini berdasarkan detail.createdAt
    return briefs.reduce((total, brief) => {
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
  };

  const getProductsWithBriefs = () => {
    if (!briefs || !Array.isArray(briefs)) return 0;
    // Hitung produk yang memiliki setidaknya satu ide konten
    const productIdsWithBriefs = new Set();
    briefs.forEach(brief => {
      if (brief && brief.details && brief.details.length > 0) {
        productIdsWithBriefs.add(brief.ProductId);
      }
    });
    return productIdsWithBriefs.size;
  };

  const fetchProductData = async (productId) => {
    setFetchingProduct(true);
    try {
      const response = await getProductById(productId);
      const product = response.data;
      
      // Pre-isi form dengan data produk
      setFormData((prev) => ({
        ...prev,
        ProductId: product.id.toString(),
      }));
    } catch (error) {
      toast.error('Gagal memuat detail produk');
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ProductId || formData.ProductId === '') {
      toast.error('Pilih produk terlebih dahulu');
      return;
    }
    
    if (formData.briefType.length === 0) {
      toast.error('Pilih minimal satu jenis brief');
      return;
    }
    
    if (formData.funnelStage.length === 0) {
      toast.error('Pilih minimal satu funnel stage');
      return;
    }
    
    setLoading(true);

    try {
      // Konversi array ke string yang dipisahkan koma untuk backend
      const submitData = {
        ...formData,
        briefType: formData.briefType.join(','),
        funnelStage: formData.funnelStage.join(','),
      };
      const response = await generateBrief(submitData);
      // Update Redux store
      dispatch(addBrief(response.data));
      toast.success('Brief berhasil di-generate!');
      // Trigger event untuk update komponen lain (seperti ProductDetail)
      window.dispatchEvent(new Event('briefsUpdated'));
      navigate(`/briefs/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal generate brief');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id.toString() === formData.ProductId);

  return (
    <div className="space-y-6">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Buat Ide Brief Baru</h1>
              <p className="text-primary-100 text-sm mt-1">Isi form di bawah untuk generate brief dengan AI</p>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-sm text-primary-100">Total Produk</span>
            </div>
            <p className="text-2xl font-bold">{products?.length || 0}</p>
            <p className="text-xs text-primary-200 mt-1">Produk tersedia</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm text-primary-100">Brief Bulan Ini</span>
            </div>
            <p className="text-2xl font-bold">{getBriefsThisMonth()}</p>
            <p className="text-xs text-primary-200 mt-1">Total brief</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm text-primary-100">Produk dengan Brief</span>
            </div>
            <p className="text-2xl font-bold">{getProductsWithBriefs()}</p>
            <p className="text-xs text-primary-200 mt-1">Produk aktif</p>
          </div>
        </div>
      </div>

      {fetchingProduct && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3">
            <Loader size="sm" />
            <span className="text-sm text-gray-600">Memuat data produk...</span>
          </div>
        </div>
      )}

      {selectedProduct && formData.ProductId && (
        <div className="bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-semibold text-primary-900">Produk yang dipilih</p>
          </div>
          <div className="flex gap-4">
            {selectedProduct.imageUrl && (
              <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden border-2 border-primary-200 shadow-md">
                <img
                  src={`http://localhost:3000${selectedProduct.imageUrl}`}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
              {selectedProduct.description && (
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{selectedProduct.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Formulir Brief
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Package className="w-4 h-4 text-primary-600" />
                Pilih Produk *
              </label>
              <select
                value={formData.ProductId}
                onChange={(e) => setFormData({ ...formData, ProductId: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                  !formData.ProductId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={fetchingProduct}
              >
                <option value="">-- Pilih Produk --</option>
                {(products || []).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {!formData.ProductId && (
                <p className="mt-2 text-xs text-red-600 font-medium">Pilih produk terlebih dahulu</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Target className="w-4 h-4 text-primary-600" />
                Target Market (optional)
              </label>
              <input
                type="text"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Contoh: Remaja 15-25 tahun"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4 text-primary-600" />
                Jumlah Brief *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Palette className="w-4 h-4 text-primary-600" />
                Gaya Bahasa *
              </label>
              <select
                value={formData.toneOfVoice}
                onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {TONE_OF_VOICE.map((tone) => (
                  <option key={tone.value} value={tone.value}>
                    {tone.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                Funnel Stage * (Pilih satu atau lebih)
              </label>
              <div className="border-2 border-gray-200 rounded-xl p-4 max-h-80 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-1 gap-2.5">
                  {FUNNEL_STAGES.map((stage) => (
                    <label
                      key={stage.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.funnelStage.includes(stage.value)
                          ? 'bg-primary-50 border-primary-400 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.funnelStage.includes(stage.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              funnelStage: [...formData.funnelStage, stage.value],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              funnelStage: formData.funnelStage.filter((s) => s !== stage.value),
                            });
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`text-sm flex-1 font-medium ${
                        formData.funnelStage.includes(stage.value) ? 'text-primary-900' : 'text-gray-700'
                      }`}>
                        {stage.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.funnelStage.length === 0 && (
                <p className="mt-2 text-xs text-red-600 font-medium">Pilih minimal satu funnel stage</p>
              )}
              {formData.funnelStage.length > 0 && (
                <p className="mt-2 text-xs text-primary-600 font-medium">
                  ✓ Terpilih: {formData.funnelStage.length} funnel stage
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4 text-primary-600" />
                Jenis Brief * (Pilih satu atau lebih)
              </label>
              <div className="border-2 border-gray-200 rounded-xl p-4 max-h-80 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-1 gap-2.5">
                  {BRIEF_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.briefType.includes(type.value)
                          ? 'bg-primary-50 border-primary-400 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.briefType.includes(type.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              briefType: [...formData.briefType, type.value],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              briefType: formData.briefType.filter((t) => t !== type.value),
                            });
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`text-sm flex-1 font-medium ${
                        formData.briefType.includes(type.value) ? 'text-primary-900' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.briefType.length === 0 && (
                <p className="mt-2 text-xs text-red-600 font-medium">Pilih minimal satu jenis brief</p>
              )}
              {formData.briefType.length > 0 && (
                <p className="mt-2 text-xs text-primary-600 font-medium">
                  ✓ Terpilih: {formData.briefType.length} jenis brief
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || formData.briefType.length === 0 || formData.funnelStage.length === 0}
              className="w-full bg-primary-600 text-white py-3.5 px-6 rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  <span>AI sedang menulis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Brief dengan AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

