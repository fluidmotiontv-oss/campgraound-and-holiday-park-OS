import React, { useState } from 'react';
import { 
  CommunityBusiness, 
  CommunityNotice, 
  PortWaikatoMarineConditions, 
  BusinessCategory,
  ExperienceBookingForm
} from '../types';
import { 
  Waves, 
  Coffee, 
  Compass, 
  Anchor, 
  Users, 
  Wrench, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Search, 
  Sparkles, 
  ArrowRight,
  Wind,
  Droplets,
  AlertTriangle,
  Send,
  Ticket,
  ChevronRight
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface PortWaikatoHubProps {
  businesses: CommunityBusiness[];
  notices: CommunityNotice[];
  marine: PortWaikatoMarineConditions;
  onSelectBookingService?: (business: CommunityBusiness, serviceId: string) => void;
  onOpenBookingStay?: () => void;
  onNoticeAdded?: () => void;
}

export const PortWaikatoHub: React.FC<PortWaikatoHubProps> = ({
  businesses,
  notices,
  marine,
  onSelectBookingService,
  onOpenBookingStay,
  onNoticeAdded
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'marine_tides' | 'notices' | 'local_map'>('directory');
  
  // Booking modal state
  const [bookingModalBusiness, setBookingModalBusiness] = useState<CommunityBusiness | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [bookingGuestName, setBookingGuestName] = useState('');
  const [bookingGuestPhone, setBookingGuestPhone] = useState('');
  const [bookingGuestEmail, setBookingGuestEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-08-26');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM');
  const [bookingGuestsCount, setBookingGuestsCount] = useState(2);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // New Notice modal state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'tide_safety' | 'community_event' | 'kaitiaki_environment' | 'council_alert' | 'market'>('community_event');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAuthor, setNoticeAuthor] = useState('');

  // Filter businesses
  const filteredBusinesses = businesses.filter(b => {
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenBookModal = (business: CommunityBusiness, serviceId?: string) => {
    setBookingModalBusiness(business);
    setSelectedServiceId(serviceId || business.bookableServices?.[0]?.id || '');
    setBookingSuccessMsg(null);
  };

  const handleConfirmExperienceBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalBusiness || !selectedServiceId) return;

    const payload: ExperienceBookingForm = {
      businessId: bookingModalBusiness.id,
      serviceId: selectedServiceId,
      guestName: bookingGuestName || 'Valued Guest',
      guestPhone: bookingGuestPhone || '+64 21 000 0000',
      guestEmail: bookingGuestEmail || 'guest@aotearoaholidaypark.co.nz',
      bookingDate,
      timeSlot: bookingTimeSlot,
      guestsCount: bookingGuestsCount
    };

    StorageService.createBusinessBooking(payload);
    setBookingSuccessMsg(`✅ Booking confirmed with ${bookingModalBusiness.name}! Added to your Fluid Motion itinerary.`);
    setTimeout(() => {
      setBookingModalBusiness(null);
      setBookingSuccessMsg(null);
    }, 2800);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    StorageService.addCommunityNotice({
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      author: noticeAuthor || 'Community Contributor',
      urgency: noticeCategory === 'tide_safety' ? 'advisory' : 'routine'
    });

    setShowNoticeModal(false);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeAuthor('');
    if (onNoticeAdded) onNoticeAdded();
  };

  return (
    <div id="port-waikato-hub-container" className="space-y-6">
      
      {/* Hero Banner with Port Waikato & Sunset Beach Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-teal-950/80 border border-stone-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-teal-400" />
                PORT WAIKATO & TE PUAHA O WAIKATO
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AOTEAROA NZ
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-100 tracking-tight">
              Community, Business & Ocean Hub
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Explore local shops, book Sunset Beach surf coaching & river expeditions, check marine bar crossing advisories, and connect with the vibrant Port Waikato community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 self-start md:self-center">
            {onOpenBookingStay && (
              <button
                id="btn-hero-book-stay"
                onClick={onOpenBookingStay}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Holiday Park Stay</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('marine_tides')}
              className="px-4 py-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <Waves className="w-4 h-4 text-teal-400" />
              <span>Surf & Tide Report</span>
            </button>
          </div>
        </div>

        {/* Live Mini Marine Bar strip */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
            <div className="text-[11px] font-mono text-stone-400 uppercase flex items-center gap-1">
              <Waves className="w-3 h-3 text-teal-400" /> Sunset Beach Surf
            </div>
            <div className="text-base sm:text-lg font-bold text-teal-300 font-mono mt-0.5">
              {marine.surfHeightMeters}m ({marine.surfQuality})
            </div>
            <div className="text-[10px] text-stone-400">Black sand beach break</div>
          </div>

          <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
            <div className="text-[11px] font-mono text-stone-400 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Next High Tide
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-300 font-mono mt-0.5">
              {marine.nextHighTide}
            </div>
            <div className="text-[10px] text-stone-400">Low tide: {marine.nextLowTide}</div>
          </div>

          <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
            <div className="text-[11px] font-mono text-stone-400 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" /> River Bar Crossing
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-400 font-mono mt-0.5 truncate">
              {marine.barCrossingRisk}
            </div>
            <div className="text-[10px] text-stone-400">VHF Ch 80 Coastguard</div>
          </div>

          <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
            <div className="text-[11px] font-mono text-stone-400 uppercase flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-400" /> Wind & Water
            </div>
            <div className="text-base sm:text-lg font-bold text-cyan-300 font-mono mt-0.5">
              {marine.windKnots} kts {marine.windDirection}
            </div>
            <div className="text-[10px] text-stone-400">Water temp: {marine.waterTempC}°C</div>
          </div>
        </div>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-2 rounded-2xl">
        <div className="flex flex-wrap gap-1.5">
          <button
            id="tab-hub-directory"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'directory'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Local Business Directory ({businesses.length})</span>
          </button>

          <button
            id="tab-hub-marine"
            onClick={() => setActiveTab('marine_tides')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'marine_tides'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Marine, Tides & River Bar</span>
          </button>

          <button
            id="tab-hub-notices"
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'notices'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community Noticeboard ({notices.length})</span>
          </button>

          <button
            id="tab-hub-map"
            onClick={() => setActiveTab('local_map')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'local_map'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Points of Interest & Map</span>
          </button>
        </div>

        {activeTab === 'notices' && (
          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center space-x-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Community Notice</span>
          </button>
        )}
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* Search & Category Filter Pills */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search local cafes, surf lessons, fish & chips, charters, mechanics..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex overflow-x-auto pb-1 md:pb-0 space-x-1.5 no-scrollbar">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'food_beverage', label: 'Food & Cafes' },
                { id: 'surf_recreation', label: 'Surf & Watersports' },
                { id: 'cultural_nature', label: 'Cultural & Tours' },
                { id: 'community_services', label: 'Community Hall' },
                { id: 'local_trades', label: 'Auto & Repairs' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Business Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBusinesses.map(biz => (
              <div 
                key={biz.id}
                id={`biz-card-${biz.id}`}
                className="bg-stone-900 border border-stone-800 hover:border-teal-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-teal-950/20 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {biz.badge && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {biz.badge}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-stone-100 mt-1 group-hover:text-teal-300 transition-colors">
                        {biz.name}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-1">{biz.tagline}</p>
                    </div>

                    <div className="flex items-center space-x-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-stone-200 font-mono">{biz.rating}</span>
                      <span className="text-[10px] text-stone-500">({biz.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                    {biz.description}
                  </p>

                  {/* Highlights/Features */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {biz.features.slice(0, 3).map((feat, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-stone-950 text-stone-400 border border-stone-800/80">
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Contact info */}
                  <div className="pt-3 border-t border-stone-800/80 space-y-1 text-xs text-stone-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="truncate">{biz.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-500" /> {biz.hours}
                      </span>
                      <span className="font-mono text-teal-400">{biz.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Bookable Services Section */}
                <div className="mt-4 pt-4 border-t border-stone-800 space-y-2">
                  {biz.bookableServices && biz.bookableServices.length > 0 ? (
                    <div>
                      <div className="text-[11px] font-mono uppercase text-stone-400 mb-1.5">
                        Bookable Experiences & Deals:
                      </div>
                      <div className="space-y-1.5">
                        {biz.bookableServices.slice(0, 2).map(srv => (
                          <div 
                            key={srv.id}
                            className="p-2 bg-stone-950 rounded-xl border border-stone-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold text-stone-200 truncate">{srv.title}</div>
                              <div className="text-[10px] text-stone-400">{srv.duration}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-amber-400">${srv.priceNzd} NZD</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleOpenBookModal(biz)}
                        className="mt-3 w-full py-2 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-md shadow-teal-950/40"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Instant Book with {biz.name.split(' ')[0]}</span>
                      </button>
                    </div>
                  ) : (
                    <a
                      href={`tel:${biz.phone}`}
                      className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {biz.phone}</span>
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Marine & Tides View */}
      {activeTab === 'marine_tides' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  WEST COAST MARITIME TELEMETRY
                </span>
                <span className="text-xs text-stone-400 font-mono">Sunset Beach & Waikato Estuary</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
                Port Waikato Surf, Tide & River Bar Conditions
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Real-time oceanographic data for surfers, whitebaiters, boaties, and coastal beach walkers.
              </p>
            </div>

            {/* Critical Waikato Bar Safety Notice */}
            <div className="p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 space-y-3">
              <div className="flex items-center space-x-2.5 text-amber-400 font-bold text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Waikato River Bar Crossing Safety Advisory</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                The Waikato River bar is a dynamic West Coast bar crossing that requires experience, suitable weather windows, and proper safety equipment. Never cross on an outgoing (ebb) tide. Always log your trip with Coastguard (VHF Channel 80 or *500 on mobile).
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-200 border border-stone-700">
                  Current Status: <strong className="text-amber-400">{marine.barCrossingRisk}</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-200 border border-stone-700">
                  Coastguard Port Waikato: VHF 80
                </span>
                <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-200 border border-stone-700">
                  Lifejackets Mandatory: NZ Maritime Law
                </span>
              </div>
            </div>

            {/* 4-Panel Marine Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="text-xs font-mono uppercase text-teal-400">Sunset Beach Swell</div>
                <div className="text-2xl font-black font-mono text-stone-100">{marine.surfHeightMeters}m</div>
                <div className="text-xs text-stone-300 font-semibold">Conditions: {marine.surfQuality}</div>
                <p className="text-[11px] text-stone-400">Clean offshore peeling A-frames on mid to incoming tide.</p>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="text-xs font-mono uppercase text-amber-400">Tidal Cycle</div>
                <div className="text-xl font-black font-mono text-stone-100">{marine.tideState}</div>
                <div className="text-xs text-stone-300">High: {marine.nextHighTide}</div>
                <div className="text-xs text-stone-400">Low: {marine.nextLowTide}</div>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="text-xs font-mono uppercase text-cyan-400">Wind & Weather</div>
                <div className="text-2xl font-black font-mono text-stone-100">{marine.windKnots} kts</div>
                <div className="text-xs text-stone-300">{marine.windDirection}</div>
                <p className="text-[11px] text-stone-400">Groomed surface with light easterly morning breeze.</p>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="text-xs font-mono uppercase text-emerald-400">Water & UV Index</div>
                <div className="text-2xl font-black font-mono text-stone-100">{marine.waterTempC}°C</div>
                <div className="text-xs text-stone-300">UV Index: {marine.uvIndex} (High)</div>
                <p className="text-[11px] text-stone-400">3/2mm or 4/3mm wetsuit recommended for extended sessions.</p>
              </div>

            </div>

            {/* Surf Lifesaving & Patrol Hours */}
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-100">Sunset Beach Lifeguard Patrol Flagged Area</div>
                  <p className="text-xs text-stone-400">Always swim between the red and yellow flags. Never swim alone.</p>
                </div>
              </div>

              <div className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
                PATROL ON DUTY: 10:00 AM – 5:00 PM
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Community Noticeboard View */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-100">Community Bulletin & Kaitiaki Updates</h3>
            <span className="text-xs text-stone-400 font-mono">{notices.length} active notices</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map(notice => (
              <div 
                key={notice.id}
                className={`p-5 rounded-2xl border transition-all ${
                  notice.pinned 
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-lg' 
                    : 'bg-stone-900 border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    notice.category === 'tide_safety' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : notice.category === 'kaitiaki_environment'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}>
                    {notice.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">{notice.timestamp}</span>
                </div>

                <h4 className="text-base font-bold text-stone-100 mt-2">{notice.title}</h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">{notice.content}</p>

                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span className="italic">Posted by: {notice.author}</span>
                  {notice.pinned && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold">📌 PINNED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points of Interest & Local Map */}
      {activeTab === 'local_map' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-stone-100">Port Waikato Landmarks & Points of Interest</h3>
            <p className="text-xs text-stone-400">Key spots within walking and biking distance from Aotearoa Holiday Park.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Sunset Beach & Surf Break',
                desc: 'Famous black sand beach, world-class surf, dramatic coastal bluffs, and breathtaking Tasman Sea sunsets.',
                dist: '600m (7 min walk)',
                icon: 'Waves'
              },
              {
                title: 'Waikato River Estuary & Wharf',
                desc: 'Sheltered tidal fishing, boat launching ramp, whitebait stands, and tranquil flatwater SUP paddling.',
                dist: '400m (5 min walk)',
                icon: 'Anchor'
              },
              {
                title: 'Ancient Sand Dunes & Spinifex Reserve',
                desc: 'Towering iron sand dunes, native bird nesting grounds, and archaeological heritage trails.',
                dist: '1.2 km (15 min walk)',
                icon: 'Compass'
              },
              {
                title: 'Port Waikato Community Hall & Library',
                desc: 'Community hub, Sunday markets, yoga classes, and public Starlink Wi-Fi bench.',
                dist: '300m (3 min walk)',
                icon: 'Users'
              },
              {
                title: 'Sunset Beach General Store & Café',
                desc: 'Fresh coffee, hot pies, beach supplies, ice creams, groceries, and gas cylinder swaps.',
                dist: '350m (4 min walk)',
                icon: 'Coffee'
              },
              {
                title: 'Nikau Caves & Cafe (Day Trip)',
                desc: 'Stunning limestone cavern glowworm tours and native bush valley walks.',
                dist: '14 km (15 min drive)',
                icon: 'Sparkles'
              }
            ].map((poi, idx) => (
              <div key={idx} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-100">{poi.title}</h4>
                  <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                    {poi.dist}
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{poi.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Booking Modal */}
      {bookingModalBusiness && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-teal-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">PORT WAIKATO COMMUNITY BOOKING</span>
                <h3 className="text-lg font-bold text-stone-100">{bookingModalBusiness.name}</h3>
              </div>
              <button 
                onClick={() => setBookingModalBusiness(null)}
                className="text-stone-400 hover:text-stone-200 text-sm font-mono px-2 py-1 rounded bg-stone-800"
              >
                ✕
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-emerald-300">{bookingSuccessMsg}</div>
                <p className="text-xs text-stone-300">Confirmation receipt and calendar token generated.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmExperienceBooking} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-stone-400 block mb-1">Select Service / Experience</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-teal-500"
                  >
                    {bookingModalBusiness.bookableServices?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} — ${s.priceNzd} NZD ({s.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-stone-400 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-stone-400 block mb-1">Time Slot</label>
                    <select
                      value={bookingTimeSlot}
                      onChange={(e) => setBookingTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-teal-500"
                    >
                      <option>08:00 AM (Early Tide)</option>
                      <option>10:00 AM (Morning Session)</option>
                      <option>01:30 PM (Afternoon Flow)</option>
                      <option>04:30 PM (Sunset Window)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-stone-400 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Tane"
                      value={bookingGuestName}
                      onChange={(e) => setBookingGuestName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-stone-400 block mb-1">NZ Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +64 21 482 991"
                      value={bookingGuestPhone}
                      onChange={(e) => setBookingGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                  <div>
                    <span className="text-xs text-stone-400 block">Total Due:</span>
                    <span className="text-lg font-black font-mono text-amber-400">
                      ${(bookingModalBusiness.bookableServices?.find(s => s.id === selectedServiceId)?.priceNzd || 50) * bookingGuestsCount} NZD
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setBookingModalBusiness(null)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/40"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post Community Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-lg font-bold text-stone-100">Post Notice to Port Waikato Bulletin</h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-stone-400 hover:text-stone-200">✕</button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-stone-400 block mb-1">Notice Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100"
                >
                  <option value="community_event">Community Event / Gathering</option>
                  <option value="market">Market Day / Produce</option>
                  <option value="kaitiaki_environment">Kaitiaki & Coastal Care</option>
                  <option value="tide_safety">Tide & Ocean Warning</option>
                  <option value="council_alert">Local Advisory</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-stone-400 block mb-1">Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Beach Sunset Acoustic Jam Session"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-stone-400 block mb-1">Notice Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe location, timing, and important details..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-stone-400 block mb-1">Your Name / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Beach Surf Club / Sarah W."
                  value={noticeAuthor}
                  onChange={(e) => setNoticeAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
