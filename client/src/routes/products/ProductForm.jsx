import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct, getProductById } from '../../services/product.api';
import { addProduct, updateProduct as updateProductAction } from '../../store/productSlice';
import { Package, Plus, Edit, FileText, Link as LinkIcon, Image as ImageIcon, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id);
      const product = response.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        link: product.link || '',
        image: null,
      });
      if (product.imageUrl) {
        setImagePreview(`http://localhost:3000${product.imageUrl}`);
      }
    } catch (error) {
      toast.error('Gagal memuat produk');
      navigate('/products');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Nama produk wajib diisi');
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      toast.error('Deskripsi produk wajib diisi');
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('link', formData.link);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (isEdit) {
        const response = await updateProduct(id, formDataToSend);
        dispatch(updateProductAction({ id: parseInt(id), updatedProduct: response.data }));
        toast.success('Produk berhasil diperbarui');
      } else {
        const response = await createProduct(formDataToSend);
        dispatch(addProduct(response.data));
        toast.success('Produk berhasil dibuat');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            {isEdit ? (
              <Edit className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              {isEdit ? 'Perbarui informasi produk Anda' : 'Tambahkan produk baru ke dalam sistem'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Informasi Produk
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" />
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400"
              placeholder="Masukkan nama produk"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" />
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400 resize-y"
              placeholder="Masukkan deskripsi produk yang detail dan menarik"
            />
          </div>

          {/* Link Produk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary-600" />
              Link Produk
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder-gray-400"
              placeholder="https://shopee.co.id/..."
            />
          </div>

          {/* Foto Produk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary-600" />
              Foto Produk
            </label>
            <div className="space-y-4">
              <div className="relative">
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer cursor-pointer"
                />
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview Gambar:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                        setFileInputKey(prev => prev + 1);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Hapus gambar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update Produk' : 'Simpan Produk'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Batal
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

