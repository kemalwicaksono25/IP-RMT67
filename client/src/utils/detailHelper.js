// Helper function untuk mengecek apakah detail sudah lengkap dan siap submit
export const isDetailComplete = (detail) => {
  if (!detail) {
    return false;
  }

  // Parse detail jika masih berupa string JSON
  let detailObj = detail.detail;
  if (typeof detailObj === 'string') {
    try {
      detailObj = JSON.parse(detailObj);
    } catch (e) {
      return false;
    }
  }

  if (!detailObj || !detailObj.type) {
    return false;
  }

  if (!detail.caption || (typeof detail.caption === 'string' && detail.caption.trim().length === 0)) {
    return false;
  }

  const type = detailObj.type;

  if (type === 'video') {
    // Untuk video, minimal harus ada scenes dan visual
    const hasScenes = detailObj.scenes && 
      Array.isArray(detailObj.scenes) && 
      detailObj.scenes.length > 0 &&
      detailObj.scenes.some(s => s && s.description && typeof s.description === 'string' && s.description.trim().length > 0);
    const hasVisual = detailObj.visual && typeof detailObj.visual === 'string' && detailObj.visual.trim().length > 0;
    
    return hasScenes && hasVisual;
  } else if (type === 'carousel') {
    // Untuk carousel, minimal harus ada slides dan visualTone
    const hasSlides = detailObj.slides && 
      Array.isArray(detailObj.slides) && 
      detailObj.slides.length > 0 &&
      detailObj.slides.some(s => s && s.text && typeof s.text === 'string' && s.text.trim().length > 0);
    const hasVisualTone = detailObj.visualTone && typeof detailObj.visualTone === 'string' && detailObj.visualTone.trim().length > 0;
    
    return hasSlides && hasVisualTone;
  } else if (type === 'image') {
    // Untuk image, minimal harus ada headline, subheadline, dan visual
    const hasHeadline = detailObj.headline && typeof detailObj.headline === 'string' && detailObj.headline.trim().length > 0;
    const hasSubheadline = detailObj.subheadline && typeof detailObj.subheadline === 'string' && detailObj.subheadline.trim().length > 0;
    const hasVisual = detailObj.visual && typeof detailObj.visual === 'string' && detailObj.visual.trim().length > 0;
    
    return hasHeadline && hasSubheadline && hasVisual;
  }

  return false;
};

// Helper function untuk mengecek apakah detail siap submit
// Detail siap submit jika: lengkap (isDetailComplete) dan status belum final
export const isReadyToSubmit = (detail) => {
  if (!detail) return false;
  
  const status = detail.status || 'draft';
  const isFinalStatus = status === 'scheduled' || status === 'pending_approval' || status === 'approved' || status === 'rejected';
  
  // Detail siap submit jika lengkap dan belum final
  return isDetailComplete(detail) && !isFinalStatus;
};

