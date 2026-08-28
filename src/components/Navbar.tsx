import React from 'react';
import { 
  Compass, 
  Ticket, 
  LayoutGrid, 
  MapPin, 
  Cpu, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  Zap, 
  Sparkles,
  RefreshCw,
  Layers,
  Waves,
  CalendarCheck,
  Building2,
  QrCode,
  Smartphone,
  Server
} from 'lucide-react';
import { StorageService } from '../services/storage';

export type ActiveAppTab = 
  | 'port_waikato'
  | 'booking'
  | 'boarding_pass'
  | 'dragon9' 
  | 'map' 
  | 'executive' 
  | 'guest_portal' 
  | 'offline_mesh';

export type AppPerspective = 'guest_mobile' | 'park_server';

interface NavbarProps {
  perspective: AppPerspective;
  setPerspective: (p: AppPerspective) => void;
  activeTab: ActiveAppTab;
  setActiveTab: (tab: ActiveAppTab) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingSyncCount: number;
  onSosTrigger: () => void;
  onOpenBookingModal: () => void;
  onOpenQrScanner: () => void;
  onOpenPitchDeck: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  perspective,
  setPerspective,
  activeTab,
  setActiveTab,
  isOffline,
  setIsOffline,
  pendingSyncCount,
  onSosTrigger,
  onOpenBookingModal,
  onOpenQrScanner,
  onOpenPitchDeck
}) => {
  const toggleOfflineMode = () => {
    const next = !isOffline;
    setIsOffline(next);
    StorageService.setOfflineSimulated(next);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 transition-all">
      
      {/* Top Presentation Bar: Mode Switcher & Pitch Deck Trigger */}
      <div className="bg-stone-950 px-4 sm:px-6 lg:px-8 py-2 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* App Perspective Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-stone-400 font-bold hidden sm:inline uppercase">
            PRESENTATION MODE:
          </span>

          <div className="bg-stone-900 p-1 rounded-xl border border-stone-800 flex items-center space-x-1">
            <button
              id="btn-perspective-guest"
              onClick={() => {
                setPerspective('guest_mobile');
                setActiveTab('port_waikato');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                perspective === 'guest_mobile'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>1. Customer Front-End (Mobile App)</span>
            </button>

            <button
              id="btn-perspective-server"
              onClick={() => {
                setPerspective('park_server');
                setActiveTab('dragon9');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                perspective === 'park_server'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>2. Park Server & Backend (Dragon 9)</span>
            </button>
          </div>
        </div>

        {/* Pitch Deck / Presentation Guide Trigger */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-open-pitch-deck"
            onClick={onOpenPitchDeck}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-black bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/40 shadow-sm transition-all"
            title="Present to Holiday Park Operator / Executive Board"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>📊 Pitch & ROI Deck</span>
          </button>
        </div>

      </div>

      {/* Primary Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-17">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => {
              if (perspective === 'guest_mobile') setActiveTab('port_waikato');
              else setActiveTab('dragon9');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-amber-500 flex items-center justify-center shadow-lg shadow-teal-950/40 ring-1 ring-teal-400/30">
              <span className="text-stone-950 font-black text-lg font-mono tracking-tighter">PW</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-stone-100 flex items-center gap-1.5">
                  AOTEAROA HOLIDAY PARK
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/30">
                    PORT WAIKATO
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                {perspective === 'guest_mobile' 
                  ? 'Guest Portal • Offline Boarding Pass & Beach Hub' 
                  : 'Park Server OS • 900MHz LoRa Mesh & Microgrid'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-stone-950/80 p-1 rounded-2xl border border-stone-800/80">
            {perspective === 'guest_mobile' ? (
              <>
                <button
                  id="tab-port-waikato"
                  onClick={() => setActiveTab('port_waikato')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'port_waikato'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5 text-teal-300" />
                  <span>Port Waikato Hub</span>
                </button>

                <button
                  id="tab-boarding-pass"
                  onClick={() => setActiveTab('boarding_pass')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'boarding_pass'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Boarding Pass</span>
                </button>

                <button
                  id="tab-map"
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'map'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Park Map</span>
                </button>

                <button
                  id="tab-guest-portal"
                  onClick={() => setActiveTab('guest_portal')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'guest_portal'
                      ? 'bg-stone-700 text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Guest Concierge</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-dragon9"
                  onClick={() => setActiveTab('dragon9')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'dragon9'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Dragon 9 Matrix</span>
                </button>

                <button
                  id="tab-map"
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'map'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pitch Grid</span>
                </button>

                <button
                  id="tab-executive"
                  onClick={() => setActiveTab('executive')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'executive'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Executive AI</span>
                </button>

                <button
                  id="tab-offline-mesh"
                  onClick={() => setActiveTab('offline_mesh')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'offline_mesh'
                      ? 'bg-stone-700 text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sync Ledger ({pendingSyncCount})</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Rapid QR Check-In Scanner Trigger */}
            <button
              id="btn-nav-scan-qr"
              onClick={onOpenQrScanner}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-stone-950 hover:bg-stone-850 text-amber-400 border border-amber-500/40 shadow-md shadow-amber-950/30 transition-all transform active:scale-95"
              title="Touchless QR Check-In & Gate Scanner"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Scan Pass</span>
            </button>

            {/* Direct Instant Book Stay Button */}
            <button
              id="btn-nav-book-stay"
              onClick={onOpenBookingModal}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40 transition-all transform active:scale-95"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Stay</span>
            </button>

            {/* Offline Mesh Mode Toggle */}
            <button
              id="toggle-offline-mode"
              onClick={toggleOfflineMode}
              title={isOffline ? 'In Offline Wilderness Mode (Click to connect)' : 'Online via Starlink (Click to test offline resilience)'}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isOffline
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-900/30'
                  : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="font-semibold hidden sm:inline">OFFLINE MESH</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold hidden sm:inline">STARLINK</span>
                </>
              )}
            </button>

            {/* Quick SOS Trigger */}
            <button
              id="btn-ranger-sos"
              onClick={onSosTrigger}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/40 shadow-md shadow-rose-950/50 active:scale-95 transition-transform"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1.5 border-t border-stone-800/60 no-scrollbar">
          <button
            onClick={onOpenQrScanner}
            className="px-2.5 py-1 text-xs whitespace-nowrap rounded-lg font-bold bg-stone-950 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0"
          >
            <QrCode className="w-3 h-3 text-amber-400" /> Scan QR
          </button>
          {perspective === 'guest_mobile' ? (
            <>
              <button
                onClick={() => setActiveTab('port_waikato')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'port_waikato' ? 'bg-teal-600 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <Waves className="w-3 h-3" /> Port Waikato Hub
              </button>
              <button
                onClick={() => setActiveTab('boarding_pass')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'boarding_pass' ? 'bg-amber-600 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <Ticket className="w-3 h-3" /> Boarding Pass
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'map' ? 'bg-cyan-600 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <MapPin className="w-3 h-3" /> Park Map
              </button>
              <button
                onClick={() => setActiveTab('guest_portal')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'guest_portal' ? 'bg-stone-700 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <Compass className="w-3 h-3" /> Concierge
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dragon9')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'dragon9' ? 'bg-emerald-600 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <LayoutGrid className="w-3 h-3" /> Dragon 9 OS
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'map' ? 'bg-cyan-600 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <MapPin className="w-3 h-3" /> Park Grid
              </button>
              <button
                onClick={() => setActiveTab('executive')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'executive' ? 'bg-indigo-600 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <Cpu className="w-3 h-3" /> Executive AI
              </button>
              <button
                onClick={() => setActiveTab('offline_mesh')}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === 'offline_mesh' ? 'bg-stone-700 text-white' : 'text-stone-400 bg-stone-950/60'
                }`}
              >
                <Layers className="w-3 h-3" /> Mesh ({pendingSyncCount})
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};


