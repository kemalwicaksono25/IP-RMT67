import { useEffect, useState, useMemo, Fragment } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getBriefById, generateDetail, updateBriefDetail, submitDetailForApproval, deleteBriefDetail } from '../../services/brief.api';
import { updateBrief } from '../../store/briefSlice';
import { FileText, Sparkles, CheckCircle, Edit2, Save, X, Eye, ChevronUp, Trash2, Send, Package, ExternalLink, Calendar, Clock, Info, Zap, Hourglass, XCircle, AlertTriangle } from 'lucide-react';
import { TONE_OF_VOICE, BRIEF_TYPES, FUNNEL_STAGES, getStatusLabel } from '../../utils/constants';
import { isReadyToSubmit, isDetailComplete } from '../../utils/detailHelper';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export default function BriefDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('filter'); // 'rejected', 'ready', dll
  const dispatch = useDispatch();
  const briefs = useSelector((state) => state.brief?.briefs) || [];
  const [localBrief, setLocalBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingDetail, setGeneratingDetail] = useState({});
  const [editingDetail, setEditingDetail] = useState({});
  const [editingIdea, setEditingIdea] = useState({});
  const [editData, setEditData] = useState({});
  const [ideaEditData, setIdeaEditData] = useState({});
  const [saving, setSaving] = useState({});
  const [savingIdea, setSavingIdea] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [showApprovalModal, setShowApprovalModal] = useState({});
  const [approvalData, setApprovalData] = useState({});
  const [submittingApproval, setSubmittingApproval] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState({});
  const [deletingDetailId, setDeletingDetailId] = useState(null);
  const user = useSelector((state) => state.auth?.user);

  const briefFromStore = useMemo(() => {
    if (!briefs || !Array.isArray(briefs) || briefs.length === 0) return null;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return null;
    const found = briefs.find(b => b && b.id === parsedId);
    if (found && (!found.details || !Array.isArray(found.details))) {
      return null;
    }
    return found || null;
  }, [briefs, id]);
  
  const brief = localBrief || briefFromStore;

  const filteredBrief = useMemo(() => {
    if (!brief) return null;
    if (!statusFilter) return brief;
    
    const filteredDetails = brief.details?.filter(d => {
      if (!d) return false;
      
      if (statusFilter === 'draft') {
        return (d.status || 'draft') === 'draft';
      }
      
      if (statusFilter === 'ready') {
        return isReadyToSubmit(d);
      }
      
      return d.status === statusFilter;
    }) || [];
    
    const result = {
      ...brief,
      details: filteredDetails
    };
    
    if (brief.product) {
      result.product = { ...brief.product };
    }
    if (brief.user) {
      result.user = { ...brief.user };
    }
    
    return result;
  }, [brief, statusFilter]);

  const displayBrief = filteredBrief || brief;
  

  const fetchBrief = async (preserveScroll = false) => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    const scrollPosition = preserveScroll ? window.scrollY : null;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getBriefById(id);
      // Update local state dan Redux store
      if (response?.data) {
        const briefData = response.data;
        if (briefData && briefData.id) {
          setLocalBrief(briefData);
          dispatch(updateBrief({ id: parseInt(id), updatedBrief: briefData }));
        } else {
          throw new Error('Data brief tidak valid');
        }
      } else {
        throw new Error('Response tidak valid');
      }
      
      if (preserveScroll && scrollPosition !== null) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
          });
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memuat brief';
      setError(errorMessage);
      toast.error(errorMessage);
      setLocalBrief(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBrief();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const handleGenerateDetail = async (detailId) => {
    setGeneratingDetail((prev) => {
      if (prev[detailId]) {
        return prev; // Sudah sedang generate, jangan update
      }
      return { ...prev, [detailId]: true };
    });

    try {
      const response = await generateDetail(detailId);
      if (response && response.data && response.data.brief) {
        const updatedBrief = response.data.brief;
        setLocalBrief(updatedBrief);
        dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
      } else {
        if (brief && brief.details) {
          const updatedDetails = brief.details.map(d => 
            d.id === detailId ? { ...d, detail: response?.data?.detail || d.detail } : d
          );
          const updatedBrief = { ...brief, details: updatedDetails };
          setLocalBrief(updatedBrief);
          dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
        }
      }
      toast.success('Detail berhasil di-generate');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal generate detail';
      toast.error(errorMessage);
    } finally {
      setGeneratingDetail((prev) => ({ ...prev, [detailId]: false }));
    }
  };

  const handleGenerateAllDetails = async () => {
    if (!brief?.details || brief.details.length === 0) {
      toast.error('Tidak ada brief detail untuk di-generate');
      return;
    }

    const detailsToGenerate = brief.details.filter(d => !d.detail || !d.detail.type);
    
    if (detailsToGenerate.length === 0) {
      toast.success('Semua detail sudah di-generate');
      return;
    }

    const generatingState = {};
    detailsToGenerate.forEach(d => {
      generatingState[d.id] = true;
    });
    setGeneratingDetail((prev) => ({ ...prev, ...generatingState }));

    const promises = detailsToGenerate.map(async (detail) => {
      try {
        const response = await generateDetail(detail.id);
        // Pastikan response memiliki struktur yang benar
        if (response && response.data && response.data.brief) {
          return { success: true, data: response.data, detailId: detail.id };
        } else {
          // Response tidak valid meskipun tidak throw error
          return { 
            error: true, 
            detailId: detail.id, 
            message: 'Response tidak memiliki data brief yang valid',
            response: response 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Gagal generate detail';
        return { 
          error: true, 
          detailId: detail.id, 
          message: errorMessage,
          originalError: error 
        };
      }
    });

    try {
      const responses = await Promise.all(promises);
      
      // Kategorikan semua response dengan benar
      // Pastikan semua response masuk ke kategori yang tepat
      const successfulResponses = [];
      const failedResponses = [];
      
      responses.forEach((r, index) => {
        if (!r) {
          // Response null/undefined dianggap gagal
          failedResponses.push({ 
            error: true, 
            detailId: detailsToGenerate[index]?.id, 
            message: 'Response tidak valid' 
          });
        } else if (r.error) {
          // Response dengan error flag
          failedResponses.push(r);
        } else if (r.success && r.data && r.data.brief) {
          // Response sukses dengan flag success dan data.brief yang valid
          successfulResponses.push(r);
        } else {
          // Response tidak memiliki struktur yang benar (dianggap gagal)
          failedResponses.push({ 
            error: true, 
            detailId: r.detailId || detailsToGenerate[index]?.id, 
            message: r.message || 'Response tidak memiliki data brief yang valid' 
          });
        }
      });
      
      // Debug logging (akan dihapus setelah fix)
      console.log('Generate Detail Results:', {
        totalRequested: detailsToGenerate.length,
        successful: successfulResponses.length,
        failed: failedResponses.length,
        responses: responses.map(r => ({
          hasError: !!r.error,
          hasSuccess: !!r.success,
          hasData: !!(r.data && r.data.brief),
          detailId: r.detailId
        }))
      });
      
      // Update brief dengan response terakhir yang sukses (jika ada)
      if (successfulResponses.length > 0) {
        const lastValidResponse = successfulResponses[successfulResponses.length - 1];
        if (lastValidResponse.data && lastValidResponse.data.brief) {
          const updatedBrief = lastValidResponse.data.brief;
          setLocalBrief(updatedBrief);
          dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
        }
      }
      
      // Tampilkan alert yang akurat
      const totalRequested = detailsToGenerate.length;
      const totalSuccess = successfulResponses.length;
      const totalFailed = failedResponses.length;
      
      if (totalSuccess === totalRequested) {
        // Semua berhasil
        toast.success(`${totalSuccess} detail berhasil di-generate`);
      } else if (totalSuccess > 0 && totalFailed > 0) {
        // Sebagian berhasil, sebagian gagal
        toast.success(`${totalSuccess} detail berhasil di-generate`);
        toast.error(`${totalFailed} detail gagal di-generate`);
      } else if (totalSuccess === 0) {
        // Semua gagal
        toast.error(`Semua ${totalRequested} detail gagal di-generate`);
        if (failedResponses.length > 0 && failedResponses[0].message) {
          toast.error(failedResponses[0].message);
        }
      } else {
        // Fallback untuk kasus edge case
        toast.warning(`Generate detail selesai: ${totalSuccess} berhasil, ${totalFailed} gagal dari ${totalRequested} total`);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat generate detail');
      console.error('Error in handleGenerateAllDetails:', error);
    } finally {
      setGeneratingDetail((prev) => {
        const newState = { ...prev };
        detailsToGenerate.forEach(d => {
          delete newState[d.id];
        });
        return newState;
      });
    }
  };

  const toggleDetail = (detailId) => {
    setExpandedDetails({
      ...expandedDetails,
      [detailId]: !expandedDetails[detailId],
    });
  };

  const handleEditDetail = (detail) => {
    setEditingDetail({ ...editingDetail, [detail.id]: true });
    const detailObj = detail.detail || {};
    
    if (detailObj.type === 'video') {
      let scenes = detailObj.scenes || [];
      if (!Array.isArray(scenes)) {
        scenes = Object.keys(scenes).map(key => {
          const scene = scenes[key];
          return typeof scene === 'object' ? scene : { time: key, description: scene || '' };
        });
      }
      
      setEditData({
        ...editData,
        [detail.id]: {
          type: 'video',
          duration: detailObj.duration || '',
          scenes: scenes.length > 0 ? scenes : [{ time: '0-3s', description: '' }, { time: '4-10s', description: '' }, { time: '11-15s', description: '' }],
          visual: detailObj.visual || '',
          music: detailObj.music || '',
          captionWithHashtags: detail.caption 
            ? (detail.caption + (detail.hashtags && detail.hashtags.length > 0 ? ' ' + detail.hashtags.join(' ') : ''))
            : '',
        },
      });
    } else if (detailObj.type === 'carousel') {
      setEditData({
        ...editData,
        [detail.id]: {
          type: 'carousel',
          slideCount: detailObj.slideCount || 4,
          slides: detailObj.slides || [],
          visualTone: detailObj.visualTone || '',
          captionWithHashtags: detail.caption 
            ? (detail.caption + (detail.hashtags && detail.hashtags.length > 0 ? ' ' + detail.hashtags.join(' ') : ''))
            : '',
        },
      });
    } else if (detailObj.type === 'image') {
      setEditData({
        ...editData,
        [detail.id]: {
          type: 'image',
          headline: detailObj.headline || '',
          subheadline: detailObj.subheadline || '',
          visual: detailObj.visual || '',
          layout: detailObj.layout || '',
          captionWithHashtags: detail.caption 
            ? (detail.caption + (detail.hashtags && detail.hashtags.length > 0 ? ' ' + detail.hashtags.join(' ') : ''))
            : '',
        },
      });
    } else {
      setEditData({
        ...editData,
        [detail.id]: {
          detail: detail.detail ? JSON.stringify(detail.detail, null, 2) : '',
          captionWithHashtags: detail.caption 
            ? (detail.caption + (detail.hashtags && detail.hashtags.length > 0 ? ' ' + detail.hashtags.join(' ') : ''))
            : '',
        },
      });
    }
  };

  const handleCancelEdit = (detailId) => {
    setEditingDetail({ ...editingDetail, [detailId]: false });
    setEditData({ ...editData, [detailId]: null });
  };

  const handleSaveDetail = async (detailId) => {
    setSaving({ ...saving, [detailId]: true });
    try {
      const data = editData[detailId];
      let detailJson = null;

      // Build detail JSON berdasarkan tipe
      if (data.type === 'video') {
        detailJson = {
          type: 'video',
          duration: data.duration,
          scenes: data.scenes.filter(s => s.description.trim()),
          visual: data.visual,
          music: data.music,
        };
      } else if (data.type === 'carousel') {
        detailJson = {
          type: 'carousel',
          slideCount: parseInt(data.slideCount) || 4,
          slides: data.slides.filter(s => s.text.trim()),
          visualTone: data.visualTone,
        };
      } else if (data.type === 'image') {
        detailJson = {
          type: 'image',
          headline: data.headline,
          subheadline: data.subheadline,
          visual: data.visual,
          layout: data.layout,
        };
      } else if (data.detail) {
        // Fallback: parse JSON string
        try {
          detailJson = JSON.parse(data.detail);
        } catch (e) {
          toast.error('Format JSON detail tidak valid');
          setSaving({ ...saving, [detailId]: false });
          return;
        }
      }

      const captionWithHashtags = data.captionWithHashtags || '';
      const hashtagRegex = /#[\w]+/g;
      const foundHashtags = captionWithHashtags.match(hashtagRegex) || [];
      const hashtagsArray = foundHashtags.map(t => t.trim()).filter(t => t);
      const captionText = captionWithHashtags;

      const response = await updateBriefDetail(detailId, {
        detail: detailJson,
        caption: captionText,
        hashtags: hashtagsArray,
      });

      if (response && response.data && response.data.brief) {
        const updatedBrief = response.data.brief;
        setLocalBrief(updatedBrief);
        dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
      } else {
        if (brief && brief.details) {
          const updatedDetails = brief.details.map(d => 
            d.id === detailId ? { ...d, detail: response?.data?.detail || d.detail, caption: response?.data?.caption || d.caption, hashtags: response?.data?.hashtags || d.hashtags } : d
          );
          const updatedBrief = { ...brief, details: updatedDetails };
          setLocalBrief(updatedBrief);
          dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
        }
      }

      toast.success('Detail berhasil disimpan');
      setEditingDetail({ ...editingDetail, [detailId]: false });
      setEditData({ ...editData, [detailId]: null });
    } catch (error) {
      toast.error('Gagal menyimpan detail');
    } finally {
      setSaving({ ...saving, [detailId]: false });
    }
  };

  const getFunnelLabel = (value) => {
    const stage = FUNNEL_STAGES.find(s => s.value === value);
    return stage ? stage.label : value;
  };

  const handleEditIdea = (detail) => {
    setEditingIdea({ ...editingIdea, [detail.id]: true });
    setIdeaEditData({
      ...ideaEditData,
      [detail.id]: {
        platform: detail.platform || '',
        tag: detail.tag || 'video',
        title: detail.title || '',
        funnel: detail.funnel || 'awareness',
        cta: detail.cta || '',
        objectiveCampaign: detail.detail?.objectiveCampaign || '',
        decisionTrigger: detail.detail?.decisionTrigger || '',
        productValueHighlight: detail.detail?.productValueHighlight || '',
        communicationApproach: detail.detail?.communicationApproach || '',
        hookOpening: detail.detail?.hookOpening || '',
        mainContentPoints: Array.isArray(detail.detail?.mainContentPoints) ? detail.detail.mainContentPoints : [],
        breakdownDetail: detail.detail?.breakdownDetail || '',
        visualIdentityNote: detail.detail?.visualIdentityNote || '',
      },
    });
  };

  const handleCancelEditIdea = (detailId) => {
    setEditingIdea({ ...editingIdea, [detailId]: false });
    setIdeaEditData({ ...ideaEditData, [detailId]: null });
  };

  const handleSaveIdea = async (detailId) => {
    setSavingIdea({ ...savingIdea, [detailId]: true });
    try {
      const data = ideaEditData[detailId];
      const currentDetail = brief.details?.find(d => d.id === detailId);
      const existingDetail = currentDetail?.detail || {};
      
      const response = await updateBriefDetail(detailId, {
        platform: data.platform,
        tag: data.tag,
        title: data.title,
        funnel: data.funnel,
        cta: data.cta,
        detail: {
          ...existingDetail,
          objectiveCampaign: data.objectiveCampaign,
          decisionTrigger: data.decisionTrigger,
          productValueHighlight: data.productValueHighlight,
          communicationApproach: data.communicationApproach,
          hookOpening: data.hookOpening,
          mainContentPoints: Array.isArray(data.mainContentPoints) ? data.mainContentPoints : [],
          breakdownDetail: data.breakdownDetail,
          visualIdentityNote: data.visualIdentityNote,
        },
      });
      
      if (response && response.data && response.data.brief) {
        const updatedBrief = response.data.brief;
        setLocalBrief(updatedBrief);
        dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
      } else {
        if (brief && brief.details) {
          const updatedDetails = brief.details.map(d => 
            d.id === detailId ? { 
              ...d, 
              platform: data.platform || d.platform,
              tag: data.tag || d.tag,
              title: data.title || d.title,
              funnel: data.funnel || d.funnel,
              cta: data.cta || d.cta,
              detail: {
                ...d.detail,
                ...data,
              }
            } : d
          );
          const updatedBrief = { ...brief, details: updatedDetails };
          setLocalBrief(updatedBrief);
          dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
        }
      }
      
      toast.success('Brief berhasil disimpan');
      setEditingIdea({ ...editingIdea, [detailId]: false });
      setIdeaEditData({ ...ideaEditData, [detailId]: null });
    } catch (error) {
      toast.error('Gagal menyimpan brief');
    } finally {
      setSavingIdea({ ...savingIdea, [detailId]: false });
    }
  };

  const handleOpenDeleteModal = (detailId) => {
    setDeletingDetailId(detailId);
    setShowDeleteModal({ ...showDeleteModal, [detailId]: true });
  };

  const handleCloseDeleteModal = (detailId) => {
    setShowDeleteModal({ ...showDeleteModal, [detailId]: false });
    setDeletingDetailId(null);
  };

  const handleDeleteIdea = async (detailId) => {
    try {
      const response = await deleteBriefDetail(detailId);
      if (response && response.data && response.data.brief) {
        const updatedBrief = response.data.brief;
        setLocalBrief(updatedBrief);
        dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
      } else {
        if (brief && brief.details) {
          const updatedBrief = { ...brief, details: brief.details.filter(d => d.id !== detailId) };
          setLocalBrief(updatedBrief);
          dispatch(updateBrief({ 
            id: parseInt(id), 
            updatedBrief
          }));
        }
      }
      toast.success('Brief berhasil dihapus');
      window.dispatchEvent(new Event('briefsUpdated'));
      handleCloseDeleteModal(detailId);
    } catch (error) {
      toast.error('Gagal menghapus brief');
    }
  };

  const handleOpenApprovalModal = (detailId) => {
    const detail = brief?.details?.find(d => d && d.id === detailId);
    if (detail) {
      const status = detail.status || 'draft';
      const isFinalStatus = status === 'scheduled' || status === 'pending_approval' || status === 'approved' || status === 'rejected';
      if (isFinalStatus) {
        toast.error('Brief ini sudah di-submit dan tidak dapat diubah');
        return;
      }
    }
    
    setShowApprovalModal({ ...showApprovalModal, [detailId]: true });
    setApprovalData({
      ...approvalData,
      [detailId]: {
        scheduledAt: '',
        scheduledTime: '',
      },
    });
  };

  const handleCloseApprovalModal = (detailId) => {
    setShowApprovalModal({ ...showApprovalModal, [detailId]: false });
    setApprovalData({
      ...approvalData,
      [detailId]: null,
    });
  };

  const handleResubmit = async (detailId) => {
    const detail = brief?.details?.find(d => d.id === detailId);
    if (!detail) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultScheduledAt = tomorrow.toISOString().split('T')[0];
      const defaultScheduledTime = '09:00';

      const response = await submitDetailForApproval(detailId, {
        scheduledAt: defaultScheduledAt,
        scheduledTime: defaultScheduledTime,
      });

      if (response && response.data && response.data.brief) {
        const updatedBrief = response.data.brief;
        setLocalBrief(updatedBrief);
        dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
        window.dispatchEvent(new Event('briefsUpdated'));
        toast.success('Detail berhasil di-resubmit dan masuk ke approval');
      } else {
        await fetchBrief(true);
        window.dispatchEvent(new Event('briefsUpdated'));
        toast.success('Detail berhasil di-resubmit dan masuk ke approval');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Gagal resubmit detail';
      toast.error(errorMessage);
    }
  };

  const handleSubmitApproval = async (detailId) => {
    const data = approvalData[detailId];
    
    if (!data?.scheduledAt || !data?.scheduledTime) {
      toast.error('Tanggal dan waktu posting wajib diisi');
      return;
    }

    const [year, month, day] = data.scheduledAt.split('-').map(Number);
    const [hours, minutes] = data.scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    
    if (scheduledDateTime < now) {
      toast.error('Tanggal dan waktu posting tidak boleh di masa lalu');
      return;
    }

    setSubmittingApproval({ ...submittingApproval, [detailId]: true });
    try {
      const response = await submitDetailForApproval(detailId, {
        scheduledAt: data.scheduledAt,
        scheduledTime: data.scheduledTime,
      });
      
      if (response && response.data && response.data.brief) {
        const updatedBrief = response.data.brief;
        setLocalBrief(updatedBrief);
        dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
        window.dispatchEvent(new Event('briefsUpdated'));
      } else {
        if (brief && brief.details) {
          const updatedDetails = brief.details.map(d => 
            d.id === detailId ? { 
              ...d, 
              status: 'pending_approval',
              scheduledAt: data.scheduledAt,
              scheduledTime: data.scheduledTime
            } : d
          );
          const updatedBrief = { ...brief, details: updatedDetails };
          setLocalBrief(updatedBrief);
          dispatch(updateBrief({ id: parseInt(id), updatedBrief }));
          window.dispatchEvent(new Event('briefsUpdated'));
        }
      }
      
      const isAdmin = user?.role === 'admin';
      if (isAdmin) {
        toast.success('Brief berhasil dijadwalkan dan langsung tampil di kalender');
      } else {
        toast.success('Brief berhasil di-submit untuk approval');
      }
      
      handleCloseApprovalModal(detailId);
      window.dispatchEvent(new Event('briefsUpdated'));
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal submit approval';
      toast.error(message);
    } finally {
      setSubmittingApproval({ ...submittingApproval, [detailId]: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (!displayBrief && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-semibold">Brief tidak ditemukan</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          {!error && (
            <p className="text-gray-400 text-sm mt-2">ID: {id}</p>
          )}
        </div>
      </div>
    );
  }

  const totalDetails = displayBrief?.details?.length || 0;
  const readyDetails = displayBrief?.details?.filter((d) => {
    if (!d) return false;
    const status = d.status || 'draft';
    const isFinalStatus = status === 'scheduled' || status === 'pending_approval' || status === 'approved' || status === 'rejected';
    return !isFinalStatus;
  }).length || 0;
  const approvedDetails = displayBrief?.details?.filter((d) => d && (d.status === 'approved' || d.status === 'scheduled')).length || 0;
  const rejectedDetails = displayBrief?.details?.filter((d) => d && d.status === 'rejected').length || 0;

  const getToneOfVoiceLabel = (value) => {
    const tone = TONE_OF_VOICE.find(t => t.value === value);
    return tone ? tone.label : value;
  };

  const getBriefTypeLabel = (value) => {
    if (!value) return '-';
    const types = value.split(',').map(v => {
      const type = BRIEF_TYPES.find(t => t.value === v.trim());
      return type ? type.label : v.trim();
    });
    return types.join(', ');
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Membuat Detail Brief</h1>
              <p className="text-primary-100 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1 break-words">
                Produk: {displayBrief?.product?.name || brief?.product?.name || '-'}
              </p>
            </div>
          </div>
          {/* Status is only managed at BriefDetail level, not parent Brief */}
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Total Ide</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalDetails}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Ide konten</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Belum Disubmit</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{readyDetails}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Draft & Siap Submit</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Hourglass className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Menunggu Review</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{displayBrief?.details?.filter((d) => d && d.status === 'pending_approval').length || 0}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Menunggu review</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Disetujui</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{approvedDetails}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Brief disetujui</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Ditolak</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{rejectedDetails}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Brief ditolak</p>
          </div>
        </div>
      </div>

      {/* Product Card & Informasi Brief - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Product Card */}
        {(displayBrief?.product || brief?.product) && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Produk</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {/* Product Image */}
                {(displayBrief?.product || brief?.product)?.imageUrl && (
                  <div className="flex-shrink-0 w-full sm:w-40 lg:w-48">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 shadow-lg group">
                      <img
                        src={(displayBrief?.product || brief?.product)?.imageUrl?.startsWith('http') ? (displayBrief?.product || brief?.product)?.imageUrl : `https://planner.kemalwicaksono.com${(displayBrief?.product || brief?.product)?.imageUrl}`}
                        alt={(displayBrief?.product || brief?.product)?.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                )}
                
                {/* Product Info */}
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 break-words leading-tight">{(displayBrief?.product || brief?.product)?.name}</h3>
                  {(displayBrief?.product || brief?.product)?.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-4">{(displayBrief?.product || brief?.product)?.description}</p>
                  )}
                  {(displayBrief?.product || brief?.product)?.link && (
                    <a
                      href={(displayBrief?.product || brief?.product)?.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Link Produk
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Brief */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Informasi Brief</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="text-xs sm:text-sm text-gray-600">Target Market:</span>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 break-words">{(displayBrief || brief)?.targetMarket || '-'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">Gaya Bahasa:</span>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 break-words">{getToneOfVoiceLabel((displayBrief || brief)?.toneOfVoice) || '-'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">Jenis Brief:</span>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 break-words">{getBriefTypeLabel((displayBrief || brief)?.briefType) || '-'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">Funnel:</span>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 break-words">
                  {(displayBrief || brief)?.funnelStage ? (displayBrief || brief).funnelStage.split(',').map((f, idx) => (
                    <span key={`funnel-${(displayBrief || brief)?.id}-${idx}-${f.trim()}`}>
                      {idx > 0 && ', '}
                      {getFunnelLabel(f.trim())}
                    </span>
                  )) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brief */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Brief</h2>
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 border-b border-primary-200/50 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg flex-shrink-0">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1.5">
                Generate Detail Produksi
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3 sm:mb-4">
                Silakan klik tombol Generate Detail Produksi untuk setiap ide konten, atau gunakan tombol di bawah untuk generate semua sekaligus.
              </p>
              <button
                type="button"
                onClick={handleGenerateAllDetails}
                disabled={
                  !brief?.details || 
                  brief.details.length === 0 ||
                  brief.details.every(d => d.detail && d.detail.type) ||
                  Object.values(generatingDetail).some(v => v)
                }
                className="inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm transform hover:scale-105 active:scale-100 w-full sm:w-auto justify-center"
              >
                {Object.values(generatingDetail).some(v => v) ? (
                  <>
                    <Loader size="sm" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Generate Semua Detail</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="shadow-inner overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
              <tr>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase sticky left-0 bg-gradient-to-r from-primary-600 to-primary-700 z-20 w-8 shadow-lg border-r border-primary-500/30">
                  No
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-20">
                  Format
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-24">
                  Judul
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-20">
                  Objective
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-16">
                  Funnel
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-20">
                  Trigger
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-24">
                  Value
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-20">
                  Approach
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-24">
                  Hook
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-28">
                  Content Points
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-16">
                  CTA
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-24">
                  Breakdown
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-24">
                  Visual
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase w-16">
                  Status
                </th>
                <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase sticky right-0 bg-gradient-to-r from-primary-600 to-primary-700 z-20 w-16 shadow-lg border-l border-primary-400/30">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayBrief?.details?.map((detail, index) => (
                <Fragment key={detail.id}>
                  <tr className={`transition-colors duration-150 ${
                      editingIdea[detail.id] 
                        ? 'bg-primary-50/50 hover:bg-primary-50' 
                        : 'hover:bg-primary-50/80'
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-1.5 py-2 text-xs font-semibold text-gray-700 sticky left-0 bg-inherit z-10 w-8 border-r border-gray-200/50">
                      <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 text-xs">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-1.5 py-2 text-xs w-20 border-r border-gray-200/50 text-center">
                      {editingIdea[detail.id] ? (
                        <div className="space-y-2">
                          <select
                            value={ideaEditData[detail.id]?.platform || ''}
                            onChange={(e) => setIdeaEditData({
                              ...ideaEditData,
                              [detail.id]: { ...ideaEditData[detail.id], platform: e.target.value }
                            })}
                            className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          >
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Shopee">Shopee</option>
                            <option value="Meta">Meta</option>
                            <option value="YouTube">YouTube</option>
                          </select>
                          <select
                            value={ideaEditData[detail.id]?.tag || 'video'}
                            onChange={(e) => setIdeaEditData({
                              ...ideaEditData,
                              [detail.id]: { ...ideaEditData[detail.id], tag: e.target.value }
                            })}
                            className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          >
                            <option value="video">Video</option>
                            <option value="carousel">Carousel</option>
                            <option value="image">Image</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <div className="text-center mb-1">
                            <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">{detail.platform}</span>
                          </div>
                          <div className="text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize shadow-sm whitespace-nowrap inline-block ${
                              detail.tag === 'video' 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : detail.tag === 'carousel'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {detail.tag}
                            </span>
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs w-24 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <input
                          type="text"
                          value={ideaEditData[detail.id]?.title || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], title: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          placeholder="Judul..."
                        />
                      ) : (
                        <span className="font-semibold text-gray-800 whitespace-normal break-words text-xs leading-tight">{detail.title}</span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-20 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <textarea
                          value={ideaEditData[detail.id]?.objectiveCampaign || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], objectiveCampaign: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          rows="2"
                          placeholder="Objective..."
                        />
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight">
                          {(() => {
                            const value = detail.detail?.objectiveCampaign;
                            if (!value) return '-';
                            if (typeof value === 'object') {
                              return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
                            }
                            return String(value);
                          })()}
                        </span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-16 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <select
                          value={ideaEditData[detail.id]?.funnel || 'awareness'}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], funnel: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                        >
                          {FUNNEL_STAGES.map((stage) => (
                            <option key={stage.value} value={stage.value}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight">{getFunnelLabel(detail.funnel)}</span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-20 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <input
                          type="text"
                          value={ideaEditData[detail.id]?.decisionTrigger || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], decisionTrigger: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          placeholder="Trigger..."
                        />
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight">
                          {(() => {
                            const value = detail.detail?.decisionTrigger;
                            if (!value) return '-';
                            if (typeof value === 'object') {
                              return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
                            }
                            return String(value);
                          })()}
                        </span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-24 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <textarea
                          value={ideaEditData[detail.id]?.productValueHighlight || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], productValueHighlight: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          rows="2"
                          placeholder="Value..."
                        />
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight">
                          {(() => {
                            const value = detail.detail?.productValueHighlight;
                            if (!value) return '-';
                            if (typeof value === 'object') {
                              return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
                            }
                            return String(value);
                          })()}
                        </span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-20 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <input
                          type="text"
                          value={ideaEditData[detail.id]?.communicationApproach || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], communicationApproach: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          placeholder="Approach..."
                        />
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight">
                          {(() => {
                            const value = detail.detail?.communicationApproach;
                            if (!value) return '-';
                            if (typeof value === 'object') {
                              return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
                            }
                            return String(value);
                          })()}
                        </span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-24 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <textarea
                          value={ideaEditData[detail.id]?.hookOpening || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], hookOpening: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          rows="2"
                          placeholder="Hook..."
                        />
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight">
                          {(() => {
                            const value = detail.detail?.hookOpening;
                            if (!value) return '-';
                            if (typeof value === 'object') {
                              return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
                            }
                            return String(value);
                          })()}
                        </span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-28 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <textarea
                          value={Array.isArray(ideaEditData[detail.id]?.mainContentPoints) ? ideaEditData[detail.id].mainContentPoints.join('\n') : ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], mainContentPoints: e.target.value.split('\n').filter(p => p.trim()) }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          rows="2"
                          placeholder="Content points..."
                        />
                      ) : (
                        <div className="space-y-0.5">
                          {Array.isArray(detail.detail?.mainContentPoints) && detail.detail.mainContentPoints.length > 0 ? (
                            detail.detail.mainContentPoints.map((point, i) => (
                              <div key={`point-${detail.id}-${i}`} className="text-xs text-gray-700 leading-tight">• {point}</div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-16 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <input
                          type="text"
                          value={ideaEditData[detail.id]?.cta || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], cta: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          placeholder="CTA..."
                        />
                      ) : (
                        <span className="whitespace-normal break-words text-xs leading-tight font-medium">{detail.cta || '-'}</span>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-24 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <textarea
                          value={ideaEditData[detail.id]?.breakdownDetail || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], breakdownDetail: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          rows="2"
                          placeholder="Breakdown..."
                        />
                      ) : (
                        <div className="text-xs whitespace-normal break-words leading-tight space-y-1">
                          {(() => {
                            const value = detail.detail?.breakdownDetail;
                            if (!value) return <span className="text-gray-400">-</span>;
                            if (typeof value === 'object') {
                              // Format object menjadi readable text
                              if (Array.isArray(value)) {
                                // Jika array, format sebagai list
                                return value.map((item, idx) => {
                                  if (typeof item === 'object' && item !== null) {
                                    if (item.time && item.description) {
                                      return (
                                        <div key={`breakdown-${detail.id}-${idx}-${item.time}`} className="mb-1">
                                          <span className="font-semibold text-primary-600">{item.time}:</span> {item.description}
                                        </div>
                                      );
                                    }
                                    // Object lainnya
                                    return (
                                      <div key={`breakdown-${detail.id}-${idx}-obj`} className="mb-1">
                                        {Object.entries(item).map(([key, val]) => (
                                          <div key={`breakdown-${detail.id}-${idx}-${key}`} className="ml-2">
                                            <span className="font-medium">{key}:</span> {String(val)}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return <div key={`breakdown-${detail.id}-${idx}-${String(item).substring(0, 10)}`} className="mb-1">• {String(item)}</div>;
                                });
                              } else {
                                // Jika object, format menjadi list
                                return Object.entries(value).map(([key, val]) => {
                                  if (Array.isArray(val)) {
                                    return (
                                      <div key={key} className="mb-1">
                                        <span className="font-semibold text-primary-600">{key}:</span>
                                        <div className="ml-2 mt-0.5">
                                          {val.map((v, i) => (
                                            <div key={`breakdown-${detail.id}-${key}-${i}-${String(v).substring(0, 10)}`}>• {String(v)}</div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  } else if (typeof val === 'object' && val !== null) {
                                    return (
                                      <div key={key} className="mb-1">
                                        <span className="font-semibold text-primary-600">{key}:</span>
                                        <div className="ml-2 mt-0.5">
                                          {Object.entries(val).map(([k, v]) => (
                                            <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={key} className="mb-1">
                                      <span className="font-semibold text-primary-600">{key}:</span> {String(val)}
                                    </div>
                                  );
                                });
                              }
                            }
                            return <span>{String(value)}</span>;
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs text-gray-700 w-24 border-r border-gray-200/50">
                      {editingIdea[detail.id] ? (
                        <textarea
                          value={ideaEditData[detail.id]?.visualIdentityNote || ''}
                          onChange={(e) => setIdeaEditData({
                            ...ideaEditData,
                            [detail.id]: { ...ideaEditData[detail.id], visualIdentityNote: e.target.value }
                          })}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs bg-white shadow-sm"
                          rows="2"
                          placeholder="Visual..."
                        />
                      ) : (
                        <div className="text-xs whitespace-normal break-words leading-tight space-y-1">
                          {(() => {
                            const value = detail.detail?.visualIdentityNote;
                            if (!value) return <span className="text-gray-400">-</span>;
                            if (typeof value === 'object') {
                              // Format object menjadi readable text
                              if (Array.isArray(value)) {
                                return value.map((item, idx) => (
                                  <div key={`visual-${detail.id}-${idx}-${String(item).substring(0, 10)}`} className="mb-1">• {String(item)}</div>
                                ));
                              } else {
                                // Jika object, format menjadi list
                                return Object.entries(value).map(([key, val]) => {
                                  if (Array.isArray(val)) {
                                    return (
                                      <div key={key} className="mb-1">
                                        <span className="font-semibold text-primary-600">{key}:</span>
                                        <div className="ml-2 mt-0.5">
                                          {val.map((v, i) => (
                                            <div key={`breakdown-${detail.id}-${key}-${i}-${String(v).substring(0, 10)}`}>• {String(v)}</div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  } else if (typeof val === 'object' && val !== null) {
                                    return (
                                      <div key={key} className="mb-1">
                                        <span className="font-semibold text-primary-600">{key}:</span>
                                        <div className="ml-2 mt-0.5">
                                          {Object.entries(val).map(([k, v]) => (
                                            <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={key} className="mb-1">
                                      <span className="font-semibold text-primary-600">{key}:</span> {String(val)}
                                    </div>
                                  );
                                });
                              }
                            }
                            return <span>{String(value)}</span>;
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="px-1.5 py-2 text-xs w-16 border-r border-gray-200/50 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {(() => {
                          const status = detail.status || 'draft';
                          const isComplete = isDetailComplete(detail);
                          let displayStatus = status;
                          if (status === 'pending_approval' || status === 'scheduled' || status === 'approved' || status === 'rejected') {
                            displayStatus = status;
                          } else if (status === 'ready' && isComplete) {
                            displayStatus = 'ready';
                          } else if (status === 'draft' && isComplete) {
                            displayStatus = 'ready';
                          } else {
                            displayStatus = 'draft';
                          }
                          return (
                            <StatusBadge status={displayStatus}>
                              {getStatusLabel(displayStatus)}
                            </StatusBadge>
                          );
                        })()}
                        {(() => {
                          const status = detail.status || 'draft';
                          const isComplete = isDetailComplete(detail);
                          const isFinalStatus = status === 'scheduled' || status === 'pending_approval' || status === 'approved' || status === 'rejected';
                          if (isComplete && !isFinalStatus) {
                            return (
                              <button
                                type="button"
                                onClick={() => handleOpenApprovalModal(detail.id)}
                                className="px-2 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-1 w-full shadow-sm hover:shadow-md"
                                title="Submit for Approval"
                              >
                                <Send className="w-3 h-3" />
                                Submit
                              </button>
                            );
                          }
                          return null;
                        })()}
                        {detail.status === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleResubmit(detail.id)}
                            className="px-2 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-1 w-full shadow-sm hover:shadow-md"
                            title="Resubmit Detail"
                          >
                            <Send className="w-3 h-3" />
                            Resubmit
                          </button>
                        )}
                        {detail.status === 'scheduled' && detail.scheduledAt && (
                          <span className="text-xs text-gray-500 text-center">
                            {new Date(detail.scheduledAt).toLocaleString('id-ID', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-1 py-2 text-xs sticky right-0 bg-inherit z-10 w-16 border-l border-gray-200/50">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {!editingIdea[detail.id] && (
                          <>
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => handleEditIdea(detail)}
                                className="p-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-primary-50 transition-colors"
                                title="Edit Brief"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                Edit Brief
                                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-800"></div>
                              </div>
                            </div>
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!generatingDetail[detail.id]) {
                                    handleGenerateDetail(detail.id);
                                  }
                                }}
                                disabled={generatingDetail[detail.id]}
                                className="p-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                title="Generate Detail Produksi"
                              >
                                {generatingDetail[detail.id] ? (
                                  <Loader size="sm" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                {generatingDetail[detail.id] ? "Generating..." : "Generate Detail Produksi"}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-800"></div>
                              </div>
                            </div>
                            {detail.detail && detail.detail.type && (
                              <div className="relative group">
                                <button
                                  type="button"
                                  onClick={() => toggleDetail(detail.id)}
                                  className="p-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-primary-50 transition-colors"
                                  title={expandedDetails[detail.id] ? "Sembunyikan Detail Produksi" : "Lihat Detail Produksi"}
                                >
                                  {expandedDetails[detail.id] ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                  {expandedDetails[detail.id] ? "Sembunyikan Detail Produksi" : "Lihat Detail Produksi"}
                                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-800"></div>
                                </div>
                              </div>
                            )}
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenDeleteModal(detail.id);
                                }}
                                className="p-1.5 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Hapus Brief"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                Hapus Brief
                                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-800"></div>
                              </div>
                            </div>
                          </>
                        )}
                        {editingIdea[detail.id] && (
                          <>
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => handleSaveIdea(detail.id)}
                                disabled={savingIdea[detail.id]}
                                className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                title={savingIdea[detail.id] ? "Menyimpan..." : "Simpan Perubahan"}
                              >
                                {savingIdea[detail.id] ? (
                                  <Loader size="sm" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                {savingIdea[detail.id] ? "Menyimpan..." : "Simpan Perubahan"}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-800"></div>
                              </div>
                            </div>
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => handleCancelEditIdea(detail.id)}
                                className="p-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-primary-400 transition-colors"
                                title="Batal Edit"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                Batal Edit
                                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-800"></div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Detail Section - Production Detail (not idea content) */}
                  {detail.detail && expandedDetails[detail.id] && detail.detail.type && (
                    <tr key={`detail-${detail.id}`} className="bg-gradient-to-r from-gray-50 to-primary-50/30">
                      <td colSpan={15} className="px-6 py-6 border-t-2 border-gray-200">
                      <div className="space-y-4">
                        {editingDetail[detail.id] ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-800">Edit Detail Konten</h4>
                              <div className="flex gap-2">
                                <div className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveDetail(detail.id)}
                                    disabled={saving[detail.id]}
                                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    title={saving[detail.id] ? "Menyimpan..." : "Simpan Detail Produksi"}
                                  >
                                    {saving[detail.id] ? (
                                      <Loader size="sm" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                  </button>
                                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                    {saving[detail.id] ? "Menyimpan..." : "Simpan Detail Produksi"}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => handleCancelEdit(detail.id)}
                                    className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-primary-400 transition-colors"
                                    title="Batal Edit"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                    Batal Edit
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Form based on type */}
                            {editData[detail.id]?.type === 'video' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Durasi
                                  </label>
                                  <input
                                    type="text"
                                    value={editData[detail.id]?.duration || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], duration: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="15 detik"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Scene Breakdown
                                  </label>
                                  <div className="space-y-2">
                                    {editData[detail.id]?.scenes?.map((scene, i) => (
                                      <div key={i} className="flex gap-2">
                                        <input
                                          type="text"
                                          value={scene.time}
                                          onChange={(e) => {
                                            const newScenes = [...editData[detail.id].scenes];
                                            newScenes[i] = { ...newScenes[i], time: e.target.value };
                                            setEditData({
                                              ...editData,
                                              [detail.id]: { ...editData[detail.id], scenes: newScenes }
                                            });
                                          }}
                                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                          placeholder="0-3s"
                                        />
                                        <textarea
                                          value={scene.description}
                                          onChange={(e) => {
                                            const newScenes = [...editData[detail.id].scenes];
                                            newScenes[i] = { ...newScenes[i], description: e.target.value };
                                            setEditData({
                                              ...editData,
                                              [detail.id]: { ...editData[detail.id], scenes: newScenes }
                                            });
                                          }}
                                          rows={2}
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                          placeholder="Deskripsi scene..."
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visual Description
                                  </label>
                                  <textarea
                                    value={editData[detail.id]?.visual || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], visual: e.target.value }
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Deskripsi visual..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Music Suggestion
                                  </label>
                                  <input
                                    type="text"
                                    value={editData[detail.id]?.music || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], music: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Upbeat cheerful"
                                  />
                                </div>
                              </>
                            )}
                            {editData[detail.id]?.type === 'carousel' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jumlah Slide
                                  </label>
                                  <input
                                    type="number"
                                    value={editData[detail.id]?.slideCount || 4}
                                    onChange={(e) => {
                                      const count = parseInt(e.target.value) || 4;
                                      const currentSlides = editData[detail.id]?.slides || [];
                                      const newSlides = Array.from({ length: count }, (_, i) => 
                                        currentSlides[i] || { slide: i + 1, text: '' }
                                      );
                                      setEditData({
                                        ...editData,
                                        [detail.id]: { ...editData[detail.id], slideCount: count, slides: newSlides }
                                      });
                                    }}
                                    min="1"
                                    max="10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Konten Slide
                                  </label>
                                  <div className="space-y-2">
                                    {editData[detail.id]?.slides?.map((slide, i) => (
                                      <div key={i} className="flex gap-2 items-start">
                                        <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium min-w-[60px] text-center">
                                          Slide {slide.slide}
                                        </span>
                                        <textarea
                                          value={slide.text}
                                          onChange={(e) => {
                                            const newSlides = [...editData[detail.id].slides];
                                            newSlides[i] = { ...newSlides[i], text: e.target.value };
                                            setEditData({
                                              ...editData,
                                              [detail.id]: { ...editData[detail.id], slides: newSlides }
                                            });
                                          }}
                                          rows={2}
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                          placeholder="Teks slide..."
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visual Tone
                                  </label>
                                  <textarea
                                    value={editData[detail.id]?.visualTone || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], visualTone: e.target.value }
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Deskripsi visual tone..."
                                  />
                                </div>
                              </>
                            )}
                            {editData[detail.id]?.type === 'image' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Headline
                                  </label>
                                  <input
                                    type="text"
                                    value={editData[detail.id]?.headline || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], headline: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Headline yang kuat..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subheadline
                                  </label>
                                  <textarea
                                    value={editData[detail.id]?.subheadline || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], subheadline: e.target.value }
                                    })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Subheadline yang mendukung..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visual Description
                                  </label>
                                  <textarea
                                    value={editData[detail.id]?.visual || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], visual: e.target.value }
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Deskripsi visual..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Layout Description
                                  </label>
                                  <textarea
                                    value={editData[detail.id]?.layout || ''}
                                    onChange={(e) => setEditData({
                                      ...editData,
                                      [detail.id]: { ...editData[detail.id], layout: e.target.value }
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                    placeholder="Deskripsi layout..."
                                  />
                                </div>
                              </>
                            )}
                            {!editData[detail.id]?.type && editData[detail.id]?.detail && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Detail (JSON)
                                </label>
                                <textarea
                                  value={editData[detail.id]?.detail || ''}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    [detail.id]: { ...editData[detail.id], detail: e.target.value }
                                  })}
                                  rows={10}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                  placeholder='{"type": "video", ...}'
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Caption & Hashtags
                              </label>
                              <textarea
                                value={editData[detail.id]?.captionWithHashtags || ''}
                                onChange={(e) => setEditData({
                                  ...editData,
                                  [detail.id]: { ...editData[detail.id], captionWithHashtags: e.target.value }
                                })}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                placeholder="Masukkan caption (minimal 3-5 kalimat) dan tambahkan hashtag di akhir..."
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Tulis caption yang panjang dan menarik, lalu tambahkan hashtag di akhir (contoh: #hashtag1 #hashtag2)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-800">Detail Konten</h4>
                              <div className="relative group">
                                <button
                                  type="button"
                                  onClick={() => handleEditDetail(detail)}
                                  className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-primary-50 transition-colors"
                                  title="Edit Detail Produksi"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                  Edit Detail Produksi
                                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                              </div>
                            </div>

                            {/* Alasan Penolakan - Tampilkan paling atas jika status rejected */}
                            {detail.status === 'rejected' && (
                              <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-lg p-4 shadow-md w-full min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <span className="text-base font-bold text-red-700">Alasan Penolakan</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleResubmit(detail.id)}
                                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                    title="Resubmit Detail"
                                  >
                                    <Send className="w-4 h-4" />
                                    Resubmit
                                  </button>
                                </div>
                                <div className="bg-white border-2 border-red-300 rounded-lg p-4 mb-3">
                                  <p className="text-sm text-red-800 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere font-medium">
                                    {detail.rejectionReason || 'Tidak ada alasan penolakan yang diberikan'}
                                  </p>
                                </div>
                                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-yellow-800 leading-relaxed font-medium">
                                      <span className="font-bold">Penting:</span> Silakan edit dan perbaiki detail sesuai alasan penolakan di atas sebelum melakukan resubmit.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Display Detail */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                              {detail.detail.type === 'video' && (
                                <>
                                  {detail.detail.duration && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Durasi:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.duration}</p>
                                    </div>
                                  )}
                                  {detail.detail.scenes && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Scene Breakdown:</span>
                                      <div className="mt-2 space-y-2">
                                        {(() => {
                                          // Handle both array and object formats
                                          let scenes = detail.detail.scenes;
                                          if (!Array.isArray(scenes)) {
                                            // Convert object to array
                                            scenes = Object.keys(scenes).map(key => {
                                              const scene = scenes[key];
                                              return typeof scene === 'object' ? { ...scene, time: scene.time || key } : { time: key, description: scene || '' };
                                            });
                                          }
                                          return scenes.map((scene, i) => (
                                            <div key={`scene-${detail.id}-${i}`} className="bg-gray-50 p-3 rounded border border-gray-200">
                                              <span className="text-xs font-semibold text-primary-600">{scene.time || `Scene ${i + 1}`}</span>
                                              <p className="text-sm text-gray-700 mt-1">{scene.description || '-'}</p>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                  {detail.detail.visual && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Visual Description:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.visual}</p>
                                    </div>
                                  )}
                                  {detail.detail.music && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Music Suggestion:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.music}</p>
                                    </div>
                                  )}
                                </>
                              )}
                              {detail.detail.type === 'carousel' && (
                                <>
                                  {detail.detail.slideCount && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Jumlah Slide:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.slideCount}</p>
                                    </div>
                                  )}
                                  {detail.detail.slides && Array.isArray(detail.detail.slides) && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Konten Slide:</span>
                                      <div className="mt-2 space-y-2">
                                        {detail.detail.slides.map((slide, i) => (
                                          <div key={`slide-${detail.id}-${i}`} className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <span className="text-xs font-semibold text-primary-600">Slide {slide.slide}</span>
                                            <p className="text-sm text-gray-700 mt-1">{slide.text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {detail.detail.visualTone && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Visual Tone:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.visualTone}</p>
                                    </div>
                                  )}
                                </>
                              )}
                              {detail.detail.type === 'image' && (
                                <>
                                  {detail.detail.headline && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Headline:</span>
                                      <p className="text-gray-800 mt-1 font-semibold">{detail.detail.headline}</p>
                                    </div>
                                  )}
                                  {detail.detail.subheadline && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Subheadline:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.subheadline}</p>
                                    </div>
                                  )}
                                  {detail.detail.visual && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Visual Description:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.visual}</p>
                                    </div>
                                  )}
                                  {detail.detail.layout && (
                                    <div>
                                      <span className="text-sm font-medium text-gray-600">Layout Description:</span>
                                      <p className="text-gray-800 mt-1">{detail.detail.layout}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Caption & Hashtags */}
                            {detail.caption && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Caption & Hashtags:</span>
                                <div className="bg-primary-50 border border-primary-400 rounded-lg p-4 mt-1">
                                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                    {detail.caption}
                                    {/* Show additional hashtags if they exist separately and not already in caption */}
                                    {detail.hashtags && detail.hashtags.length > 0 && 
                                     !detail.caption.match(/#[\w]+/g) && (
                                      <span className="block mt-2">
                                        {detail.hashtags.map((tag, i) => (
                                          <span key={`hashtag-${detail.id}-${i}`} className="text-primary-600 font-medium mr-2">{tag}</span>
                                        ))}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {displayBrief?.details?.map((detail) => (
        <Modal
          key={`approval-${detail.id}`}
          isOpen={showApprovalModal[detail.id] || false}
          onClose={() => handleCloseApprovalModal(detail.id)}
          title="Submit for Approval"
          size="md"
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-primary-600 rounded-lg">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm text-primary-800 flex-1">
                  {user?.role === 'admin' 
                    ? 'Sebagai admin, brief akan langsung dijadwalkan setelah Anda submit.'
                    : 'Permintaan approval akan dikirim ke admin. Brief akan dijadwalkan setelah disetujui.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary-600" />
                  Tanggal Posting <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-primary-500" />
                  </div>
                  <input
                    type="date"
                    value={approvalData[detail.id]?.scheduledAt || ''}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      [detail.id]: { ...approvalData[detail.id], scheduledAt: e.target.value }
                    })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-600" />
                  Waktu Posting <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-500">(Format 24 jam)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-primary-500" />
                  </div>
                  <input
                    type="time"
                    step="60"
                    value={approvalData[detail.id]?.scheduledTime || ''}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      [detail.id]: { ...approvalData[detail.id], scheduledTime: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white text-gray-800 font-medium [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{ 
                      fontVariantNumeric: 'tabular-nums',
                      colorScheme: 'light'
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Contoh: 09:00, 14:30, 23:59</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleCloseApprovalModal(detail.id)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSubmitApproval(detail.id)}
                disabled={submittingApproval[detail.id] || !approvalData[detail.id]?.scheduledAt || !approvalData[detail.id]?.scheduledTime}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {submittingApproval[detail.id] ? (
                  <>
                    <Loader size="sm" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      ))}

      {/* Delete Confirmation Modal */}
      {displayBrief?.details?.map((detail) => (
        <Modal
          key={`delete-${detail.id}`}
          isOpen={showDeleteModal[detail.id] || false}
          onClose={() => handleCloseDeleteModal(detail.id)}
          title="Konfirmasi Hapus"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Yakin ingin menghapus brief ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleCloseDeleteModal(detail.id)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteIdea(detail.id);
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-800 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      ))}
    </div>
  );
}

