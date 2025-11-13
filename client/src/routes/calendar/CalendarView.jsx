import { useEffect, useState } from 'react';
import { getCalendar } from '../../services/calendar.api';
import { Calendar, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sparkles, Video, Image as ImageIcon, Layers, ExternalLink, Package, Target, TrendingUp, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatDateTime } from '../../utils/format';
import { PLATFORM_COLORS, FUNNEL_STAGES } from '../../utils/constants';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    fetchCalendar();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCalendar();
    }, 30000);
    
    // Listen for briefsUpdated event
    const handleBriefsUpdated = () => {
      fetchCalendar();
    };
    window.addEventListener('briefsUpdated', handleBriefsUpdated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('briefsUpdated', handleBriefsUpdated);
    };
  }, []);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await getCalendar();
      setEvents(response.data || []);
    } catch (error) {
      toast.error('Gagal memuat kalender');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter((event) => {
      if (!event.scheduledAt) return false;
      const eventDate = new Date(event.scheduledAt);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => {
      // Sort by time
      const timeA = new Date(a.scheduledAt).getTime();
      const timeB = new Date(b.scheduledAt).getTime();
      return timeA - timeB;
    });
  };

  const getEventTime = (scheduledAt) => {
    if (!scheduledAt) return '';
    const date = new Date(scheduledAt);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getTagIcon = (tag) => {
    switch (tag?.toLowerCase()) {
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'carousel':
        return <Layers className="w-3 h-3" />;
      case 'image':
        return <ImageIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTagColor = (tag) => {
    switch (tag?.toLowerCase()) {
      case 'video':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'carousel':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'image':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-primary-50 text-primary-700 border-primary-200';
    }
  };

  const getFunnelLabel = (value) => {
    const stage = FUNNEL_STAGES.find(s => s.value === value);
    return stage ? stage.label : value;
  };

  const renderProductionDetail = (detail) => {
    if (!detail || typeof detail !== 'object') {
      return (
        <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
          {JSON.stringify(detail, null, 2)}
        </pre>
      );
    }

    // Video type
    if (detail.type === 'video') {
      return (
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-gray-700 block mb-1">Tipe Konten</span>
            <span className="text-sm font-bold text-gray-800 capitalize">{detail.type}</span>
          </div>
          {detail.duration && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Durasi</span>
              <span className="text-sm text-gray-800">{detail.duration}</span>
            </div>
          )}
          {detail.music && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Musik</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.music}</p>
            </div>
          )}
          {detail.visual && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Visual Identity</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.visual}</p>
            </div>
          )}
          {detail.scenes && detail.scenes.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-2">Skenario</span>
              <div className="space-y-3">
                {detail.scenes.map((scene, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-primary-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-bold">
                        {scene.time || `Scene ${index + 1}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed">{scene.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Carousel type
    if (detail.type === 'carousel') {
      return (
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-gray-700 block mb-1">Tipe Konten</span>
            <span className="text-sm font-bold text-gray-800 capitalize">{detail.type}</span>
          </div>
          {detail.slideCount && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Jumlah Slide</span>
              <span className="text-sm text-gray-800">{detail.slideCount}</span>
            </div>
          )}
          {detail.visualTone && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Visual Tone</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.visualTone}</p>
            </div>
          )}
          {detail.slides && detail.slides.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-2">Konten Slide</span>
              <div className="space-y-3">
                {detail.slides.map((slide, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-primary-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                        Slide {index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed">{slide.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Image type
    if (detail.type === 'image') {
      return (
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-gray-700 block mb-1">Tipe Konten</span>
            <span className="text-sm font-bold text-gray-800 capitalize">{detail.type}</span>
          </div>
          {detail.headline && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Headline</span>
              <p className="text-sm font-bold text-gray-800">{detail.headline}</p>
            </div>
          )}
          {detail.subheadline && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Subheadline</span>
              <p className="text-sm text-gray-800">{detail.subheadline}</p>
            </div>
          )}
          {detail.visual && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Visual Identity</span>
              <p className="text-sm text-gray-800 leading-relaxed">{detail.visual}</p>
            </div>
          )}
          {detail.layout && (
            <div>
              <span className="text-xs font-semibold text-gray-700 block mb-1">Layout</span>
              <p className="text-sm text-gray-800">{detail.layout}</p>
            </div>
          )}
        </div>
      );
    }

    // Fallback: display as JSON
    return (
      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
        {JSON.stringify(detail, null, 2)}
      </pre>
    );
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setExpandedDates({}); // Reset expanded dates saat ganti bulan
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setExpandedDates({}); // Reset expanded dates saat ganti bulan
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setExpandedDates({}); // Reset expanded dates saat kembali ke hari ini
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getMonthStats = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999); // Include end of day
    
    const monthEvents = events.filter((event) => {
      if (!event || !event.scheduledAt) return false;
      try {
        const eventDate = new Date(event.scheduledAt);
        return eventDate >= monthStart && eventDate <= monthEnd;
      } catch (error) {
        return false;
      }
    });

    return {
      total: monthEvents.length,
      byTag: monthEvents.reduce((acc, event) => {
        const tag = event.tag || 'unknown';
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {}),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const stats = getMonthStats();

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header dengan Gradient */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-lg shadow-md">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Kalender Konten</h1>
                <p className="text-primary-100 text-xs sm:text-sm mt-1">Kelola jadwal posting konten yang sudah di-approve</p>
              </div>
            </div>
            <button
              onClick={goToToday}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Hari Ini
            </button>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-primary-100">Total Konten</span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Bulan ini</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-primary-100">Video</span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.byTag.video || 0}</p>
              <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Konten</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-primary-100">Carousel</span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.byTag.carousel || 0}</p>
              <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Konten</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-primary-100">Image</span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.byTag.image || 0}</p>
              <p className="text-[10px] sm:text-xs text-primary-200 mt-1">Konten</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm text-primary-100">Periode</span>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{monthNames[currentMonth.getMonth()]}</p>
              <p className="text-[10px] sm:text-xs text-primary-200 mt-1">{currentMonth.getFullYear()}</p>
            </div>
          </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-5 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 sm:p-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="text-center flex-1 px-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 sm:p-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-primary-200/50">
        {/* Desktop: Calendar Grid View */}
        <div className="hidden sm:block">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-primary-50 via-gray-50 to-primary-50 border-b-2 border-primary-200">
            {dayNames.map((day, idx) => (
              <div
                key={day}
                className={`p-2 lg:p-3 xl:p-5 text-center text-xs lg:text-sm font-bold ${
                  idx === 0 || idx === 6
                    ? 'text-primary-700 bg-primary-100/50'
                    : 'text-gray-800'
                }`}
              >
                <span className="hidden lg:inline">{day}</span>
                <span className="lg:hidden">{day.substring(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth();
              
              return (
                <div
                  key={index}
                  className={`min-h-28 md:min-h-32 lg:min-h-40 border-r border-b border-primary-200/50 p-1.5 md:p-2 lg:p-3 transition-all ${
                    !isCurrentMonth
                      ? 'bg-primary-50/30 opacity-50'
                      : isCurrentDay
                      ? 'bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 border-primary-400 border-2'
                      : 'bg-white hover:bg-primary-50/30'
                  }`}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-2 lg:mb-3">
                        <span
                          className={`text-sm lg:text-base font-bold ${
                            isCurrentDay
                              ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center shadow-lg text-sm lg:text-base'
                              : isCurrentMonth
                              ? 'text-gray-800'
                              : 'text-gray-400'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 px-2 lg:px-2.5 py-1 rounded-full shadow-md">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 lg:space-y-2">
                        {(() => {
                          const dateKey = date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : '';
                          const isExpanded = expandedDates[dateKey];
                          const eventsToShow = isExpanded ? dayEvents : dayEvents.slice(0, 2);
                          
                          return (
                            <>
                              {eventsToShow.map((event) => (
                                <button
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className="w-full text-left p-1.5 sm:p-2 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] border border-primary-200/50 bg-white group"
                                  title={event.title}
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                                        PLATFORM_COLORS[event.platform] || 'bg-gray-200 text-gray-800'
                                      }`}>
                                        {event.platform}
                                      </span>
                                      {event.tag && (
                                        <div className={`flex items-center gap-1 px-1 sm:px-1.5 py-0.5 rounded border text-[10px] sm:text-xs font-medium ${getTagColor(event.tag)}`}>
                                          {getTagIcon(event.tag)}
                                          <span className="capitalize hidden md:inline">{event.tag}</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 line-clamp-1 lg:line-clamp-2 group-hover:line-clamp-none">
                                      {event.title}
                                    </p>
                                  </div>
                                </button>
                              ))}
                              {dayEvents.length > 2 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDates(prev => ({
                                      ...prev,
                                      [dateKey]: !prev[dateKey]
                                    }));
                                  }}
                                  className="w-full text-[10px] sm:text-xs text-primary-700 hover:text-primary-800 font-semibold text-center py-1.5 lg:py-2 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200/50 hover:border-primary-300 transition-all cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <span className="flex items-center justify-center gap-1">
                                      Tampilkan Lebih Sedikit
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1">
                                      +{dayEvents.length - 2} lagi
                                    </span>
                                  )}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: List View - 1 tanggal per baris */}
        <div className="sm:hidden">
          {days.map((date, index) => {
            if (!date) return null;
            
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth();
            const dayName = dayNames[date.getDay()];
            
            if (!isCurrentMonth) return null; // Hanya tampilkan hari di bulan saat ini di mobile
            
            return (
              <div
                key={index}
                className={`border-b border-primary-200/50 p-4 transition-all ${
                  isCurrentDay
                    ? 'bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 border-l-4 border-primary-600'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-xs text-gray-500 font-medium uppercase">
                      {dayName.substring(0, 3)}
                    </span>
                    <span
                      className={`text-2xl font-bold mt-1 ${
                        isCurrentDay
                          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg'
                          : 'text-gray-800'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {dayEvents.length > 0 ? (
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left p-3 rounded-lg shadow-sm hover:shadow-md transition-all border border-primary-200/50 bg-white active:bg-primary-50/30"
                            title={event.title}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                  PLATFORM_COLORS[event.platform] || 'bg-gray-200 text-gray-800'
                                }`}>
                                  {event.platform}
                                </span>
                                {event.tag && (
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${getTagColor(event.tag)}`}>
                                    {getTagIcon(event.tag)}
                                    <span className="capitalize">{event.tag}</span>
                                  </div>
                                )}
                                {event.scheduledAt && (
                                  <span className="text-xs text-gray-500 font-medium ml-auto">
                                    {getEventTime(event.scheduledAt)}
                                  </span>
                                )}
                              </div>
                              {event.brief?.product?.name && (
                                <p className="text-xs text-primary-600 font-medium">
                                  {event.brief.product.name}
                                </p>
                              )}
                              <p className="text-sm font-semibold text-gray-800 leading-tight">
                                {event.title}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic py-2">
                        Tidak ada konten terjadwal
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            {/* Product Card */}
            {selectedEvent.brief?.product && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-primary-400/50 overflow-hidden shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
                  {selectedEvent.brief.product.imageUrl && (
                    <div className="md:col-span-1">
                      <div className="w-full aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={selectedEvent.brief.product.imageUrl?.startsWith('http') ? selectedEvent.brief.product.imageUrl : `http://54.206.113.88${selectedEvent.brief.product.imageUrl}`}
                          alt={selectedEvent.brief.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className={`${selectedEvent.brief.product.imageUrl ? 'md:col-span-2' : 'md:col-span-3'} flex flex-col justify-center`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-bold text-gray-800">{selectedEvent.brief.product.name}</h3>
                    </div>
                    {selectedEvent.brief.product.description && (
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {selectedEvent.brief.product.description}
                      </p>
                    )}
                    {selectedEvent.brief.product.link && (
                      <a
                        href={selectedEvent.brief.product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all text-sm font-medium w-fit shadow-md hover:shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka Link Produk
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header Info */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 rounded-xl border-2 border-primary-400 flex-wrap">
              <div className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md ${
                PLATFORM_COLORS[selectedEvent.platform] || 'bg-gray-200 text-gray-800'
              }`}>
                {selectedEvent.platform}
              </div>
              {selectedEvent.tag && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-semibold text-xs shadow-md ${getTagColor(selectedEvent.tag)}`}>
                  {getTagIcon(selectedEvent.tag)}
                  <span className="capitalize">{selectedEvent.tag}</span>
                </div>
              )}
            </div>

            {/* Scheduled Time */}
            {selectedEvent.scheduledAt && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200/50">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Clock className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <span className="text-xs text-gray-700 block mb-1">Tanggal & Waktu Posting</span>
                  <span className="text-sm font-bold text-gray-800">{formatDateTime(selectedEvent.scheduledAt)}</span>
                </div>
              </div>
            )}

            {/* Funnel Stage */}
            {selectedEvent.funnel && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-gray-800">Audience Funnel</span>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl border border-primary-200/50">
                  <p className="text-xs font-semibold text-gray-800">{getFunnelLabel(selectedEvent.funnel)}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            {selectedEvent.cta && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-gray-800">Call to Action (CTA)</span>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl border border-primary-200/50">
                  <p className="text-xs font-semibold text-gray-800">{selectedEvent.cta}</p>
                </div>
              </div>
            )}

            {/* Detail JSON - Production Details */}
            {selectedEvent.detail && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-gray-800">Detail Produksi</span>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200/50 max-h-96 overflow-y-auto">
                  {renderProductionDetail(selectedEvent.detail)}
                </div>
              </div>
            )}

            {/* Caption */}
            {selectedEvent.caption && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-gray-800">Caption</span>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl border border-primary-200/50">
                  <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedEvent.caption}</p>
                </div>
              </div>
            )}

            {/* Hashtags */}
            {selectedEvent.hashtags?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-gray-800">Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(selectedEvent.hashtags)].map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-lg text-xs font-semibold border-2 border-primary-400 shadow-sm hover:shadow-md transition-shadow"
                    >
                      #{tag.replace(/^#+/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

