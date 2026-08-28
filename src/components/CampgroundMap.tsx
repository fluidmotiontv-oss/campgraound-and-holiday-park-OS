import React, { useState, useMemo } from 'react';
import { 
  CampSite, 
  SiteType, 
  SiteStatus 
} from '../types';
import { 
  MapPin, 
  Zap, 
  Droplet, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Car, 
  Tent, 
  Sparkles, 
  Radio, 
  ShieldAlert,
  Layers,
  Filter,
  Flame,
  TrendingUp,
  Sliders,
  Users,
  Eye,
  Activity,
  Maximize2
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface CampgroundMapProps {
  sites: CampSite[];
  onUpdateSites: (sites: CampSite[]) => void;
  onSelectSite?: (site: CampSite) => void;
  onNavigateToForecast?: () => void;
}

type HeatmapMode = 'reservation_density' | 'capacity_headcount' | 'power_draw';
type SaturationLevel = 'subtle' | 'standard' | 'vivid';

interface ZoneDensityData {
  zoneName: 'Zone Alpha (River)' | 'Zone Beta (Pines)' | 'Zone Gamma (Ridge)' | 'Zone Delta (Glade)';
  shortName: string;
  totalSites: number;
  occupiedCount: number;
  reservedCount: number;
  availableCount: number;
  cleaningCount: number;
  occupancyPercent: number;
  guestHeadcount: number;
  totalPowerWatts: number;
  colorHex: string;
  saturationLabel: 'Extreme' | 'High' | 'Moderate' | 'Low' | 'Vacant';
  bgGradientId: string;
  radialGradientId: string;
}

export const CampgroundMap: React.FC<CampgroundMapProps> = ({
  sites,
  onUpdateSites,
  onSelectSite,
  onNavigateToForecast
}) => {
  const [selectedSite, setSelectedSite] = useState<CampSite | null>(null);
  const [hoveredSite, setHoveredSite] = useState<CampSite | null>(null);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRangers, setShowRangers] = useState(true);
  const [showUtilities, setShowUtilities] = useState(true);
  
  // Real-time Occupancy Heatmap Layer State
  const [showOccupancyHeatmap, setShowOccupancyHeatmap] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('reservation_density');
  const [saturationLevel, setSaturationLevel] = useState<SaturationLevel>('standard');
  const [showDensityContourRings, setShowDensityContourRings] = useState(true);
  const [showPointEmitters, setShowPointEmitters] = useState(true);

  // Compute dynamic zone density based on active sites reservation data
  const zoneDensities = useMemo<Record<string, ZoneDensityData>>(() => {
    const zonesList: Array<{
      key: 'Zone Alpha (River)' | 'Zone Beta (Pines)' | 'Zone Gamma (Ridge)' | 'Zone Delta (Glade)';
      short: string;
      bgId: string;
      radId: string;
    }> = [
      { key: 'Zone Alpha (River)', short: 'Zone Alpha', bgId: 'dynHeatAlphaBg', radId: 'dynHeatAlphaRad' },
      { key: 'Zone Beta (Pines)', short: 'Zone Beta', bgId: 'dynHeatBetaBg', radId: 'dynHeatBetaRad' },
      { key: 'Zone Gamma (Ridge)', short: 'Zone Gamma', bgId: 'dynHeatGammaBg', radId: 'dynHeatGammaRad' },
      { key: 'Zone Delta (Glade)', short: 'Zone Delta', bgId: 'dynHeatDeltaBg', radId: 'dynHeatDeltaRad' },
    ];

    const result: Record<string, ZoneDensityData> = {};

    zonesList.forEach(z => {
      const zoneSites = sites.filter(s => s.zone === z.key);
      const total = zoneSites.length || 1;
      const occupied = zoneSites.filter(s => s.status === 'occupied').length;
      const reserved = zoneSites.filter(s => s.status === 'reserved').length;
      const available = zoneSites.filter(s => s.status === 'available').length;
      const cleaning = zoneSites.filter(s => s.status === 'cleaning_needed').length;
      
      const occupancyPercent = Math.round(((occupied + reserved) / total) * 100);
      const guestHeadcount = zoneSites.reduce((sum, s) => {
        if (s.status === 'occupied' || s.status === 'reserved') {
          return sum + (s.maxOccupancy || 2);
        }
        return sum;
      }, 0);
      const totalPowerWatts = zoneSites.reduce((sum, s) => sum + (s.powerDrawWatts || 0), 0);

      // Determine saturation tier & color based on real-time reservation data
      let colorHex = '#10b981'; // green for low
      let saturationLabel: ZoneDensityData['saturationLabel'] = 'Low';

      if (occupancyPercent >= 85) {
        colorHex = '#ef4444'; // deep red/crimson
        saturationLabel = 'Extreme';
      } else if (occupancyPercent >= 65) {
        colorHex = '#f97316'; // saturated orange
        saturationLabel = 'High';
      } else if (occupancyPercent >= 40) {
        colorHex = '#f59e0b'; // amber/gold
        saturationLabel = 'Moderate';
      } else if (occupancyPercent > 0) {
        colorHex = '#10b981'; // emerald
        saturationLabel = 'Low';
      } else {
        colorHex = '#06b6d4'; // cyan/cool vacant
        saturationLabel = 'Vacant';
      }

      result[z.key] = {
        zoneName: z.key,
        shortName: z.short,
        totalSites: zoneSites.length,
        occupiedCount: occupied,
        reservedCount: reserved,
        availableCount: available,
        cleaningCount: cleaning,
        occupancyPercent,
        guestHeadcount,
        totalPowerWatts,
        colorHex,
        saturationLabel,
        bgGradientId: z.bgId,
        radialGradientId: z.radId
      };
    });

    return result;
  }, [sites]);

  // Overall park occupancy metrics
  const totalOccupiedAndReserved = useMemo(() => {
    return sites.filter(s => s.status === 'occupied' || s.status === 'reserved').length;
  }, [sites]);

  const parkOccupancyRate = useMemo(() => {
    return sites.length ? Math.round((totalOccupiedAndReserved / sites.length) * 100) : 0;
  }, [sites, totalOccupiedAndReserved]);

  // Hottest zone identification
  const hottestZone = useMemo(() => {
    const list = Object.values(zoneDensities);
    return list.sort((a, b) => b.occupancyPercent - a.occupancyPercent)[0];
  }, [zoneDensities]);

  const handleSiteClick = (site: CampSite) => {
    setSelectedSite(site);
    if (onSelectSite) onSelectSite(site);
  };

  const handleToggleSiteStatus = (siteId: string) => {
    const updated = sites.map(s => {
      if (s.id === siteId) {
        const nextStatus: SiteStatus = 
          s.status === 'occupied' ? 'cleaning_needed' :
          s.status === 'cleaning_needed' ? 'available' : 'occupied';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    onUpdateSites(updated);
    StorageService.saveSites(updated);
    if (selectedSite && selectedSite.id === siteId) {
      setSelectedSite(updated.find(s => s.id === siteId) || null);
    }
  };

  const getStatusColor = (status: SiteStatus) => {
    switch (status) {
      case 'occupied': return '#f59e0b'; // amber
      case 'reserved': return '#f97316'; // orange
      case 'available': return '#10b981'; // emerald
      case 'cleaning_needed': return '#06b6d4'; // cyan
      case 'maintenance': return '#ef4444'; // rose
      default: return '#78716c';
    }
  };

  // Get point heat saturation color and radius for individual site emitters
  const getSiteHeatEmitterParams = (site: CampSite) => {
    let weight = 0.1;
    let color = '#10b981';
    let radius = 32;

    if (heatmapMode === 'reservation_density') {
      if (site.status === 'occupied') {
        weight = 1.0;
        color = '#ef4444'; // red
        radius = 48;
      } else if (site.status === 'reserved') {
        weight = 0.8;
        color = '#f97316'; // orange
        radius = 42;
      } else if (site.status === 'cleaning_needed') {
        weight = 0.45;
        color = '#06b6d4'; // cyan
        radius = 32;
      } else {
        weight = 0.15;
        color = '#10b981'; // green
        radius = 24;
      }
    } else if (heatmapMode === 'capacity_headcount') {
      const occRatio = (site.status === 'occupied' || site.status === 'reserved') ? site.maxOccupancy / 8 : 0.1;
      weight = Math.min(1, occRatio);
      color = weight > 0.7 ? '#ef4444' : weight > 0.4 ? '#f59e0b' : '#10b981';
      radius = 24 + weight * 32;
    } else if (heatmapMode === 'power_draw') {
      const powerRatio = Math.min(1, site.powerDrawWatts / 3500);
      weight = Math.max(0.1, powerRatio);
      color = weight > 0.75 ? '#ef4444' : weight > 0.4 ? '#f59e0b' : '#38bdf8';
      radius = 24 + weight * 30;
    }

    // Adjust opacity and intensity multiplier based on saturationLevel
    const multiplier = saturationLevel === 'vivid' ? 1.4 : saturationLevel === 'subtle' ? 0.65 : 1.0;
    const fillOpacity = Math.min(0.85, (weight * 0.55 + 0.1) * multiplier);

    return { weight, color, radius, fillOpacity };
  };

  const filteredSites = sites.filter(site => {
    if (filterType !== 'all' && !site.type.includes(filterType)) return false;
    if (filterStatus !== 'all' && site.status !== filterStatus) return false;
    if (focusedZone && site.zone !== focusedZone) return false;
    return true;
  });

  return (
    <div id="campground-map-container" className="space-y-6">
      
      {/* Top Controls & Heatmap Layer Control Bar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              CAMPGROUND TOPOLOGICAL GRID
            </span>
            <span className="text-xs text-stone-400 font-mono">16 Smart Telemetry Pitches</span>
            {showOccupancyHeatmap && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                parkOccupancyRate >= 80 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                parkOccupancyRate >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                <span>Heatmap Active: {parkOccupancyRate}% Occupied</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-stone-100 mt-1">
            Interactive Holiday Park Spatial Grid & Occupancy Heatmap
          </h2>
          <p className="text-xs text-stone-400">
            Real-time visual monitoring of pitch density saturation, reservation load, 50A/30A loads, and ranger patrol vectors.
          </p>
        </div>

        {/* Heatmap Layer & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* Main Heatmap Layer Toggle */}
          <button
            id="map-toggle-occupancy-heatmap"
            onClick={() => setShowOccupancyHeatmap(!showOccupancyHeatmap)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 shadow-sm ${
              showOccupancyHeatmap
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-stone-950 border-amber-400 shadow-amber-950/40'
                : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-stone-100'
            }`}
          >
            <Flame className={`w-4 h-4 ${showOccupancyHeatmap ? 'animate-bounce' : 'text-amber-400'}`} />
            <span>{showOccupancyHeatmap ? 'Occupancy Heatmap ON' : 'Show Occupancy Heatmap'}</span>
          </button>

          {/* Filter Type */}
          <div className="flex items-center space-x-1 bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400 ml-1.5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-stone-200 border-none text-xs focus:ring-0 cursor-pointer pr-4"
            >
              <option value="all" className="bg-stone-900">All Pitch Types</option>
              <option value="rv" className="bg-stone-900">RV Sites (50A / 30A)</option>
              <option value="glamping" className="bg-stone-900">Glamping Safari</option>
              <option value="cabin" className="bg-stone-900">Luxury Cabins</option>
              <option value="tent" className="bg-stone-900">Tent Pitches</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center space-x-1 bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-stone-200 border-none text-xs focus:ring-0 cursor-pointer pr-4"
            >
              <option value="all" className="bg-stone-900">All Statuses</option>
              <option value="occupied" className="bg-stone-900">Occupied (Amber/Red)</option>
              <option value="available" className="bg-stone-900">Available (Green)</option>
              <option value="cleaning_needed" className="bg-stone-900">Cleaning Turn (Cyan)</option>
            </select>
          </div>

          {/* Ranger Beacon Toggle */}
          <button
            id="map-toggle-rangers"
            onClick={() => setShowRangers(!showRangers)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center space-x-1 ${
              showRangers ? 'bg-rose-950/60 border-rose-600/50 text-rose-300' : 'bg-stone-950 border-stone-800 text-stone-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Rangers</span>
          </button>
        </div>
      </div>

      {/* Advanced Heatmap Layer Customizer Sub-Bar (Visible when Heatmap is Active) */}
      {showOccupancyHeatmap && (
        <div className="bg-stone-900/95 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Heatmap Dimension Selector */}
            <div className="flex items-center space-x-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setHeatmapMode('reservation_density')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  heatmapMode === 'reservation_density'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Reservation Density</span>
              </button>

              <button
                onClick={() => setHeatmapMode('capacity_headcount')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  heatmapMode === 'capacity_headcount'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Guest Headcount Load</span>
              </button>

              <button
                onClick={() => setHeatmapMode('power_draw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  heatmapMode === 'power_draw'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Pedestal Energy Draw</span>
              </button>
            </div>

            {/* Saturation Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Color Saturation:</span>
              </span>
              <div className="flex items-center bg-stone-950 p-0.5 rounded-xl border border-stone-800 text-xs">
                {(['subtle', 'standard', 'vivid'] as SaturationLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSaturationLevel(level)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-mono text-[11px] transition-all ${
                      saturationLevel === level
                        ? 'bg-stone-800 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Switches */}
            <div className="flex items-center space-x-3 text-xs">
              <label className="flex items-center space-x-1.5 text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDensityContourRings}
                  onChange={(e) => setShowDensityContourRings(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-mono">Density Contours</span>
              </label>

              <label className="flex items-center space-x-1.5 text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPointEmitters}
                  onChange={(e) => setShowPointEmitters(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-mono">Point Gaussian Blobs</span>
              </label>
            </div>
          </div>

          {/* Real-time Zone Saturation Summary & Focus Filter Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800">
            {Object.values(zoneDensities).map((zd) => {
              const isFocused = focusedZone === zd.zoneName;
              return (
                <button
                  key={zd.zoneName}
                  onClick={() => setFocusedZone(isFocused ? null : zd.zoneName)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isFocused 
                      ? 'bg-stone-850 ring-2 ring-amber-400 border-amber-400' 
                      : 'bg-stone-950/70 hover:bg-stone-950 border-stone-800/80'
                  }`}
                >
                  <div 
                    className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none"
                    style={{ backgroundColor: zd.colorHex, opacity: 0.2 }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-stone-400">{zd.shortName}</span>
                    <span 
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase"
                      style={{ 
                        backgroundColor: `${zd.colorHex}25`, 
                        color: zd.colorHex,
                        border: `1px solid ${zd.colorHex}40`
                      }}
                    >
                      {zd.saturationLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-lg font-black text-stone-100">{zd.occupancyPercent}%</span>
                    <span className="text-[10px] font-mono text-stone-400">
                      ({zd.occupiedCount + zd.reservedCount}/{zd.totalSites} sites)
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${zd.occupancyPercent}%`,
                        backgroundColor: zd.colorHex
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Context & Forecast Link */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-400 font-mono">
            <div className="flex items-center space-x-2">
              <span>Hottest Density Cluster:</span>
              <span className="text-amber-300 font-bold">
                {hottestZone?.shortName} ({hottestZone?.occupancyPercent}% Occupancy • {hottestZone?.guestHeadcount} Guests)
              </span>
            </div>

            {onNavigateToForecast && (
              <button
                onClick={onNavigateToForecast}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>View 7-Day Capacity Forecast & Surge Models &rarr;</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative bg-stone-950 border-2 border-stone-800/80 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 select-none">
        
        {/* Map Legend Overlay with Dynamic Saturation Scale */}
        <div className="absolute top-6 left-6 z-20 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl p-3.5 text-xs space-y-2.5 shadow-xl max-w-xs pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase text-stone-400 tracking-wider">
              {showOccupancyHeatmap ? 'HEATMAP SATURATION SCALE' : 'CAMPGROUND LEGEND'}
            </span>
            {focusedZone && (
              <button 
                onClick={() => setFocusedZone(null)} 
                className="text-[10px] text-amber-400 hover:underline font-mono"
              >
                Clear Focus
              </button>
            )}
          </div>

          {showOccupancyHeatmap ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span>0% Vacant</span>
                <span>50% Density</span>
                <span>100% Saturation</span>
              </div>

              {/* Multi-step Continuous Color Gradient Bar */}
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-rose-600 border border-stone-700/50 shadow-inner" />

              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
                <div className="flex items-center space-x-1.5 text-stone-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm shadow-rose-950"></span>
                  <span>&gt;85% Saturated Hotspot</span>
                </div>
                <div className="flex items-center space-x-1.5 text-stone-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span>65-85% High Density</span>
                </div>
                <div className="flex items-center space-x-1.5 text-stone-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>40-64% Moderate</span>
                </div>
                <div className="flex items-center space-x-1.5 text-stone-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>&lt;40% Relaxed Pitch</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-[11px] text-stone-300">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Occupied Pitch</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Available Pitch</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span>Turn Clean Needed</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Popover Tooltip for Campsites */}
        {hoveredSite && !selectedSite && (
          <div 
            className="absolute z-30 bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-xl p-3 shadow-2xl text-xs space-y-1 pointer-events-none transition-all duration-150 animate-fadeIn"
            style={{
              left: `${Math.min(80, Math.max(10, hoveredSite.coordinates.x))}%`,
              top: `${Math.min(75, Math.max(15, hoveredSite.coordinates.y - 12))}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1">
              <span className="font-bold text-stone-100">{hoveredSite.number} - {hoveredSite.name}</span>
              <span 
                className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase"
                style={{ 
                  backgroundColor: `${getStatusColor(hoveredSite.status)}25`,
                  color: getStatusColor(hoveredSite.status)
                }}
              >
                {hoveredSite.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[10px] font-mono text-stone-400">
              Zone: {hoveredSite.zone} • Max {hoveredSite.maxOccupancy} Guests
            </div>
            {hoveredSite.currentGuestName && (
              <div className="text-[10px] text-amber-300 font-medium">
                Guest: {hoveredSite.currentGuestName}
              </div>
            )}
            <div className="text-[10px] font-mono text-teal-400 flex items-center gap-1 pt-0.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Load: {hoveredSite.powerDrawWatts} W • ${(hoveredSite.pricePerNight)}/nt</span>
            </div>
          </div>
        )}

        {/* SVG Topological Map with Dynamic Heatmap Layer */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-stone-900/40 rounded-2xl overflow-hidden border border-stone-800/50">
          
          <svg viewBox="0 0 1000 600" className="w-full h-full">
            
            {/* Background Terrain & River Contours & Dynamic SVG Heatmap Gradients */}
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="50%" stopColor="#0e7490" />
                <stop offset="100%" stopColor="#083344" />
              </linearGradient>

              {/* Dynamic Zone Radial Heatmap Gradients computed from live reservation data */}
              {Object.values(zoneDensities).map(zd => (
                <radialGradient key={zd.radialGradientId} id={zd.radialGradientId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={zd.colorHex} stopOpacity={saturationLevel === 'vivid' ? 0.75 : saturationLevel === 'subtle' ? 0.35 : 0.55} />
                  <stop offset="65%" stopColor={zd.colorHex} stopOpacity={saturationLevel === 'vivid' ? 0.35 : saturationLevel === 'subtle' ? 0.15 : 0.25} />
                  <stop offset="100%" stopColor={zd.colorHex} stopOpacity="0.03" />
                </radialGradient>
              ))}

              {/* Point Emitter Gaussian Blur Filter for authentic continuous heatmap blending */}
              <filter id="occupancyHeatmapBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={saturationLevel === 'vivid' ? 24 : 18} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <pattern id="forestPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#14532d" opacity="0.4" />
                <circle cx="30" cy="25" r="1.5" fill="#14532d" opacity="0.4" />
                <circle cx="20" cy="35" r="1.2" fill="#14532d" opacity="0.3" />
              </pattern>
            </defs>

            {/* Base Terrain Fill */}
            <rect width="1000" height="600" fill="#171717" />
            <rect width="1000" height="600" fill="url(#forestPattern)" />

            {/* Winding Alpine River */}
            <path
              d="M 0,220 Q 200,180 350,260 T 700,290 T 1000,240 L 1000,320 Q 700,380 350,340 T 0,300 Z"
              fill="url(#riverGrad)"
              opacity="0.85"
            />

            {/* Campground Access Roads */}
            <path
              d="M 500,0 L 500,180 Q 500,240 420,270 L 180,320 L 180,550 L 850,550 L 850,150 L 500,150"
              fill="none"
              stroke="#292524"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 500,0 L 500,180 Q 500,240 420,270 L 180,320 L 180,550 L 850,550 L 850,150 L 500,150"
              fill="none"
              stroke="#57534e"
              strokeWidth="2"
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ZONE 1: Zone Alpha (Riverfront RV & Glamping) */}
            {(() => {
              const zd = zoneDensities['Zone Alpha (River)'];
              const isHot = zd && zd.occupancyPercent >= 75;
              return (
                <g>
                  <rect 
                    x="80" 
                    y="80" 
                    width="380" 
                    height="200" 
                    rx="16" 
                    fill={showOccupancyHeatmap ? `url(#${zd.radialGradientId})` : "#042f2e"} 
                    fillOpacity={showOccupancyHeatmap ? 1 : 0.25} 
                    stroke={showOccupancyHeatmap ? zd.colorHex : "#115e59"} 
                    strokeWidth={showOccupancyHeatmap ? (isHot ? 2.5 : 1.5) : 1} 
                    strokeDasharray={showOccupancyHeatmap ? (isHot ? "none" : "4 4") : "4 4"} 
                  />
                  <text x="95" y="105" fill={showOccupancyHeatmap ? zd.colorHex : "#2dd4bf"} fontSize="11" fontFamily="monospace" fontWeight="bold">
                    ZONE ALPHA (RIVERFRONT RV & GLAMPING) {showOccupancyHeatmap && `— ${zd.occupancyPercent}% OCCUPIED (${zd.saturationLabel.toUpperCase()})`}
                  </text>
                  {/* Active Density Contour Isolines */}
                  {showOccupancyHeatmap && showDensityContourRings && isHot && (
                    <ellipse cx="270" cy="180" rx="160" ry="80" fill="none" stroke={zd.colorHex} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" className="animate-pulse" />
                  )}
                </g>
              );
            })()}

            {/* ZONE 2: Zone Beta (Pinecrest Cabins & 50A) */}
            {(() => {
              const zd = zoneDensities['Zone Beta (Pines)'];
              const isHot = zd && zd.occupancyPercent >= 75;
              return (
                <g>
                  <rect 
                    x="120" 
                    y="360" 
                    width="420" 
                    height="200" 
                    rx="16" 
                    fill={showOccupancyHeatmap ? `url(#${zd.radialGradientId})` : "#14532d"} 
                    fillOpacity={showOccupancyHeatmap ? 1 : 0.2} 
                    stroke={showOccupancyHeatmap ? zd.colorHex : "#166534"} 
                    strokeWidth={showOccupancyHeatmap ? (isHot ? 2.5 : 1.5) : 1} 
                    strokeDasharray={showOccupancyHeatmap ? (isHot ? "none" : "4 4") : "4 4"} 
                  />
                  <text x="135" y="385" fill={showOccupancyHeatmap ? zd.colorHex : "#4ade80"} fontSize="11" fontFamily="monospace" fontWeight="bold">
                    ZONE BETA (PINECREST CABINS & 50A) {showOccupancyHeatmap && `— ${zd.occupancyPercent}% OCCUPIED (${zd.saturationLabel.toUpperCase()})`}
                  </text>
                  {showOccupancyHeatmap && showDensityContourRings && isHot && (
                    <ellipse cx="330" cy="460" rx="180" ry="75" fill="none" stroke={zd.colorHex} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" className="animate-pulse" />
                  )}
                </g>
              );
            })()}

            {/* ZONE 3: Zone Gamma (Ridge Wilderness Tents) */}
            {(() => {
              const zd = zoneDensities['Zone Gamma (Ridge)'];
              const isHot = zd && zd.occupancyPercent >= 75;
              return (
                <g>
                  <rect 
                    x="580" 
                    y="360" 
                    width="380" 
                    height="200" 
                    rx="16" 
                    fill={showOccupancyHeatmap ? `url(#${zd.radialGradientId})` : "#451a03"} 
                    fillOpacity={showOccupancyHeatmap ? 1 : 0.2} 
                    stroke={showOccupancyHeatmap ? zd.colorHex : "#78350f"} 
                    strokeWidth={showOccupancyHeatmap ? (isHot ? 2.5 : 1.5) : 1} 
                    strokeDasharray={showOccupancyHeatmap ? (isHot ? "none" : "4 4") : "4 4"} 
                  />
                  <text x="595" y="385" fill={showOccupancyHeatmap ? zd.colorHex : "#fbbf24"} fontSize="11" fontFamily="monospace" fontWeight="bold">
                    ZONE GAMMA (RIDGE WILDERNESS TENTS) {showOccupancyHeatmap && `— ${zd.occupancyPercent}% OCCUPIED (${zd.saturationLabel.toUpperCase()})`}
                  </text>
                  {showOccupancyHeatmap && showDensityContourRings && isHot && (
                    <ellipse cx="770" cy="460" rx="160" ry="75" fill="none" stroke={zd.colorHex} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" className="animate-pulse" />
                  )}
                </g>
              );
            })()}

            {/* ZONE 4: Zone Delta (Moonlit Geodesic Glade) */}
            {(() => {
              const zd = zoneDensities['Zone Delta (Glade)'];
              const isHot = zd && zd.occupancyPercent >= 75;
              return (
                <g>
                  <rect 
                    x="580" 
                    y="80" 
                    width="380" 
                    height="220" 
                    rx="16" 
                    fill={showOccupancyHeatmap ? `url(#${zd.radialGradientId})` : "#3b0764"} 
                    fillOpacity={showOccupancyHeatmap ? 1 : 0.2} 
                    stroke={showOccupancyHeatmap ? zd.colorHex : "#581c87"} 
                    strokeWidth={showOccupancyHeatmap ? (isHot ? 2.5 : 1.5) : 1} 
                    strokeDasharray={showOccupancyHeatmap ? (isHot ? "none" : "4 4") : "4 4"} 
                  />
                  <text x="595" y="105" fill={showOccupancyHeatmap ? zd.colorHex : "#c084fc"} fontSize="11" fontFamily="monospace" fontWeight="bold">
                    ZONE DELTA (MOONLIT GEODESIC GLADE) {showOccupancyHeatmap && `— ${zd.occupancyPercent}% OCCUPIED (${zd.saturationLabel.toUpperCase()})`}
                  </text>
                  {showOccupancyHeatmap && showDensityContourRings && isHot && (
                    <ellipse cx="770" cy="190" rx="160" ry="85" fill="none" stroke={zd.colorHex} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" className="animate-pulse" />
                  )}
                </g>
              );
            })()}

            {/* SPATIAL POINT HEAT EMITTERS (Individual Campsite Gaussian Blobs) */}
            {showOccupancyHeatmap && showPointEmitters && (
              <g id="heatmap-point-emitters-layer" filter="url(#occupancyHeatmapBlur)">
                {sites.map((site) => {
                  const cx = (site.coordinates.x / 100) * 1000;
                  const cy = (site.coordinates.y / 100) * 600;
                  const { color, radius, fillOpacity } = getSiteHeatEmitterParams(site);

                  return (
                    <circle
                      key={`heat-blob-${site.id}`}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={color}
                      fillOpacity={fillOpacity}
                    />
                  );
                })}
              </g>
            )}

            {/* North Entrance Boom Gate Node */}
            <g transform="translate(500, 30)">
              <circle cx="0" cy="0" r="16" fill="#0c0a09" stroke="#d97706" strokeWidth="2" />
              <rect x="-12" y="-3" width="24" height="6" fill="#fbbf24" rx="2" />
              <text x="0" y="24" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">NORTH BOOM GATE</text>
            </g>

            {/* Utility Microgrid Solar Farm Node */}
            {showUtilities && (
              <g transform="translate(500, 200)">
                <rect x="-24" y="-16" width="48" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M -20,-10 L 20,-10 M -20,0 L 20,0 M -20,10 L 20,10 M -7,-16 L -7,16 M 7,-16 L 7,16" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                <text x="0" y="26" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">SOLAR MICROGRID (42.8 kW)</text>
              </g>
            )}

            {/* Starlink Mesh Tower Node */}
            {showUtilities && (
              <g transform="translate(860, 50)">
                <circle cx="0" cy="0" r="12" fill="#0c0a09" stroke="#a855f7" strokeWidth="1.5" />
                <path d="M -5,-5 L 0,0 L 5,-5 M 0,0 L 0,6" stroke="#a855f7" strokeWidth="1.5" />
                <text x="0" y="20" fill="#a855f7" fontSize="8" fontFamily="monospace" textAnchor="middle">STARLINK MESH #1</text>
              </g>
            )}

            {/* Animated Ranger Patrol Unit Beacons */}
            {showRangers && (
              <>
                <g transform="translate(320, 280)">
                  <circle cx="0" cy="0" r="14" fill="#e11d48" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="0" cy="0" r="7" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="-12" fill="#fda4af" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">RANGER-1 (QUAD)</text>
                </g>

                <g transform="translate(740, 480)">
                  <circle cx="0" cy="0" r="14" fill="#e11d48" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="0" cy="0" r="7" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="0" y="-12" fill="#fda4af" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">RANGER-2 (RIDGE)</text>
                </g>
              </>
            )}

            {/* Dynamic Interactive Campsites */}
            {filteredSites.map((site) => {
              const cx = (site.coordinates.x / 100) * 1000;
              const cy = (site.coordinates.y / 100) * 600;
              const statusColor = getStatusColor(site.status);
              const isSelected = selectedSite?.id === site.id;
              const isHovered = hoveredSite?.id === site.id;

              return (
                <g
                  key={site.id}
                  transform={`translate(${cx}, ${cy})`}
                  onClick={() => handleSiteClick(site)}
                  onMouseEnter={() => setHoveredSite(site)}
                  onMouseLeave={() => setHoveredSite(null)}
                  className="cursor-pointer transition-transform hover:scale-125"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle cx="0" cy="0" r="24" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" className="animate-spin" />
                  )}

                  {/* Outer Pulsing Halo for active high draw or occupied hotspot */}
                  {(site.status === 'occupied' || site.powerDrawWatts > 2000) && (
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={isHovered ? 22 : 18} 
                      fill={statusColor} 
                      fillOpacity={site.status === 'occupied' ? 0.25 : 0.15} 
                      className={site.status === 'occupied' ? 'animate-pulse' : ''}
                    />
                  )}

                  {/* Site Base Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered ? 17 : 15}
                    fill="#09090b"
                    stroke={statusColor}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                  />

                  {/* Site Number Text */}
                  <text
                    x="0"
                    y="4"
                    fill="#f5f5f4"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {site.number}
                  </text>

                  {/* Micro Power Draw Badge */}
                  {site.powerDrawWatts > 0 && (
                    <g transform="translate(12, -10)">
                      <rect x="-2" y="-6" width="22" height="11" rx="3" fill="#1c1917" stroke="#44403c" strokeWidth="0.5" />
                      <text x="9" y="2" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">
                        {(site.powerDrawWatts / 1000).toFixed(1)}k
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          </svg>

        </div>

      </div>

      {/* Selected Site Telemetry & Control Drawer */}
      {selectedSite && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl text-stone-950 shadow-md"
                style={{ backgroundColor: getStatusColor(selectedSite.status) }}
              >
                {selectedSite.number}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">{selectedSite.zone}</span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold"
                    style={{ 
                      backgroundColor: `${getStatusColor(selectedSite.status)}20`,
                      color: getStatusColor(selectedSite.status)
                    }}
                  >
                    {selectedSite.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-100">{selectedSite.name}</h3>
              </div>
            </div>

            <button
              onClick={() => setSelectedSite(null)}
              className="text-stone-400 hover:text-stone-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80">
              <div className="text-xs text-stone-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Pedestal Load</span>
              </div>
              <div className="text-base font-bold font-mono text-stone-100 mt-0.5">
                {selectedSite.powerDrawWatts} W
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80">
              <div className="text-xs text-stone-400 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-teal-400" />
                <span>Water Flow</span>
              </div>
              <div className="text-base font-bold font-mono text-stone-100 mt-0.5">
                {selectedSite.waterFlowGpm} GPM
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80">
              <div className="text-xs text-stone-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Smart Lock PIN</span>
              </div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {selectedSite.smartLockCode}
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80">
              <div className="text-xs text-stone-400">Nightly Yield Rate</div>
              <div className="text-base font-bold font-mono text-stone-100 mt-0.5">
                ${selectedSite.pricePerNight} / night
              </div>
            </div>
          </div>

          {/* Guest Details if Occupied */}
          {selectedSite.currentGuestName && (
            <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-stone-400">Active Boarding Pass Guest:</span>
                <div className="text-sm font-bold text-amber-300">{selectedSite.currentGuestName}</div>
              </div>
              <span className="text-xs font-mono text-stone-400">{selectedSite.currentPassToken}</span>
            </div>
          )}

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
            <div className="text-xs font-mono text-stone-400">
              Campsite Capacity: <span className="text-stone-200 font-bold">{selectedSite.maxOccupancy} Guests</span>
            </div>

            <button
              onClick={() => handleToggleSiteStatus(selectedSite.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors shadow-sm"
            >
              Cycle Status ({selectedSite.status === 'occupied' ? 'Mark Clean Needed' : selectedSite.status === 'cleaning_needed' ? 'Mark Available' : 'Mark Occupied'})
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

