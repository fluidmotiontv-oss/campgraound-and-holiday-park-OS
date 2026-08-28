import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Zap, 
  Droplets, 
  Users, 
  Calendar, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Maximize2, 
  Info,
  Compass,
  Radio,
  Sliders,
  Filter
} from 'lucide-react';
import { CampSite, EnergyTelemetry, WeatherHazard } from '../types';

interface PredictedOccupancyMiniMapProps {
  sites: CampSite[];
  energy?: EnergyTelemetry;
  weather?: WeatherHazard;
  weekendMultiplier?: number;
  heatwaveOffset?: number;
  onSelectZone?: (zoneName: string) => void;
  className?: string;
}

export type ForecastDayOption = 'peak_7day' | 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface ZonePrediction {
  id: string;
  name: string;
  shortName: string;
  totalSites: number;
  sites: CampSite[];
  predictedOccupied: number;
  occupancyRate: number; // 0 to 100
  intensityLevel: 'critical' | 'high' | 'moderate' | 'low';
  intensityColor: string;
  intensityGlow: string;
  peakHour: string;
  projectedKw: number;
  projectedWaterGpm: number;
  riskNote: string;
  actionRecommendation: string;
  svgBounds: { x: number; y: number; width: number; height: number; rx: number };
  centerCoord: { x: number; y: number };
}

export const PredictedOccupancyMiniMap: React.FC<PredictedOccupancyMiniMapProps> = ({
  sites,
  energy,
  weather,
  weekendMultiplier = 1.35,
  heatwaveOffset = 0,
  onSelectZone,
  className = ''
}) => {
  const [selectedDay, setSelectedDay] = useState<ForecastDayOption>('peak_7day');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'heat_overlay' | 'site_pins' | 'hybrid'>('hybrid');
  const [hoveredSite, setHoveredSite] = useState<CampSite | null>(null);
  const [showRangerVectors, setShowRangerVectors] = useState<boolean>(true);

  // 7-day metadata list
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  const forecastDaysMeta = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      const isWeekend = d.getDay() === 5 || d.getDay() === 6 || d.getDay() === 0;
      return {
        index: offset,
        label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : dayNames[d.getDay()],
        dateStr: d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }),
        isWeekend
      };
    });
  }, []);

  // Compute predicted zone occupancies
  const zonesData = useMemo<ZonePrediction[]>(() => {
    const zoneConfigs = [
      {
        id: 'zone-alpha',
        name: 'Zone Alpha (Riverfront RV & Glamping)',
        shortName: 'Zone Alpha (Riverfront)',
        zoneMatcher: (z: string) => z.includes('Alpha') || z.includes('River'),
        svgBounds: { x: 70, y: 70, width: 400, height: 210, rx: 18 },
        centerCoord: { x: 270, y: 175 },
        baseWeekendSurge: 1.45,
        kwMultiplier: 3.6,
        waterMultiplier: 1.4
      },
      {
        id: 'zone-beta',
        name: 'Zone Beta (Pinecrest Cabins & 50A Hookups)',
        shortName: 'Zone Beta (Pines)',
        zoneMatcher: (z: string) => z.includes('Beta') || z.includes('Pines'),
        svgBounds: { x: 110, y: 350, width: 430, height: 210, rx: 18 },
        centerCoord: { x: 325, y: 455 },
        baseWeekendSurge: 1.38,
        kwMultiplier: 4.2,
        waterMultiplier: 1.9
      },
      {
        id: 'zone-gamma',
        name: 'Zone Gamma (Ridge Wilderness Tents)',
        shortName: 'Zone Gamma (Ridge)',
        zoneMatcher: (z: string) => z.includes('Gamma') || z.includes('Ridge'),
        svgBounds: { x: 570, y: 350, width: 390, height: 210, rx: 18 },
        centerCoord: { x: 765, y: 455 },
        baseWeekendSurge: 1.25,
        kwMultiplier: 0.8,
        waterMultiplier: 0.7
      },
      {
        id: 'zone-delta',
        name: 'Zone Delta (Moonlit Geodesic Glade)',
        shortName: 'Zone Delta (Glade)',
        zoneMatcher: (z: string) => z.includes('Delta') || z.includes('Glade'),
        svgBounds: { x: 570, y: 70, width: 390, height: 230, rx: 18 },
        centerCoord: { x: 765, y: 185 },
        baseWeekendSurge: 1.5,
        kwMultiplier: 2.9,
        waterMultiplier: 1.2
      }
    ];

    return zoneConfigs.map((cfg) => {
      const zoneSites = sites.filter(s => cfg.zoneMatcher(s.zone));
      const totalSites = zoneSites.length || 4;
      const currentOccupied = zoneSites.filter(s => s.status === 'occupied').length;
      const baseRatio = totalSites > 0 ? (currentOccupied / totalSites) : 0.6;

      let occupancyRate = 0;
      let peakHour = '19:30 - 21:00';

      if (selectedDay === 'peak_7day') {
        // 7-day peak maximum projected occupancy
        const peakMult = weekendMultiplier * cfg.baseWeekendSurge;
        occupancyRate = Math.min(100, Math.round(baseRatio * 100 * peakMult));
        if (cfg.id === 'zone-alpha') occupancyRate = Math.max(92, occupancyRate);
        if (cfg.id === 'zone-delta') occupancyRate = Math.max(95, occupancyRate);
        if (cfg.id === 'zone-beta') occupancyRate = Math.max(88, occupancyRate);
        if (cfg.id === 'zone-gamma') occupancyRate = Math.max(72, occupancyRate);
        peakHour = 'Sat 19:00 - 22:30 (Max Peak)';
      } else {
        const dayIdx = selectedDay as number;
        const dayMeta = forecastDaysMeta[dayIdx];
        const daySurge = dayMeta.isWeekend ? (weekendMultiplier * cfg.baseWeekendSurge * 0.9) : (0.75 + (dayIdx * 0.05));
        occupancyRate = Math.min(100, Math.max(25, Math.round(baseRatio * 100 * daySurge)));
        peakHour = dayMeta.isWeekend ? '18:00 - 21:30' : '17:30 - 19:00';
      }

      const predictedOccupied = Math.round((occupancyRate / 100) * totalSites);
      
      // Calculate heatwave impact
      const tempBoost = 1 + (heatwaveOffset * 0.05);
      const projectedKw = Number((predictedOccupied * cfg.kwMultiplier * tempBoost).toFixed(1));
      const projectedWaterGpm = Number((predictedOccupied * cfg.waterMultiplier * (1 + heatwaveOffset * 0.03)).toFixed(1));

      let intensityLevel: 'critical' | 'high' | 'moderate' | 'low' = 'low';
      let intensityColor = '#0284c7'; // cyan/blue low
      let intensityGlow = 'rgba(2, 132, 199, 0.2)';
      let riskNote = 'Comfortable headroom on feeder line.';
      let actionRecommendation = 'Nominal standard dispatch profile.';

      if (occupancyRate >= 90) {
        intensityLevel = 'critical';
        intensityColor = '#ef4444'; // glowing red/rose
        intensityGlow = 'rgba(239, 68, 68, 0.4)';
        riskNote = `CRITICAL PEAK CONGESTION: Feeder approaching ${projectedKw} kW load.`;
        actionRecommendation = 'Arm automated EV pedestal load shedding & schedule pre-cooling.';
      } else if (occupancyRate >= 75) {
        intensityLevel = 'high';
        intensityColor = '#f59e0b'; // amber/orange
        intensityGlow = 'rgba(245, 158, 11, 0.3)';
        riskNote = `HIGH DEMAND ZONE: Evening peak surge expected at ${peakHour}.`;
        actionRecommendation = 'BESS energy reservation armed for evening peak shaving.';
      } else if (occupancyRate >= 50) {
        intensityLevel = 'moderate';
        intensityColor = '#10b981'; // emerald
        intensityGlow = 'rgba(16, 185, 129, 0.22)';
        riskNote = 'Balanced demand. Microgrid solar comfortably covers pedestal usage.';
        actionRecommendation = 'Maintain autonomous solar-synchronized pumping.';
      } else {
        intensityLevel = 'low';
        intensityColor = '#06b6d4'; // cyan
        intensityGlow = 'rgba(6, 182, 212, 0.15)';
        riskNote = 'Low occupancy buffer available for flexible rerouting.';
        actionRecommendation = 'Ideal buffer zone for maintenance or off-peak EV charging.';
      }

      return {
        id: cfg.id,
        name: cfg.name,
        shortName: cfg.shortName,
        totalSites,
        sites: zoneSites,
        predictedOccupied,
        occupancyRate,
        intensityLevel,
        intensityColor,
        intensityGlow,
        peakHour,
        projectedKw,
        projectedWaterGpm,
        riskNote,
        actionRecommendation,
        svgBounds: cfg.svgBounds,
        centerCoord: cfg.centerCoord
      };
    });
  }, [sites, selectedDay, weekendMultiplier, heatwaveOffset, forecastDaysMeta]);

  const activeZone = zonesData.find(z => z.id === activeZoneId) || null;

  // Overall campground aggregate for selected timeframe
  const campgroundAggregate = useMemo(() => {
    const totalPitches = zonesData.reduce((acc, z) => acc + z.totalSites, 0) || 1;
    const totalOccupied = zonesData.reduce((acc, z) => acc + z.predictedOccupied, 0);
    const avgRate = Math.round((totalOccupied / totalPitches) * 100);
    const totalKw = zonesData.reduce((acc, z) => acc + z.projectedKw, 0);
    const totalWater = zonesData.reduce((acc, z) => acc + z.projectedWaterGpm, 0);
    
    // Find highest peak zone
    const topZone = [...zonesData].sort((a, b) => b.occupancyRate - a.occupancyRate)[0];

    return {
      avgRate,
      totalOccupied,
      totalPitches,
      totalKw: totalKw.toFixed(1),
      totalWater: totalWater.toFixed(1),
      topZone
    };
  }, [zonesData]);

  return (
    <div id="predicted-occupancy-mini-map" className={`bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 ${className}`}>
      
      {/* Top Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>SPATIAL PREDICTIVE HEATMAP</span>
            </span>
            <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
              7-DAY RESOURCE INTENSITY MODEL
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-stone-100 mt-1 flex items-center gap-2">
            Campground Predicted Peak Occupancy Zones
          </h3>
          <p className="text-xs text-stone-400">
            Real-time heat-gradient mapping of microgrid feeder stress, utility draw, and pitch congestion over the next 7 days.
          </p>
        </div>

        {/* View Mode & Overlay Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center space-x-1 text-xs">
            <button
              id="minimap-view-hybrid"
              onClick={() => setViewMode('hybrid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'hybrid'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hybrid View
            </button>
            <button
              id="minimap-view-heat"
              onClick={() => setViewMode('heat_overlay')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'heat_overlay'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Pure Heatmap
            </button>
            <button
              id="minimap-view-pins"
              onClick={() => setViewMode('site_pins')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'site_pins'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Pedestal Pins
            </button>
          </div>

          <button
            id="minimap-toggle-rangers"
            onClick={() => setShowRangerVectors(!showRangerVectors)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
              showRangerVectors 
                ? 'bg-rose-950/60 border-rose-600/50 text-rose-300' 
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-300'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Ranger Beacons</span>
          </button>
        </div>
      </div>

      {/* Interactive Time Horizon Day Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Select Forecast Timeframe Horizon:</span>
          </span>
          <span className="text-[11px] font-mono text-amber-400">
            {selectedDay === 'peak_7day' ? '⭐ Aggregate 7-Day Peak Window Active' : `Viewing Horizon: ${forecastDaysMeta[selectedDay as number].label} (${forecastDaysMeta[selectedDay as number].dateStr})`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* 7-Day Peak Window Master Option */}
          <button
            id="day-selector-peak"
            onClick={() => setSelectedDay('peak_7day')}
            className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedDay === 'peak_7day'
                ? 'bg-gradient-to-br from-amber-950/90 to-rose-950/80 border-amber-500 shadow-lg shadow-amber-950/40 text-amber-200'
                : 'bg-stone-950 hover:bg-stone-800/80 border-stone-800 text-stone-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                ⭐ 7-DAY PEAK
              </span>
              <Flame className="w-3 h-3 text-amber-400" />
            </div>
            <div className="mt-1">
              <div className="text-xs font-black text-stone-100">Peak Surge</div>
              <div className="text-[10px] font-mono text-amber-400/90">Max Intensity</div>
            </div>
          </button>

          {/* Individual Day Tabs */}
          {forecastDaysMeta.map((dm) => {
            const isSelected = selectedDay === dm.index;
            return (
              <button
                key={dm.index}
                id={`day-selector-${dm.index}`}
                onClick={() => setSelectedDay(dm.index as ForecastDayOption)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-950/90 border-teal-500 shadow-lg shadow-teal-950/40 text-teal-200'
                    : 'bg-stone-950 hover:bg-stone-800/80 border-stone-800 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${dm.isWeekend ? 'text-amber-400' : 'text-stone-400'}`}>
                    {dm.label}
                  </span>
                  {dm.isWeekend && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </div>
                <div className="mt-1">
                  <div className="text-xs font-bold text-stone-200">{dm.dateStr}</div>
                  <div className="text-[10px] font-mono text-stone-400">
                    {dm.isWeekend ? 'Weekend' : 'Weekday'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mini-Map & HUD Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Center Map Canvas (7 cols on large screens) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative bg-stone-950 border-2 border-stone-800/80 rounded-3xl overflow-hidden shadow-2xl p-3 sm:p-4 select-none">
            
            {/* Map Top Floating Overlay Info */}
            <div className="absolute top-5 left-5 z-20 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl p-3 text-xs space-y-2 shadow-xl max-w-[260px] pointer-events-none sm:pointer-events-auto">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                  HEAT INTENSITY SCALE
                </div>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                    <span className="text-rose-300 font-semibold">Critical Peak (≥90%)</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">High Stress</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-500 shadow-sm shadow-amber-500/50"></span>
                    <span className="text-amber-300 font-semibold">High Demand (75–89%)</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">Heavy Draw</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                    <span className="text-emerald-300 font-semibold">Moderate (50–74%)</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">Balanced</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
                    <span className="text-cyan-300 font-semibold">Low/Buffer (&lt;50%)</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">Capacity</span>
                </div>
              </div>
            </div>

            {/* SVG Spatial Topological Grid Canvas */}
            <div className="relative w-full aspect-[16/10] bg-stone-900/40 rounded-2xl overflow-hidden border border-stone-800/60">
              <svg viewBox="0 0 1000 600" className="w-full h-full">
                <defs>
                  {/* Glowing Filter for Hotspot Zones */}
                  <filter id="criticalGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <filter id="highGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* River Gradient */}
                  <linearGradient id="riverGradMini" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#083344" />
                    <stop offset="50%" stopColor="#0e7490" />
                    <stop offset="100%" stopColor="#083344" />
                  </linearGradient>

                  {/* Zone Gradients for Heat Overlay */}
                  <radialGradient id="heatAlphaGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
                    <stop offset="70%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                  </radialGradient>

                  <radialGradient id="heatBetaGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                    <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                  </radialGradient>

                  <radialGradient id="heatGammaGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#10b981" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </radialGradient>

                  <radialGradient id="heatDeltaGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.6" />
                    <stop offset="70%" stopColor="#e11d48" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.05" />
                  </radialGradient>

                  {/* Forest pattern */}
                  <pattern id="forestMiniPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="8" cy="8" r="1.2" fill="#14532d" opacity="0.3" />
                    <circle cx="22" cy="18" r="1.2" fill="#14532d" opacity="0.3" />
                  </pattern>
                </defs>

                {/* Base Dark Canvas Fill */}
                <rect width="1000" height="600" fill="#141414" />
                <rect width="1000" height="600" fill="url(#forestMiniPattern)" />

                {/* Winding Alpine River */}
                <path
                  d="M 0,220 Q 200,180 350,260 T 700,290 T 1000,240 L 1000,320 Q 700,380 350,340 T 0,300 Z"
                  fill="url(#riverGradMini)"
                  opacity="0.8"
                />

                {/* Campground Internal Arterial Roads */}
                <path
                  d="M 500,0 L 500,180 Q 500,240 420,270 L 180,320 L 180,550 L 850,550 L 850,150 L 500,150"
                  fill="none"
                  stroke="#292524"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 500,0 L 500,180 Q 500,240 420,270 L 180,320 L 180,550 L 850,550 L 850,150 L 500,150"
                  fill="none"
                  stroke="#78716c"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 4 PREDICTED OCCUPANCY HEATMAP ZONES */}
                {zonesData.map((zone) => {
                  const b = zone.svgBounds;
                  const isZoneActive = activeZoneId === zone.id;
                  const showHeat = viewMode === 'heat_overlay' || viewMode === 'hybrid';
                  
                  // Heat gradient selection
                  const heatFill = 
                    zone.id === 'zone-alpha' ? 'url(#heatAlphaGrad)' :
                    zone.id === 'zone-beta' ? 'url(#heatBetaGrad)' :
                    zone.id === 'zone-gamma' ? 'url(#heatGammaGrad)' :
                    'url(#heatDeltaGrad)';

                  return (
                    <g 
                      key={zone.id} 
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => {
                        setActiveZoneId(isZoneActive ? null : zone.id);
                        if (onSelectZone) onSelectZone(zone.name);
                      }}
                    >
                      {/* Zone Area Heat Fill */}
                      {showHeat && (
                        <>
                          <rect
                            x={b.x}
                            y={b.y}
                            width={b.width}
                            height={b.height}
                            rx={b.rx}
                            fill={heatFill}
                            className="transition-all duration-500"
                          />
                          {/* Pulsing Core Hotspot for Critical / High */}
                          {(zone.intensityLevel === 'critical' || zone.intensityLevel === 'high') && (
                            <circle
                              cx={zone.centerCoord.x}
                              cy={zone.centerCoord.y}
                              r={isZoneActive ? "65" : "45"}
                              fill={zone.intensityColor}
                              fillOpacity={zone.intensityLevel === 'critical' ? "0.3" : "0.2"}
                              className="animate-ping origin-center"
                              style={{ animationDuration: zone.intensityLevel === 'critical' ? '2s' : '3.5s' }}
                            />
                          )}
                        </>
                      )}

                      {/* Zone Outer Border */}
                      <rect
                        x={b.x}
                        y={b.y}
                        width={b.width}
                        height={b.height}
                        rx={b.rx}
                        fill="transparent"
                        stroke={zone.intensityColor}
                        strokeWidth={isZoneActive ? 3.5 : 2}
                        strokeDasharray={isZoneActive ? "none" : "6 4"}
                        strokeOpacity={isZoneActive ? 1 : 0.85}
                        filter={zone.intensityLevel === 'critical' ? "url(#criticalGlow)" : undefined}
                      />

                      {/* Zone Header Badge */}
                      <g transform={`translate(${b.x + 14}, ${b.y + 24})`}>
                        <rect
                          x="-4"
                          y="-14"
                          width={zone.shortName.length * 7 + 105}
                          height="24"
                          rx="6"
                          fill="#0c0a09"
                          fillOpacity="0.9"
                          stroke={zone.intensityColor}
                          strokeWidth="1"
                        />
                        <circle cx="6" cy="-2" r="4" fill={zone.intensityColor} />
                        <text x="16" y="2" fill="#f5f5f4" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {zone.shortName.toUpperCase()}
                        </text>
                        <text 
                          x={zone.shortName.length * 7 + 60} 
                          y="2" 
                          fill={zone.intensityColor} 
                          fontSize="11" 
                          fontFamily="monospace" 
                          fontWeight="900"
                        >
                          {zone.occupancyRate}%
                        </text>
                      </g>

                      {/* Zone Center Floating Intensity Pill */}
                      <g transform={`translate(${zone.centerCoord.x}, ${zone.centerCoord.y})`}>
                        <rect
                          x="-65"
                          y="-20"
                          width="130"
                          height="40"
                          rx="10"
                          fill="#1c1917"
                          fillOpacity="0.92"
                          stroke={zone.intensityColor}
                          strokeWidth={isZoneActive ? "2" : "1"}
                          className="shadow-xl"
                        />
                        <text x="0" y="-4" fill="#fafaf9" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          {zone.predictedOccupied}/{zone.totalSites} Pitches Peak
                        </text>
                        <text x="0" y="12" fill={zone.intensityColor} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          ⚡ {zone.projectedKw} kW | 💧 {zone.projectedWaterGpm} GPM
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Infrastructure Nodes (North Gate, Solar Microgrid, Starlink) */}
                <g transform="translate(500, 30)">
                  <circle cx="0" cy="0" r="14" fill="#0c0a09" stroke="#d97706" strokeWidth="2" />
                  <rect x="-10" y="-2.5" width="20" height="5" fill="#fbbf24" rx="2" />
                  <text x="0" y="22" fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    NORTH BOOM GATE
                  </text>
                </g>

                <g transform="translate(500, 195)">
                  <rect x="-22" y="-14" width="44" height="28" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <path d="M -18,-8 L 18,-8 M -18,0 L 18,0 M -18,8 L 18,8 M -6,-14 L -6,14 M 6,-14 L 6,14" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                  <text x="0" y="24" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    SOLAR MICROGRID (BESS 42kW)
                  </text>
                </g>

                {/* Ranger Patrol Beacons */}
                {showRangerVectors && (
                  <>
                    <g transform="translate(330, 275)">
                      <circle cx="0" cy="0" r="12" fill="#e11d48" fillOpacity="0.25" className="animate-ping" />
                      <circle cx="0" cy="0" r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="0" y="-10" fill="#fda4af" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        RANGER-1 (ALPHA PATROL)
                      </text>
                    </g>
                    <g transform="translate(730, 480)">
                      <circle cx="0" cy="0" r="12" fill="#e11d48" fillOpacity="0.25" className="animate-ping" />
                      <circle cx="0" cy="0" r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="0" y="-10" fill="#fda4af" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        RANGER-2 (RIDGE PATROL)
                      </text>
                    </g>
                  </>
                )}

                {/* INDIVIDUAL CAMPSITE PINS (HYBRID & SITE_PINS MODE) */}
                {(viewMode === 'hybrid' || viewMode === 'site_pins') && sites.map((site) => {
                  const cx = (site.coordinates.x / 100) * 1000;
                  const cy = (site.coordinates.y / 100) * 600;
                  const isHovered = hoveredSite?.id === site.id;
                  const isOccupied = site.status === 'occupied';

                  // Marker color based on predicted demand in current day
                  const siteColor = isOccupied ? '#f59e0b' : site.status === 'cleaning_needed' ? '#06b6d4' : '#10b981';

                  return (
                    <g
                      key={site.id}
                      transform={`translate(${cx}, ${cy})`}
                      className="cursor-pointer transition-transform duration-200"
                      onMouseEnter={() => setHoveredSite(site)}
                      onMouseLeave={() => setHoveredSite(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredSite(site);
                      }}
                    >
                      {isHovered && (
                        <circle cx="0" cy="0" r="16" fill={siteColor} fillOpacity="0.4" className="animate-ping" />
                      )}
                      <circle
                        cx="0"
                        cy="0"
                        r={isHovered ? "9" : "6.5"}
                        fill={siteColor}
                        stroke="#1c1917"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      <text
                        x="0"
                        y="14"
                        fill="#e7e5e4"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {site.number}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hovered Site Quick Floating Tooltip */}
            {hoveredSite && (
              <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-30 bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-2xl p-3.5 shadow-2xl text-xs space-y-1.5 max-w-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredSite.status === 'occupied' ? '#f59e0b' : '#10b981' }}></span>
                    {hoveredSite.name} ({hoveredSite.number})
                  </span>
                  <span className="font-mono text-[10px] text-amber-400 uppercase bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                    {hoveredSite.zone}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-stone-300 pt-1">
                  <div>Status: <span className="text-stone-100 font-bold uppercase">{hoveredSite.status}</span></div>
                  <div>Max Guests: <span className="text-stone-100 font-bold">{hoveredSite.maxOccupancy}</span></div>
                  <div>Current Draw: <span className="text-amber-400 font-bold">{hoveredSite.powerDrawWatts} W</span></div>
                  <div>Water Flow: <span className="text-cyan-400 font-bold">{hoveredSite.waterFlowGpm} GPM</span></div>
                </div>
                {hoveredSite.currentGuestName && (
                  <div className="text-[10px] font-mono text-stone-400 border-t border-stone-800 pt-1">
                    Booked Guest: <span className="text-stone-200">{hoveredSite.currentGuestName}</span> ({hoveredSite.currentPassToken})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Zone Deep-Dive & Action Sidebar (4 cols on large screens) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Zone Detail Card / Aggregate Summary */}
          {activeZone ? (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4.5 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                  INSPECTING ZONE DETAILS
                </span>
                <button
                  onClick={() => setActiveZoneId(null)}
                  className="text-xs text-stone-400 hover:text-stone-200 underline font-mono"
                >
                  View All Zones
                </button>
              </div>

              <div>
                <h4 className="text-base font-black text-stone-100">{activeZone.name}</h4>
                <p className="text-xs text-stone-400">{activeZone.totalSites} telemetry-metered pitches in this quadrant.</p>
              </div>

              {/* Zone Score & Gauge */}
              <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">Predicted Occupancy</span>
                  <span className="font-bold text-sm" style={{ color: activeZone.intensityColor }}>
                    {activeZone.occupancyRate}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${activeZone.occupancyRate}%`,
                      backgroundColor: activeZone.intensityColor 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Capacity: {activeZone.predictedOccupied} of {activeZone.totalSites} pitches</span>
                  <span>Peak: {activeZone.peakHour}</span>
                </div>
              </div>

              {/* Projected Utilities Metric */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-stone-400">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>PEAK POWER DRAW</span>
                  </div>
                  <div className="text-base font-black text-amber-400 mt-0.5">
                    {activeZone.projectedKw} <span className="text-xs font-normal">kW</span>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-stone-400">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>WATER DRAW</span>
                  </div>
                  <div className="text-base font-black text-cyan-400 mt-0.5">
                    {activeZone.projectedWaterGpm} <span className="text-xs font-normal">GPM</span>
                  </div>
                </div>
              </div>

              {/* Autonomous AI Risk & Mitigation Recommendation */}
              <div className="p-3 bg-stone-900/90 rounded-xl border border-amber-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dragon 9 Grid Assessment</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {activeZone.riskNote}
                </p>
                <div className="pt-1.5 border-t border-stone-800 text-[11px] text-teal-300 font-mono">
                  💡 Action: {activeZone.actionRecommendation}
                </div>
              </div>
            </div>
          ) : (
            /* Campground 4-Zone Comparison Matrix */
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  ZONE PREDICTION MATRIX
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Campground Avg: {campgroundAggregate.avgRate}%
                </span>
              </div>

              <div className="space-y-2">
                {zonesData.map((zone) => {
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setActiveZoneId(zone.id)}
                      className="p-2.5 bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-xl transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.intensityColor }}></span>
                          <span className="text-xs font-bold text-stone-200">{zone.shortName}</span>
                        </div>
                        <span className="font-mono text-xs font-black" style={{ color: zone.intensityColor }}>
                          {zone.occupancyRate}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${zone.occupancyRate}%`, backgroundColor: zone.intensityColor }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                        <span>{zone.predictedOccupied}/{zone.totalSites} Sites Booked</span>
                        <span>⚡ {zone.projectedKw} kW</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Peak Feeder Hotspot Warning */}
              <div className="p-3 bg-rose-950/30 border border-rose-600/30 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-300">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Predicted Peak Hotspot: {campgroundAggregate.topZone.shortName}</span>
                </div>
                <p className="text-[11px] text-stone-300">
                  Reaching <span className="font-bold text-rose-400">{campgroundAggregate.topZone.occupancyRate}% peak capacity</span>. Microgrid BESS reserve automatically staged to protect 50A transformer.
                </p>
              </div>
            </div>
          )}

          {/* Quick Macro Actions Bar */}
          <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
              <span>PREDICTIVE GRID CONTROL</span>
              <Sliders className="w-3 h-3 text-teal-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <button 
                onClick={() => {
                  alert('Dragon 9 AI: Autonomous Peak-Shaving profile armed for Zone Alpha & Delta.');
                }}
                className="px-2.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-xl text-left transition-colors flex items-center justify-between"
              >
                <span>Arm Peak Shaving</span>
                <ChevronRight className="w-3 h-3 text-stone-400" />
              </button>

              <button 
                onClick={() => {
                  alert('Dragon 9 AI: Solar-synchronized wellhead pumping prioritized for 11:00-15:00 window.');
                }}
                className="px-2.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-xl text-left transition-colors flex items-center justify-between"
              >
                <span>Pre-Pump Reservoirs</span>
                <ChevronRight className="w-3 h-3 text-stone-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
