import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPendingApprovals, approveBrief, rejectBrief } from '../../services/admin.api';
import { getBriefs } from '../../services/brief.api';
import { setBriefs } from '../../store/briefSlice';
import { FileText, Clock, CheckCircle, Sparkles, ChevronDown, ChevronUp, Target, TrendingUp, MessageSquare, Zap, Eye, Package, Image, Video, Layers, XCircle, ExternalLink, AlertTriangle, Hourglass } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { FUNNEL_STAGES, getStatusLabel } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

export default function BriefReview() {
  const [pendingBriefs, setPendingBriefs] = useState([]);
  const allBriefs = useSelector((state) => state.brief.briefs);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedDetails, setExpandedDetails] = useState({});

  useEffect(() => {
    fetchApprovals();
    fetchAllBriefs();
  }, []);

  // Auto-refresh data setiap 5 detik untuk menjaga statistik tetap update (sama seperti Dashboard)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApprovals();
      fetchAllBriefs();
    }, 5000); // 5 detik untuk update yang lebih cepat

    return () => clearInterval(interval);
  }, []);

  // Dengarkan event storage untuk refresh ketika data berubah di tab/window lain (sama seperti Dashboard)
  useEffect(() => {
    const handleStorageChange = () => {
      fetchApprovals();
      fetchAllBriefs();
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
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await getPendingApprovals();
      setPendingBriefs(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal memuat approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBriefs = async () => {
    try {
      const response = await getBriefs();
      dispatch(setBriefs(response.data));
    } catch (error) {
      // Gagal diam-diam
    }
  };

  const getBriefsThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999); // Sertakan akhir hari
    
    // Hitung total ide konten (details) yang dibuat bulan ini berdasarkan detail.createdAt
    return allBriefs.reduce((total, brief) => {
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


  // Filter brief yang memiliki details (sama seperti Dashboard)
  const briefsWithDetails = useMemo(() => {
    if (!allBriefs || !Array.isArray(allBriefs)) return [];
    return allBriefs.filter(brief => 
      brief && brief.details && Array.isArray(brief.details) && brief.details.length > 0
    );
  }, [allBriefs]);

  const getPendingDetailsCount = useMemo(() => {
    // Hitung total detail dengan status 'pending_approval' (konsisten dengan Dashboard)
    if (!briefsWithDetails || briefsWithDetails.length === 0) return 0;
    return briefsWithDetails.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      return total + brief.details.filter(d => d && d.status === 'pending_approval').length;
    }, 0);
  }, [briefsWithDetails]);

  const getApprovedCount = () => {
    // Hitung detail brief dengan status 'approved' atau 'scheduled'
    // Status hanya dikelola di level BriefDetail, bukan parent Brief
    return allBriefs.reduce((total, brief) => {
      if (!brief || !brief.details || !Array.isArray(brief.details)) return total;
      
      return total + brief.details.filter(d => 
        d && (d.status === 'approved' || d.status === 'scheduled')
      ).length;
    }, 0);
  };

  const getRejectedCount = () => {
    // Hitung detail brief dengan status 'rejected'
    // Status hanya dikelola di level BriefDetail, bukan parent Brief
    return allBriefs.reduce((total, brief) => {
      if (brief.details && Array.isArray(brief.details)) {
        return total + brief.details.filter(d => d && d.status === 'rejected').length;
      }
      return total;
    }, 0);
  };

  const getFunnelLabel = (value) => {
    const stage = FUNNEL_STAGES.find(s => s.value === value);
    return stage ? stage.label : value;
  };


  const isUrgent = (scheduledAt) => {
    if (!scheduledAt) return false;
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const diffTime = scheduledDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Urgent jika dijadwalkan dalam 3 hari (termasuk hari ini)
    return diffDays >= 0 && diffDays <= 3;
  };

  const toggleDetail = (detailId) => {
    setExpandedDetails({
      ...expandedDetails,
      [detailId]: !expandedDetails[detailId],
    });
  };

  const renderProductionDetail = (detail) => {
    if (!detail || typeof detail !== 'object') {
      return (
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
          {JSON.stringify(detail, null, 2)}
        </pre>
      );
    }

    // Tipe video
    if (detail.type === 'video') {
      let scenes = detail.scenes || [];
      if (!Array.isArray(scenes)) {
        scenes = Object.keys(scenes).map(key => {
          const scene = scenes[key];
          return typeof scene === 'object' ? { ...scene, time: scene.time || key } : { time: key, description: scene || '' };
        });
      }

      return (
        <div className="space-y-4">
          {detail.duration && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Durasi</span>
              <span className="text-sm text-gray-800">{detail.duration}</span>
            </div>
          )}
          {scenes.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-2">Scene Breakdown</span>
              <div className="space-y-2">
                {scenes.map((scene, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-xs font-semibold text-primary-600">{scene.time || `Scene ${index + 1}`}</span>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{scene.description || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {detail.visual && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Visual Description</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.visual}</p>
            </div>
          )}
          {detail.music && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Music Suggestion</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.music}</p>
            </div>
          )}
        </div>
      );
    }

    // Tipe carousel
    if (detail.type === 'carousel') {
      return (
        <div className="space-y-4">
          {detail.slideCount && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Jumlah Slide</span>
              <span className="text-sm text-gray-800">{detail.slideCount}</span>
            </div>
          )}
          {detail.slides && Array.isArray(detail.slides) && detail.slides.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-2">Konten Slide</span>
              <div className="space-y-2">
                {detail.slides.map((slide, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-xs font-semibold text-primary-600">Slide {slide.slide}</span>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{slide.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {detail.visualTone && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Visual Tone</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.visualTone}</p>
            </div>
          )}
        </div>
      );
    }

    // Tipe image
    if (detail.type === 'image') {
      return (
        <div className="space-y-4">
          {detail.headline && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Headline</span>
              <p className="text-sm font-bold text-gray-800">{detail.headline}</p>
            </div>
          )}
          {detail.subheadline && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Subheadline</span>
              <p className="text-sm text-gray-800">{detail.subheadline}</p>
            </div>
          )}
          {detail.visual && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Visual Description</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.visual}</p>
            </div>
          )}
          {detail.layout && (
            <div>
              <span className="text-xs font-semibold text-gray-600 block mb-1">Layout Description</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.layout}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
        {JSON.stringify(detail, null, 2)}
      </pre>
    );
  };

  const handleApprove = async (id) => {
    try {
      await approveBrief(id);
      toast.success('Brief berhasil di-approve');
      fetchApprovals();
      fetchAllBriefs();
      // Trigger event untuk update kalender
      window.dispatchEvent(new Event('briefsUpdated'));
    } catch (error) {
      toast.error('Gagal approve brief');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    try {
      await rejectBrief(id, rejectReason);
      toast.success('Brief berhasil di-reject');
      setRejectReason('');
      setSelectedBrief(null);
      fetchApprovals();
      fetchAllBriefs();
    } catch (error) {
      toast.error('Gagal reject brief');
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
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Review Approval</h1>
              <p className="text-primary-100 text-xs sm:text-sm mt-1">Review dan approve brief yang menunggu persetujuan</p>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Hourglass className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Menunggu Review</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{getPendingDetailsCount}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Menunggu review</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Disetujui</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{getApprovedCount()}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Brief disetujui</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Ditolak</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{getRejectedCount()}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Brief ditolak</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-primary-100">Brief Bulan Ini</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{getBriefsThisMonth()}</p>
            <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Total brief</p>
          </div>
        </div>
      </div>

      {pendingBriefs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <EmptyState
            title="Tidak ada brief yang pending"
            description="Semua brief sudah di-review"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {pendingBriefs.map((brief) => (
            <div key={brief.id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Brief Info Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Brief #{brief.id}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Oleh: {brief.user?.name} | Funnel: {brief.funnelStage}
                  </p>
                  {brief.createdAt && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Dibuat: {formatDateTime(brief.createdAt)}
                    </p>
                  )}
                </div>
                {/* Status is only managed at BriefDetail level, not parent Brief */}
              </div>

              <div className="mb-4 space-y-4">
                {/* Product Card - Compact */}
                {brief.product && (
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-400 p-3 mb-4">
                    <div className="flex items-center gap-3">
                      {brief.product.imageUrl && (
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                          <img
                            src={`http://localhost:3000${brief.product.imageUrl}`}
                            alt={brief.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <h3 className="text-sm font-bold text-gray-800 truncate">{brief.product.name}</h3>
                        </div>
                        {brief.product.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                            {brief.product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {brief.product.link && (
                            <a
                              href={brief.product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded text-xs font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link Produk
                            </a>
                          )}
                          <Link
                            to={`/products/${brief.product.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white text-gray-700 rounded text-xs font-medium hover:bg-primary-50 transition-colors border border-gray-300"
                          >
                            <Eye className="w-3 h-3" />
                            Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-lg text-gray-800 mb-4">Detail Brief:</h3>
                {brief.details?.filter(detail => detail.status !== 'draft').map((detail, index) => (
                  <div key={detail.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Header */}
                    <div 
                      className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 cursor-pointer hover:from-primary-100 hover:to-primary-200 transition-colors"
                      onClick={() => toggleDetail(detail.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-lg font-bold text-sm shadow-md">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-gray-800 truncate">{detail.title}</h4>
                              {isUrgent(detail.scheduledAt) && (
                                <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold whitespace-nowrap flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3 h-3" />
                                  URGENT
                                </span>
                              )}
                              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold whitespace-nowrap text-center">
                                {detail.platform}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap text-center ${
                                detail.tag === 'video' 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : detail.tag === 'carousel'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {detail.tag}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                              {detail.funnel && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {getFunnelLabel(detail.funnel)}
                                </span>
                              )}
                              {detail.status && detail.status !== 'draft' && (
                                <StatusBadge status={detail.status}>
                                  {getStatusLabel(detail.status)}
                                </StatusBadge>
                              )}
                              {detail.scheduledAt && (
                                <span className="flex items-center gap-1 text-primary-600 font-medium">
                                  <Clock className="w-3 h-3" />
                                  Terjadwal: {formatDateTime(detail.scheduledAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          {expandedDetails[detail.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedDetails[detail.id] && (
                      <div className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6">
                        {/* Informasi Ide Konten */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {detail.detail?.objectiveCampaign && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-900">Objective Campaign</span>
                              </div>
                              <p className="text-sm text-gray-700">{detail.detail.objectiveCampaign}</p>
                            </div>
                          )}
                          {detail.detail?.decisionTrigger && (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-semibold text-purple-900">Decision Trigger</span>
                              </div>
                              <p className="text-sm text-gray-700">{detail.detail.decisionTrigger}</p>
                            </div>
                          )}
                          {detail.detail?.productValueHighlight && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-900">Product Value Highlight</span>
                              </div>
                              <p className="text-sm text-gray-700">{detail.detail.productValueHighlight}</p>
                            </div>
                          )}
                          {detail.detail?.communicationApproach && (
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-semibold text-yellow-900">Communication Approach</span>
                              </div>
                              <p className="text-sm text-gray-700">{detail.detail.communicationApproach}</p>
                            </div>
                          )}
                        </div>

                        {detail.detail?.hookOpening && (
                          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-400">
                            <div className="flex items-center gap-2 mb-2">
                              <Eye className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-semibold text-primary-900">Hook/Opening</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{detail.detail.hookOpening}</p>
                          </div>
                        )}

                        {detail.detail?.mainContentPoints && Array.isArray(detail.detail.mainContentPoints) && detail.detail.mainContentPoints.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-800">Main Content Points</span>
                            </div>
                            <ul className="space-y-2">
                              {detail.detail.mainContentPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-primary-600 font-bold mt-0.5">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {detail.cta && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-900">Call to Action (CTA)</span>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{detail.cta}</p>
                          </div>
                        )}

                        {detail.detail?.breakdownDetail && (
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Layers className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-semibold text-orange-900">Breakdown Detail</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {typeof detail.detail.breakdownDetail === 'object' 
                                ? JSON.stringify(detail.detail.breakdownDetail, null, 2)
                                : detail.detail.breakdownDetail}
                            </p>
                          </div>
                        )}

                        {detail.detail?.visualIdentityNote && (
                          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Image className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-semibold text-indigo-900">Visual Identity Note</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {typeof detail.detail.visualIdentityNote === 'object' 
                                ? JSON.stringify(detail.detail.visualIdentityNote, null, 2)
                                : detail.detail.visualIdentityNote}
                            </p>
                          </div>
                        )}

                        {/* Detail Produksi */}
                        {detail.detail && (
                          <div className="bg-white rounded-lg p-4 border-2 border-primary-400">
                            <div className="flex items-center gap-2 mb-4">
                              {detail.detail.type === 'video' && <Video className="w-5 h-5 text-primary-600" />}
                              {detail.detail.type === 'carousel' && <Layers className="w-5 h-5 text-primary-600" />}
                              {detail.detail.type === 'image' && <Image className="w-5 h-5 text-primary-600" />}
                              <span className="text-base font-bold text-gray-800">Detail Produksi</span>
                            </div>
                            {renderProductionDetail(detail.detail)}
                          </div>
                        )}

                        {/* Caption & Hashtags */}
                        {detail.caption && (
                          <div className="bg-primary-50 rounded-lg p-4 border border-primary-400">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-semibold text-primary-900">Caption</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail.caption}</p>
                          </div>
                        )}

                        {detail.hashtags && detail.hashtags.length > 0 && (
                          <div className="bg-primary-50 rounded-lg p-4 border border-primary-400">
                              <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-semibold text-primary-800">Hashtags</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[...new Set(detail.hashtags)].map((tag, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white text-primary-700 rounded-lg text-sm font-medium border border-primary-400">
                                  #{tag.replace(/^#+/, '')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {detail.scheduledAt && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">Waktu Terjadwal</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {new Date(detail.scheduledAt).toLocaleString('id-ID', {
                                dateStyle: 'full',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(brief.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => setSelectedBrief(brief)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-800 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedBrief}
        onClose={() => {
          setSelectedBrief(null);
          setRejectReason('');
        }}
        title="Reject Brief"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Penolakan *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Masukkan alasan penolakan..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setSelectedBrief(null);
                setRejectReason('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => handleReject(selectedBrief?.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

