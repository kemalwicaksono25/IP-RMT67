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

