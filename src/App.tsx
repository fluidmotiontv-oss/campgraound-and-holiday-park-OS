import React, { useState, useEffect } from 'react';
import { 
  DragonNode, 
  CampSite, 
  BoardingPass, 
  WeatherHazard, 
  EnergyTelemetry, 
  AutonomousExecutiveLog,
  OfflineSyncQueueItem,
  CommunityBusiness,
  CommunityNotice,
  PortWaikatoMarineConditions
} from './types';
import { StorageService } from './services/storage';
import { Navbar, ActiveAppTab, AppPerspective } from './components/Navbar';
import { DragonNineMatrix } from './components/DragonNineMatrix';
import { BoardingPassCard } from './components/BoardingPassCard';
import { CampgroundMap } from './components/CampgroundMap';
import { ExecutiveCommandCenter } from './components/ExecutiveCommandCenter';
import { GuestExperiencePortal } from './components/GuestExperiencePortal';
import { OfflineSyncEngine } from './components/OfflineSyncEngine';
import { NodeDiagnosticModal } from './components/NodeDiagnosticModal';
import { PortWaikatoHub } from './components/PortWaikatoHub';
import { BookingWizardModal } from './components/BookingWizardModal';
import { QrScannerModal } from './components/QrScannerModal';
import { PresentationPitchModal } from './components/PresentationPitchModal';
import { GuestMobileAppContainer } from './components/GuestMobileAppContainer';
import { ParkServerBackend } from './components/ParkServerBackend';
import { 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Radio, 
  Flame, 
  Zap, 
  WifiOff, 
  Sparkles,
  RefreshCw,
  Waves,
  CalendarCheck,
  Ticket,
  LayoutGrid,
  MapPin,
  Cpu,
  Compass,
  QrCode,
  Smartphone,
  Server
} from 'lucide-react';

export default function App() {
  const [perspective, setPerspective] = useState<AppPerspective>('guest_mobile');
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('port_waikato');
  
  // State from Storage Engine
  const [nodes, setNodes] = useState<DragonNode[]>(() => StorageService.getDragonNodes());
  const [sites, setSites] = useState<CampSite[]>(() => StorageService.getSites());
  const [activePass, setActivePass] = useState<BoardingPass>(() => StorageService.getActivePass());
  const [weather, setWeather] = useState<WeatherHazard>(() => StorageService.getWeather());
  const [energy, setEnergy] = useState<EnergyTelemetry>(() => StorageService.getEnergy());
  const [logs, setLogs] = useState<AutonomousExecutiveLog[]>(() => StorageService.getLogs());
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>(() => StorageService.getSyncQueue());
  const [isOffline, setIsOffline] = useState<boolean>(() => StorageService.isOfflineSimulated());
  
  // Community Hub & Marine State
  const [businesses, setBusinesses] = useState<CommunityBusiness[]>(() => StorageService.getCommunityBusinesses());
  const [notices, setNotices] = useState<CommunityNotice[]>(() => StorageService.getCommunityNotices());
  const [marine, setMarine] = useState<PortWaikatoMarineConditions>(() => StorageService.getMarineConditions());

  // Modals & Overlays
  const [diagnosingNode, setDiagnosingNode] = useState<DragonNode | null>(null);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false);

  // Background Autonomous Telemetry Pulse
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      // Micro fluctuation in solar output and power consumption for fluid realism
      setEnergy((prev) => {
        const deltaSolar = (Math.random() - 0.5) * 0.4;
        const newSolar = Math.max(20, Math.min(65, +(prev.solarGenerationKw + deltaSolar).toFixed(1)));
        const updated = { ...prev, solarGenerationKw: newSolar };
        StorageService.saveEnergy(updated);
        return updated;
      });

      // Poll sync queue count
      setSyncQueue(StorageService.getSyncQueue());
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, []);

  const handleAddLog = (newLog: Omit<AutonomousExecutiveLog, 'id'>) => {
    const updated = StorageService.addLog(newLog);
    setLogs(updated);
  };

  const handleTriggerRangerSos = () => {
    setSosModalOpen(true);
    setSosDispatched(false);
  };

  const handleConfirmSosDispatch = () => {
    setSosDispatched(true);
    handleAddLog({
      timestamp: new Date().toLocaleTimeString(),
      severity: 'emergency',
      pillar: 'Node 3: Safety & Ranger Dispatch',
      title: `EMERGENCY SOS DISPATCH TRIGGERED FOR ${activePass.siteNumber}`,
      description: `GPS coordinates broadcasted across 900MHz LoRa mesh. Ranger Units 1 & 2 converging on ${activePass.zone}.`,
      actionTaken: 'Priority audio beacon sounding. Gate barriers placed in free-egress mode.',
      autonomousAgent: 'Fluid Dispatch',
      status: 'executing'
    });

    setTimeout(() => {
      setSosModalOpen(false);
      setSosDispatched(false);
    }, 4000);
  };

  const handleBookingCompleted = (newPass: BoardingPass) => {
    setActivePass(newPass);
    setSites(StorageService.getSites());
    if (perspective === 'guest_mobile') {
      setActiveTab('boarding_pass');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-teal-500 selection:text-stone-950 flex flex-col pb-16 lg:pb-0">
      
      {/* Offline Wilderness Notification Banner */}
      {isOffline && (
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b border-amber-600/50 px-4 py-2 text-center text-xs font-mono font-semibold text-amber-200 flex items-center justify-center space-x-2">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>OFFLINE WILDERNESS MODE ENGAGED — Standalone Cryptographic Boarding Pass & Edge Mesh Active</span>
          <button 
            onClick={() => {
              setPerspective('park_server');
              setActiveTab('offline_mesh');
            }} 
            className="underline ml-2 text-amber-300 font-bold hover:text-white"
          >
            Inspect Queue ({syncQueue.length})
          </button>
        </div>
      )}

      {/* Primary Sticky Header */}
      <Navbar
        perspective={perspective}
        setPerspective={setPerspective}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        pendingSyncCount={syncQueue.length}
        onSosTrigger={handleTriggerRangerSos}
        onOpenBookingModal={() => setBookingModalOpen(true)}
        onOpenQrScanner={() => setQrScannerOpen(true)}
        onOpenPitchDeck={() => setPitchDeckOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        
        {/* PERSPECTIVE 1: GUEST FRONT-END (MOBILE-OPTIMIZED EXPERIENCE) */}
        {perspective === 'guest_mobile' ? (
          <GuestMobileAppContainer
            pass={activePass}
            onUpdatePass={setActivePass}
            sites={sites}
            onUpdateSites={setSites}
            weather={weather}
            businesses={businesses}
            notices={notices}
            marine={marine}
            isOffline={isOffline}
            onOpenBookingStay={() => setBookingModalOpen(true)}
            onOpenQrScanner={() => setQrScannerOpen(true)}
            onTriggerSos={handleTriggerRangerSos}
            onSwitchToServerView={() => {
              setPerspective('park_server');
              setActiveTab('dragon9');
            }}
            onOpenPitchDeck={() => setPitchDeckOpen(true)}
          />
        ) : (
          /* PERSPECTIVE 2: CAMPGROUND MANAGEMENT & SERVER BACKEND */
          <ParkServerBackend
            nodes={nodes}
            onUpdateNodes={setNodes}
            sites={sites}
            onUpdateSites={setSites}
            activePass={activePass}
            weather={weather}
            energy={energy}
            logs={logs}
            onAddLog={handleAddLog}
            syncQueue={syncQueue}
            onClearQueue={() => setSyncQueue([])}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            onSelectNodeForDiagnosis={(node) => setDiagnosingNode(node)}
            onOpenQrScanner={() => setQrScannerOpen(true)}
            onSwitchToGuestView={() => {
              setPerspective('guest_mobile');
              setActiveTab('port_waikato');
            }}
            onOpenPitchDeck={() => setPitchDeckOpen(true)}
          />
        )}

      </main>

      {/* Presentation Pitch & ROI Deck Modal */}
      <PresentationPitchModal
        isOpen={pitchDeckOpen}
        onClose={() => setPitchDeckOpen(false)}
        onSelectPerspective={(p) => {
          setPerspective(p);
          if (p === 'guest_mobile') setActiveTab('port_waikato');
          else setActiveTab('dragon9');
        }}
        onTriggerDemoAction={(action) => {
          if (action === 'open_qr_scanner') {
            setQrScannerOpen(true);
          }
        }}
      />

      {/* Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        sites={sites}
        onBookingComplete={handleBookingCompleted}
      />

      {/* Touchless Rapid Check-In QR Scanner Modal */}
      <QrScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onCheckInSuccess={(pass) => {
          setActivePass(pass);
          setSites(StorageService.getSites());
          setSyncQueue(StorageService.getSyncQueue());
          setLogs(StorageService.getLogs());
        }}
        onNavigateToTab={(tab) => {
          setActiveTab(tab as ActiveAppTab);
        }}
      />

      {/* Node Telemetry Diagnostics Modal */}
      {diagnosingNode && (
        <NodeDiagnosticModal
          node={diagnosingNode}
          onClose={() => setDiagnosingNode(null)}
          energy={energy}
          weather={weather}
          onNodeUpdated={(updated) => {
            const updatedList = nodes.map(n => n.id === updated.id ? updated : n);
            setNodes(updatedList);
            StorageService.saveDragonNodes(updatedList);
            setDiagnosingNode(updated);
          }}
        />
      )}

      {/* Ranger SOS Emergency Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-stone-900 border-2 border-rose-600 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-stone-100">
                {sosDispatched ? 'SOS BEACON TRANSMITTED' : 'CONFIRM RANGER SOS DISPATCH?'}
              </h3>
              <p className="text-xs text-stone-300">
                {sosDispatched 
                  ? `Emergency alert broadcast over 900MHz LoRa mesh. Units converging on ${activePass.zone} (Site ${activePass.siteNumber}).`
                  : `This broadcasts emergency distress coordinates from Site ${activePass.siteNumber} to all on-duty rangers and raises barriers for emergency vehicle egress.`}
              </p>
            </div>

            {!sosDispatched ? (
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-sos"
                  onClick={handleConfirmSosDispatch}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Dispatch Now</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-mono flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ranger Unit 1 En Route (ETA 3 mins)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Ultra Ergonomic for Phone Use) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          id="mobile-nav-hub"
          onClick={() => {
            setPerspective('guest_mobile');
            setActiveTab('port_waikato');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            perspective === 'guest_mobile' && activeTab === 'port_waikato' ? 'text-teal-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Waves className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Guest App</span>
        </button>

        <button
          id="mobile-nav-book"
          onClick={() => setBookingModalOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-amber-400 font-bold transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-950/50">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 font-extrabold text-amber-300">Book Stay</span>
        </button>

        <button
          id="mobile-nav-pass"
          onClick={() => {
            setPerspective('guest_mobile');
            setActiveTab('boarding_pass');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            perspective === 'guest_mobile' && activeTab === 'boarding_pass' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Boarding Pass</span>
        </button>

        <button
          id="mobile-nav-server"
          onClick={() => {
            setPerspective('park_server');
            setActiveTab('dragon9');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            perspective === 'park_server' ? 'text-teal-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Server className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Park Server</span>
        </button>

        <button
          id="mobile-nav-pitch"
          onClick={() => setPitchDeckOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-amber-300 font-bold hover:text-white"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5">Pitch Deck</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-6 text-stone-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>AOTEAROA HOLIDAY PARK • PORT WAIKATO COMMUNITY HUB • DRAGON 9 OS</span>
          </div>
          <div>
            <span>Sunset Beach & Waikato River Delta • Autonomous Offline Mesh Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
