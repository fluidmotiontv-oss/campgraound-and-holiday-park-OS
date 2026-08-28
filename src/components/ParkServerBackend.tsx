import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  Radio, 
  Zap, 
  ShieldCheck, 
  Car, 
  Wifi, 
  Database, 
  Terminal, 
  Activity, 
  RefreshCw, 
  Play, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Sliders, 
  ChevronRight,
  Sparkles,
  Search,
  Eye,
  FileCode,
  Flame,
  Droplets,
  Layers,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { 
  DragonNode, 
  CampSite, 
  BoardingPass, 
  WeatherHazard, 
  EnergyTelemetry, 
  AutonomousExecutiveLog, 
  OfflineSyncQueueItem 
} from '../types';
import { StorageService } from '../services/storage';
import { DragonNineMatrix } from './DragonNineMatrix';
import { CampgroundMap } from './CampgroundMap';
import { ExecutiveCommandCenter } from './ExecutiveCommandCenter';
import { OfflineSyncEngine } from './OfflineSyncEngine';
import { ResourceUsageForecast } from './ResourceUsageForecast';
import { DragonNestEmulsionExperience } from './DragonNestEmulsionExperience';
import { CapacityThresholdNotificationSystem } from './CapacityThresholdNotificationSystem';

interface ParkServerBackendProps {
  nodes: DragonNode[];
  onUpdateNodes: (nodes: DragonNode[]) => void;
  sites: CampSite[];
  onUpdateSites: (sites: CampSite[]) => void;
  activePass: BoardingPass;
  weather: WeatherHazard;
  energy: EnergyTelemetry;
  logs: AutonomousExecutiveLog[];
  onAddLog: (log: Omit<AutonomousExecutiveLog, 'id'>) => void;
  syncQueue: OfflineSyncQueueItem[];
  onClearQueue: () => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  onSelectNodeForDiagnosis: (node: DragonNode) => void;
  onOpenQrScanner: () => void;
  onSwitchToGuestView: () => void;
  onOpenPitchDeck: () => void;
}

type ServerSubTab = 
  | 'overview_matrix' 
  | 'campground_grid' 
  | 'resource_forecast'
  | 'gate_anpr' 
  | 'sync_ledger' 
  | 'executive_ai' 
  | 'api_inspector'
  | 'dragon_nest_realm';

export const ParkServerBackend: React.FC<ParkServerBackendProps> = ({
  nodes,
  onUpdateNodes,
  sites,
  onUpdateSites,
  activePass,
  weather,
  energy,
  logs,
  onAddLog,
  syncQueue,
  onClearQueue,
  isOffline,
  setIsOffline,
  onSelectNodeForDiagnosis,
  onOpenQrScanner,
  onSwitchToGuestView,
  onOpenPitchDeck
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ServerSubTab>('overview_matrix');
  const [selectedSiteForControl, setSelectedSiteForControl] = useState<CampSite | null>(null);
  const [gateOverridden, setGateOverridden] = useState<boolean>(false);
  const [gateActionStatus, setGateActionStatus] = useState<string | null>(null);
  const [apiStreamFilter, setApiStreamFilter] = useState<'all' | 'gate' | 'energy' | 'sync'>('all');
  const [simulatedRequestsCount, setSimulatedRequestsCount] = useState(14820);

  // Live Simulated Server Request Counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedRequestsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleManualGateActuate = () => {
    setGateOverridden(true);
    setGateActionStatus('MANUAL OVERRIDE: NORTH BOOM BARRIER RAISED (15s Window)');
    
    onAddLog({
      timestamp: new Date().toLocaleTimeString(),
      severity: 'decision',
      pillar: 'Node 4: ANPR & Access Control',
      title: 'OPERATOR MANUAL BARRIER ACTUATION',
      description: 'North access boom barrier raised via server console manual override switch.',
      actionTaken: 'Barrier relay contact closed for 15,000ms. Optical loop detector armed for closure.',
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });

    setTimeout(() => {
      setGateOverridden(false);
      setGateActionStatus(null);
    }, 6000);
  };

  const handleToggleSiteLock = (site: CampSite) => {
    const isOccupied = site.status === 'occupied';
    const nextStatus = isOccupied ? 'available' : 'occupied';
    const updated = sites.map(s => s.id === site.id ? { ...s, status: nextStatus } : s);
    onUpdateSites(updated);
    StorageService.saveSites(updated);

    onAddLog({
      timestamp: new Date().toLocaleTimeString(),
      severity: 'optimization',
      pillar: 'Node 1: Grid & Site Allocation',
      title: `REMOTE SMART LOCK OVERRIDE: ${site.number}`,
      description: `Pitch status transitioned from ${site.status} to ${nextStatus}.`,
      actionTaken: `Zigbee 3.0 lock payload dispatched to pillar ${site.number}. Keypad code refreshed.`,
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* Top Server Command Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                  CAMPGROUND SERVER BACKEND
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                  ARM64 EDGE NODE • v4.8.2-PROD
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-100 tracking-tight">
                Dragon 9 Park Server OS & Operations Command
              </h2>
            </div>
          </div>

          {/* Quick Server Header Actions */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenPitchDeck}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-950 hover:bg-stone-850 text-amber-400 border border-amber-500/40 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pitch & ROI Deck</span>
            </button>

            <button
              onClick={onOpenQrScanner}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <QrCode className="w-3.5 h-3.5 text-stone-950" />
              <span>Gate QR Scanner</span>
            </button>

            <button
              onClick={onSwitchToGuestView}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all flex items-center space-x-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Guest Mobile App</span>
            </button>
          </div>
        </div>

        {/* Real-time Hardware & Network Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-stone-800">
          
          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>SERVER GATEWAY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xs font-mono font-bold text-stone-200">192.168.4.1</div>
            <div className="text-[10px] font-mono text-emerald-400">0.4ms Latency (Local)</div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>900MHz LoRa MESH</span>
              <Radio className="w-3 h-3 text-teal-400" />
            </div>
            <div className="text-xs font-mono font-bold text-teal-400">9 Nodes Synced</div>
            <div className="text-[10px] font-mono text-stone-400">NZ ISM 915-928MHz</div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>STARLINK UPLINK</span>
              <Wifi className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-xs font-mono font-bold text-stone-200">224 Mbps • 34ms</div>
            <div className="text-[10px] font-mono text-blue-400">Edge Caching Active</div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>SOLAR MICROGRID</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">{energy.solarGenerationKw} kW • {energy.batteryStoragePercent}%</div>
            <div className="text-[10px] font-mono text-stone-400">Islanded Resilience</div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>ANPR CAMERA</span>
              <Car className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-xs font-mono font-bold text-purple-400">North Boom 4K</div>
            <div className="text-[10px] font-mono text-stone-400">0.6s Plate OCR</div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>TOTAL REQUESTS</span>
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-xs font-mono font-bold text-stone-200">{simulatedRequestsCount.toLocaleString()}</div>
            <div className="text-[10px] font-mono text-emerald-400">99.99% Uptime</div>
          </div>

        </div>

        {/* Real-time Predictive Capacity Notification & Surge Watch System */}
        <div className="pt-2 border-t border-stone-800">
          <CapacityThresholdNotificationSystem
            sites={sites}
            energy={energy}
            weather={weather}
            onAddLog={onAddLog}
            onNavigateToForecast={() => setActiveSubTab('resource_forecast')}
          />
        </div>

        {/* Server Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-800 overflow-x-auto no-scrollbar">
          
          <button
            id="server-tab-overview"
            onClick={() => setActiveSubTab('overview_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'overview_matrix'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>1. Dragon 9 Infrastructure</span>
          </button>

          <button
            id="server-tab-grid"
            onClick={() => setActiveSubTab('campground_grid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'campground_grid'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Pitch Grid & Power Draw</span>
          </button>

          <button
            id="server-tab-forecast"
            onClick={() => setActiveSubTab('resource_forecast')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'resource_forecast'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-amber-400 hover:text-amber-300 hover:bg-stone-800 border border-amber-500/30'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3. 7-Day Resource Forecast</span>
          </button>

          <button
            id="server-tab-gate"
            onClick={() => setActiveSubTab('gate_anpr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'gate_anpr'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>4. ANPR Gate Controller</span>
          </button>

          <button
            id="server-tab-ledger"
            onClick={() => setActiveSubTab('sync_ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'sync_ledger'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>5. Mesh Sync Ledger ({syncQueue.length})</span>
          </button>

          <button
            id="server-tab-executive"
            onClick={() => setActiveSubTab('executive_ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'executive_ai'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. Executive AI & Safety</span>
          </button>

          <button
            id="server-tab-api"
            onClick={() => setActiveSubTab('api_inspector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'api_inspector'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>7. Live API Stream</span>
          </button>

          <button
            id="server-tab-dragon-nest"
            onClick={() => setActiveSubTab('dragon_nest_realm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeSubTab === 'dragon_nest_realm'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-amber-400 hover:text-amber-300 hover:bg-stone-800 border border-amber-500/30'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>8. Dragon9 Nest Realm Emulsion</span>
          </button>

        </div>

      </div>

      {/* SUB-TAB 1: DRAGON 9 INFRASTRUCTURE MATRIX */}
      {activeSubTab === 'overview_matrix' && (
        <div className="space-y-6">
          <DragonNineMatrix
            nodes={nodes}
            onUpdateNodes={onUpdateNodes}
            energy={energy}
            weather={weather}
            onSelectNodeForDiagnosis={onSelectNodeForDiagnosis}
            onNavigateToTab={(tab: any) => {
              if (tab === 'map') setActiveSubTab('campground_grid');
              else if (tab === 'executive') setActiveSubTab('executive_ai');
              else if (tab === 'offline_mesh') setActiveSubTab('sync_ledger');
              else if (tab === 'forecast' || tab === 'energy') setActiveSubTab('resource_forecast');
            }}
          />
        </div>
      )}

      {/* SUB-TAB 2: CAMPGROUND GRID & POWER DRAW */}
      {activeSubTab === 'campground_grid' && (
        <div className="space-y-6">
          
          {/* Site Overview Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
              <div className="text-[10px] font-mono uppercase text-stone-400">Total Pitches</div>
              <div className="text-2xl font-black text-stone-100">{sites.length}</div>
              <div className="text-[10px] font-mono text-emerald-400">100% Monitored</div>
            </div>

            <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
              <div className="text-[10px] font-mono uppercase text-stone-400">Occupied Today</div>
              <div className="text-2xl font-black text-amber-400">
                {sites.filter(s => s.status === 'occupied').length} / {sites.length}
              </div>
              <div className="text-[10px] font-mono text-amber-300">
                {Math.round((sites.filter(s => s.status === 'occupied').length / sites.length) * 100)}% Occupancy Rate
              </div>
            </div>

            <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
              <div className="text-[10px] font-mono uppercase text-stone-400">Aggregate Power Draw</div>
              <div className="text-2xl font-black text-teal-400">
                {(sites.reduce((acc, s) => acc + s.powerDrawWatts, 0) / 1000).toFixed(1)} kW
              </div>
              <div className="text-[10px] font-mono text-stone-400">Safe below 45kW cap</div>
            </div>

            <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
              <div className="text-[10px] font-mono uppercase text-stone-400">Smart Lock Health</div>
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] font-mono text-stone-400">Battery & mesh OK</div>
            </div>
          </div>

          {/* Quick Forecast Launcher Banner */}
          <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">7-Day Resource Demand & Grid Forecast Available</h4>
                <p className="text-xs text-stone-400">
                  Predictive power, water, solar yield and weekend surge modeling generated from current {sites.length} sites telemetry.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('resource_forecast')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Launch 7-Day Forecast</span>
            </button>
          </div>

          <CampgroundMap
            sites={sites}
            onUpdateSites={onUpdateSites}
            onNavigateToForecast={() => setActiveSubTab('resource_forecast')}
          />
        </div>
      )}

      {/* SUB-TAB 3: RESOURCE USAGE & UTILITY FORECAST */}
      {activeSubTab === 'resource_forecast' && (
        <ResourceUsageForecast
          sites={sites}
          energy={energy}
          weather={weather}
          onAddLog={onAddLog}
        />
      )}

      {/* SUB-TAB 4: ANPR BOOM GATE & RAPID SCANNER */}
      {activeSubTab === 'gate_anpr' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Gate Barrier Feed & Controller */}
            <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-100">North Access Barrier & ANPR Camera</h3>
                    <p className="text-xs text-stone-400 font-mono">Camera: 4K Sony Starvis • Relay: GPIO_17</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                  gateOverridden 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}>
                  {gateOverridden ? 'BARRIER OPEN (ACTUATING)' : 'BARRIER DOWN (ARMED)'}
                </span>
              </div>

              {/* Simulated ANPR Video Stream */}
              <div className="relative w-full h-64 bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex flex-col items-center justify-center p-4">
                
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-bold">LIVE OPTICAL ANPR FEED</span>
                  <span className="text-stone-400">• 30 FPS</span>
                </div>

                <div className="absolute top-3 right-3 bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono text-purple-400">
                  RECOGNITION: 99.4% CONFIDENCE
                </div>

                {/* Target Bounding Box */}
                <div className="w-64 h-36 border-2 border-dashed border-teal-500/60 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-2 bg-teal-950/20 backdrop-blur-sm">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-teal-400">PLATE DETECTED</div>
                  <div className="text-2xl font-black font-mono tracking-widest text-stone-100 bg-stone-900 px-3 py-1 rounded-lg border border-stone-700">
                    {activePass.vehiclePlate}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    MATCH: {activePass.guestName} (Site {activePass.siteNumber})
                  </div>
                </div>

                {/* Gate Actuation Notice Overlay */}
                {gateActionStatus && (
                  <div className="absolute bottom-3 inset-x-3 bg-emerald-950/95 border border-emerald-500/60 rounded-xl p-2.5 text-center text-xs font-mono font-bold text-emerald-200">
                    {gateActionStatus}
                  </div>
                )}
              </div>

              {/* Manual Control Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-stone-400 font-mono">
                  Autonomous check-in latency: <strong>0.6 seconds</strong> from detection to lift.
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenQrScanner}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all flex items-center space-x-1.5 shadow-md"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Launch Pass Scanner</span>
                  </button>

                  <button
                    onClick={handleManualGateActuate}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center space-x-1.5 shadow-md"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Manual Barrier Lift Override</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Gate Access Ledger */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Access Audit Ledger
                </h3>
                <span className="text-[10px] font-mono text-stone-400">EDGE LOGS</span>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {activePass.gateAccessLogs && activePass.gateAccessLogs.length > 0 ? (
                  activePass.gateAccessLogs.map((evt, idx) => (
                    <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-stone-200">{evt.gateName}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          AUTHORIZED
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        Method: <strong className="text-stone-300">{evt.method}</strong> • {evt.timestamp}
                      </div>
                      {evt.notes && (
                        <div className="text-[10px] text-stone-400 italic">{evt.notes}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400 font-mono">
                    No recent gate entries recorded.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 4: MESH SYNC LEDGER */}
      {activeSubTab === 'sync_ledger' && (
        <div className="space-y-6">
          <OfflineSyncEngine
            syncQueue={syncQueue}
            onClearQueue={onClearQueue}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
          />
        </div>
      )}

      {/* SUB-TAB 5: EXECUTIVE AI & COUNCIL SAFETY */}
      {activeSubTab === 'executive_ai' && (
        <div className="space-y-6">
          <ExecutiveCommandCenter
            logs={logs}
            onAddLog={onAddLog}
            nodes={nodes}
            weather={weather}
            energy={energy}
          />
        </div>
      )}

      {/* SUB-TAB 6: LIVE API STREAM & TELEMETRY */}
      {activeSubTab === 'api_inspector' && (
        <div className="space-y-4 bg-stone-900 border border-stone-800 rounded-3xl p-5">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-100">Live Server API & LoRa Packet Telemetry</h3>
                <p className="text-xs text-stone-400 font-mono">Simulated real-time JSON payloads exchanged across ARM64 edge nodes</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setApiStreamFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                  apiStreamFilter === 'all' ? 'bg-stone-800 text-teal-400 font-bold' : 'text-stone-400'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setApiStreamFilter('gate')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                  apiStreamFilter === 'gate' ? 'bg-stone-800 text-teal-400 font-bold' : 'text-stone-400'
                }`}
              >
                GATE API
              </button>
              <button
                onClick={() => setApiStreamFilter('energy')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                  apiStreamFilter === 'energy' ? 'bg-stone-800 text-teal-400 font-bold' : 'text-stone-400'
                }`}
              >
                ENERGY
              </button>
              <button
                onClick={() => setApiStreamFilter('sync')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                  apiStreamFilter === 'sync' ? 'bg-stone-800 text-teal-400 font-bold' : 'text-stone-400'
                }`}
              >
                LoRa MESH
              </button>
            </div>
          </div>

          {/* Code Terminal View */}
          <div className="bg-stone-950 rounded-2xl border border-stone-800 p-4 font-mono text-xs text-stone-300 space-y-3 overflow-x-auto">
            
            {/* Packet 1 */}
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">POST /api/v1/gate/actuate</span>
                <span className="text-stone-400">200 OK • 12ms</span>
              </div>
              <pre className="text-[11px] text-stone-300 overflow-x-auto text-teal-300">
{`{
  "gateId": "GATE_NORTH_01",
  "method": "anpr_plate",
  "licensePlate": "${activePass.vehiclePlate}",
  "tokenVerified": true,
  "action": "BARRIER_LIFT",
  "durationMs": 15000,
  "meshBroadcast": true
}`}
              </pre>
            </div>

            {/* Packet 2 */}
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-bold">LoRa PACKET [NODE-02 MICROGRID]</span>
                <span className="text-stone-400">RSSI: -72dBm • SNR: 9.2dB</span>
              </div>
              <pre className="text-[11px] text-amber-200 overflow-x-auto">
{`{
  "nodeId": "node-02-energy",
  "solarKw": ${energy.solarGenerationKw},
  "batteryPercent": ${energy.batteryStoragePercent},
  "peakShedding": ${energy.peakLoadSheddingActive},
  "inverterStatus": "NOMINAL"
}`}
              </pre>
            </div>

            {/* Packet 3 */}
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-400 font-bold">POST /api/v1/auth/cryptographic-pass</span>
                <span className="text-stone-400">OFFLINE ASYMMETRIC VERIFICATION</span>
              </div>
              <pre className="text-[11px] text-purple-200 overflow-x-auto">
{`{
  "passToken": "${activePass.passToken}",
  "signature": "${activePass.cryptographicSignature.substring(0, 32)}...",
  "totpRollingCode": "${activePass.offlineTotpHash}",
  "status": "VALID_AUTHENTICATED"
}`}
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 8: DRAGON9 NEST REALM EMULSION EXPERIENCE */}
      {activeSubTab === 'dragon_nest_realm' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-stone-950">
                  REALM OPERATOR CONSOLE
                </span>
                <span className="text-xs text-stone-400 font-mono">Sensory Altar & Quests Telemetry Monitor</span>
              </div>
              <h3 className="text-base font-bold text-stone-100 mt-1">
                Dragon9 Nest • Emulsion Resonance & Sensory Well
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/30 self-start sm:self-center">
              MESH BROADCAST: 900MHz ACTIVE
            </span>
          </div>

          <DragonNestEmulsionExperience
            pass={activePass}
            weather={weather}
          />
        </div>
      )}

    </div>
  );
};
