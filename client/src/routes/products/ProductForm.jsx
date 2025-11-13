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
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]); // Store existing images from server
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
        images: [],
      });
      
      // Handle both imageUrls array and imageUrl (backward compatibility)
      const images = product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls 
        : (product.imageUrl ? [product.imageUrl] : []);
      
      const previews = images.map(img => 
        img.startsWith('http') ? img : `http://54.206.113.88${img}`
      );
      setImagePreviews(previews);
      setExistingImageUrls(images); // Store existing images for edit mode
    } catch (error) {
      toast.error('Gagal memuat produk');
      navigate('/products');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Check total images (existing + new) doesn't exceed 10
      const totalImages = formData.images.length + existingImageUrls.length + files.length;
      if (totalImages > 10) {
        toast.error(`Maksimal 10 gambar. Anda sudah memiliki ${formData.images.length + existingImageUrls.length} gambar dan mencoba menambahkan ${files.length} gambar.`);
        e.target.value = ''; // Reset input
        return;
      }
      
      const newImages = [...formData.images, ...files];
      setFormData({ ...formData, images: newImages });
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    // Check if removing existing image or new image
    if (index < existingImageUrls.length) {
      // Removing existing image
      const newExisting = existingImageUrls.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setExistingImageUrls(newExisting);
      setImagePreviews(newPreviews);
    } else {
      // Removing new image (adjust index)
      const adjustedIndex = index - existingImageUrls.length;
      const newImages = formData.images.filter((_, i) => i !== adjustedIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newPreviews);
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
      
      // Append all new images
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      
      // For edit mode: handle existing images
      // If user removed some existing images, we need to send remaining existing image URLs
      if (isEdit && existingImageUrls.length > 0) {
        // Count how many existing images are still in preview (not removed)
        // Existing images are at the beginning of imagePreviews array
        const remainingCount = Math.min(existingImageUrls.length, imagePreviews.length);
        const remainingExisting = existingImageUrls.slice(0, remainingCount);
        
        // If no new images uploaded but existing images were removed, send remaining existing URLs
        if (formData.images.length === 0 && remainingExisting.length < existingImageUrls.length) {
          // User removed some existing images, send remaining ones (as relative paths)
          formDataToSend.append('existingImageUrls', JSON.stringify(remainingExisting));
        }
        // If new images uploaded, they will replace all (handled by backend)
        // If no new images and no removals, backend will preserve existing (no update to imageUrls)
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 text-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md flex-shrink-0">
            {isEdit ? (
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            ) : (
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
            <p className="text-primary-100 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1">
              {isEdit ? 'Perbarui informasi produk Anda' : 'Tambahkan produk baru ke dalam sistem'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Informasi Produk
          </h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-800 placeholder-gray-400"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-800 placeholder-gray-400 resize-y"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-800 placeholder-gray-400"
              placeholder="https://shopee.co.id/..."
            />
          </div>

          {/* Foto Produk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary-600" />
              Foto Produk (Bisa upload multiple)
            </label>
            <div className="space-y-4">
              <div className="relative">
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Maksimal 10 gambar, ukuran maksimal 5MB per gambar</p>
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview Gambar ({imagePreviews.length}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                          title="Hapus gambar"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 rounded-b-lg">
                          {index + 1}/{imagePreviews.length}
                        </div>
                      </div>
                    ))}
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
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
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
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-primary-100 transition-colors font-semibold flex items-center gap-2"
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

