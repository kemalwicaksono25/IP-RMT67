/**
 * Get full image URL
 * Handles both Cloudinary URLs (full URL) and local paths (relative)
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, it's a local path, prepend the server URL
  return `http://54.206.113.88${imageUrl}`;
};

/**
 * Get product images array
 * Handles both imageUrls array and imageUrl (backward compatibility)
 */
export const getProductImages = (product) => {
  if (!product) return [];
  
  // Prefer imageUrls array if available
  if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    return product.imageUrls;
  }
  
  // Fallback to imageUrl for backward compatibility
  if (product.imageUrl) {
    return [product.imageUrl];
  }
  
  return [];
};

