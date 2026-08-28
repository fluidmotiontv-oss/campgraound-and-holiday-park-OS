import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  QrCode, 
  MapPin, 
  Waves, 
  CalendarCheck, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  Wifi, 
  Key, 
  Car, 
  Clock, 
  Zap, 
  Compass, 
  ChevronRight,
  Menu,
  X,
  Share2,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  BoardingPass, 
  CampSite, 
  WeatherHazard, 
  CommunityBusiness, 
  CommunityNotice, 
  PortWaikatoMarineConditions 
} from '../types';
import { PortWaikatoHub } from './PortWaikatoHub';
import { BoardingPassCard } from './BoardingPassCard';
import { CampgroundMap } from './CampgroundMap';
import { GuestExperiencePortal } from './GuestExperiencePortal';
import { DragonNestEmulsionExperience } from './DragonNestEmulsionExperience';

interface GuestMobileAppContainerProps {
  pass: BoardingPass;
  onUpdatePass: (pass: BoardingPass) => void;
  sites: CampSite[];
  onUpdateSites: (sites: CampSite[]) => void;
  weather: WeatherHazard;
  businesses: CommunityBusiness[];
  notices: CommunityNotice[];
  marine: PortWaikatoMarineConditions;
  isOffline: boolean;
  onOpenBookingStay: () => void;
  onOpenQrScanner: () => void;
  onTriggerSos: () => void;
  onSwitchToServerView: () => void;
  onOpenPitchDeck: () => void;
}

type GuestTab = 'community_beach' | 'boarding_pass' | 'dragon_nest' | 'park_map' | 'concierge_services';

export const GuestMobileAppContainer: React.FC<GuestMobileAppContainerProps> = ({
  pass,
  onUpdatePass,
  sites,
  onUpdateSites,
  weather,
  businesses,
  notices,
  marine,
  isOffline,
  onOpenBookingStay,
  onOpenQrScanner,
  onTriggerSos,
  onSwitchToServerView,
  onOpenPitchDeck
}) => {
  const [activeGuestTab, setActiveGuestTab] = useState<GuestTab>('community_beach');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [showGateActuatedNotice, setShowGateActuatedNotice] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const handleSimulateGateActuation = () => {
    setShowGateActuatedNotice(true);
    setTimeout(() => {
      setShowGateActuatedNotice(false);
    }, 4000);
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(pass.wifiKey);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 3000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      
      {/* Top Presentation Bar for Presenter / Operator */}
      <div className="w-full max-w-5xl bg-stone-900/90 border border-stone-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                CUSTOMER FRONT-END
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                MOBILE-OPTIMIZED PWA
              </span>
            </div>
            <h3 className="text-sm font-bold text-stone-100">
              Campground Guest Experience • Port Waikato Holiday Park
            </h3>
          </div>
        </div>

        {/* Viewport Toggles & Switchers */}
        <div className="flex items-center space-x-2">
          {/* Device Frame Mockup Toggle */}
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-950 hover:bg-stone-850 text-stone-300 border border-stone-700 transition-colors flex items-center space-x-1.5"
            title="Toggle Smartphone Mockup Frame vs Full Width"
          >
            {deviceFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Full Width View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Phone Frame View</span>
              </>
            )}
          </button>

          {/* Rapid QR Scanner Trigger */}
          <button
            onClick={onOpenQrScanner}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors flex items-center space-x-1 shadow-md"
            title="Scan QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Pass QR</span>
          </button>

          {/* Switch to Server Backend */}
          <button
            onClick={onSwitchToServerView}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center space-x-1 shadow-md"
          >
            <span>Switch to Server OS</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Guest View Wrapper (either in phone mockup frame or responsive full width) */}
      <div className={`w-full transition-all duration-300 ${deviceFrameMode ? 'max-w-[430px]' : 'max-w-6xl'}`}>
        
        {/* Smartphone Shell Container (when device frame is active) */}
        <div className={`w-full bg-stone-950 border ${
          deviceFrameMode 
            ? 'border-stone-700 rounded-[46px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-3 sm:p-4 my-2 ring-8 ring-stone-900/90' 
            : 'border-stone-800 rounded-3xl p-4 sm:p-6 shadow-xl'
        } overflow-hidden flex flex-col relative min-h-[780px]`}>
          
          {/* Smartphone Hardware Elements (Dynamic Island & Status Bar) */}
          {deviceFrameMode && (
            <div className="w-full flex items-center justify-between px-6 pt-2 pb-3 select-none">
              <span className="text-xs font-mono font-bold text-stone-300">09:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-28 h-5 bg-stone-900 rounded-full flex items-center justify-center px-2 space-x-2 border border-stone-800 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-stone-400 font-bold">DRAGON 9</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-stone-300 font-mono">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Guest App Header Ribbon */}
          <div className="bg-stone-900/95 border border-stone-800 rounded-2xl p-3.5 mb-3 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-black text-sm">
                PW
              </div>
              <div>
                <div className="text-xs font-black text-stone-100 flex items-center gap-1.5">
                  <span>Port Waikato Holiday Park</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <span>Sunset Beach</span>
                  <span>•</span>
                  <span className="text-amber-400 font-mono">Pitch {pass.siteNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={onOpenBookingStay}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow-sm whitespace-nowrap"
              >
                + Book Stay
              </button>
            </div>
          </div>

          {/* Gate Actuation Notification Banner */}
          {showGateActuatedNotice && (
            <div className="mb-3 p-3 bg-emerald-950 border border-emerald-500/60 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>North Boom Gate Actuated!</strong> Egress window open for 15s.</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LIFTED</span>
            </div>
          )}

          {/* Scrollable Guest View Content Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
            
            {/* TAB 1: COMMUNITY & BEACH HUB */}
            {activeGuestTab === 'community_beach' && (
              <div className="space-y-4">
                
                {/* Guest Quick Pitch Status Bar */}
                <div className="p-3.5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-2xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 font-mono">
                      <span className="text-[9px] uppercase leading-none">SITE</span>
                      <span className="text-sm font-black leading-none">{pass.siteNumber}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100">{pass.guestName}</div>
                      <div className="text-[11px] text-stone-400">{pass.siteType}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveGuestTab('boarding_pass')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 transition-colors flex items-center space-x-1"
                  >
                    <span>Pass PIN</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <PortWaikatoHub
                  businesses={businesses}
                  notices={notices}
                  marine={marine}
                  onOpenBookingStay={onOpenBookingStay}
                  onNoticeAdded={() => {}}
                />
              </div>
            )}

            {/* TAB 2: MY BOARDING PASS */}
            {activeGuestTab === 'boarding_pass' && (
              <div className="space-y-4">
                <BoardingPassCard
                  pass={pass}
                  onUpdatePass={onUpdatePass}
                  weather={weather}
                  isOffline={isOffline}
                  onOpenQrScanner={onOpenQrScanner}
                />
              </div>
            )}

            {/* TAB 3: DRAGON 9 NEST & EMULSION REALM */}
            {activeGuestTab === 'dragon_nest' && (
              <div className="space-y-4">
                <DragonNestEmulsionExperience
                  pass={pass}
                  weather={weather}
                  onUpdatePass={onUpdatePass}
                />
              </div>
            )}

            {/* TAB 4: PARK MAP & PITCH FINDER */}
            {activeGuestTab === 'park_map' && (
              <div className="space-y-4">
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-stone-300">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Your Allocated Pitch: <strong className="text-amber-400 font-mono">{pass.siteNumber} ({pass.zone})</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">GPS ACTIVE</span>
                </div>

                <CampgroundMap
                  sites={sites}
                  onUpdateSites={onUpdateSites}
                />
              </div>
            )}

            {/* TAB 5: CONCIERGE & RANGER SOS */}
            {activeGuestTab === 'concierge_services' && (
              <div className="space-y-4">
                <GuestExperiencePortal
                  pass={pass}
                  onUpdatePass={onUpdatePass}
                  weather={weather}
                  onNavigateToBoardingPass={() => setActiveGuestTab('boarding_pass')}
                />
              </div>
            )}

          </div>

          {/* Bottom Fixed Mobile Tab Bar */}
          <div className="absolute bottom-3 inset-x-3 bg-stone-900/95 backdrop-blur-xl border border-stone-800 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around z-20">
            
            <button
              onClick={() => setActiveGuestTab('community_beach')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                activeGuestTab === 'community_beach'
                  ? 'text-amber-400 bg-amber-950/50 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Beach</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('boarding_pass')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                activeGuestTab === 'boarding_pass'
                  ? 'text-amber-400 bg-amber-950/50 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Pass</span>
            </button>

            {/* DRAGON 9 NEST HIGHLIGHT TAB */}
            <button
              onClick={() => setActiveGuestTab('dragon_nest')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                activeGuestTab === 'dragon_nest'
                  ? 'text-amber-300 bg-gradient-to-b from-amber-600 to-amber-700 shadow-md font-bold text-stone-950'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/30'
              }`}
              title="Enter Dragon9 Nest Emulsion Realm"
            >
              <Flame className={`w-4 h-4 ${activeGuestTab === 'dragon_nest' ? 'text-stone-950 animate-pulse' : 'text-amber-400 animate-pulse'}`} />
              <span className="text-[9px] mt-0.5 font-black tracking-tight">Nest</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </button>

            <button
              onClick={() => setActiveGuestTab('park_map')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                activeGuestTab === 'park_map'
                  ? 'text-amber-400 bg-amber-950/50 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Map</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('concierge_services')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                activeGuestTab === 'concierge_services'
                  ? 'text-amber-400 bg-amber-950/50 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Services</span>
            </button>

            <button
              onClick={onTriggerSos}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-red-400 hover:text-red-300 transition-colors"
              title="Emergency Ranger Dispatch"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-bold">SOS</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
