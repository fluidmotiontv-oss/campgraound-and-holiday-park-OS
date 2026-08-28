import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Droplets, 
  Users, 
  BatteryCharging, 
  Calendar, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Sun, 
  CloudRain, 
  Flame, 
  ArrowUpRight, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Radio, 
  ShieldAlert,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { CampSite, EnergyTelemetry, WeatherHazard, AutonomousExecutiveLog, CapacityThresholdConfig } from '../types';
import { StorageService } from '../services/storage';
import { PredictedOccupancyMiniMap } from './PredictedOccupancyMiniMap';

interface ResourceUsageForecastProps {
  sites: CampSite[];
  energy: EnergyTelemetry;
  weather: WeatherHazard;
  onAddLog?: (log: Omit<AutonomousExecutiveLog, 'id'>) => void;
  thresholds?: CapacityThresholdConfig;
}

export const ResourceUsageForecast: React.FC<ResourceUsageForecastProps> = ({
  sites,
  energy,
  weather,
  onAddLog,
  thresholds: propThresholds
}) => {
  // Configured Capacity Thresholds
  const thresholds = useMemo(() => {
    return propThresholds || StorageService.getCapacityThresholds();
  }, [propThresholds]);

  // View mode
  const [forecastViewMode, setForecastViewMode] = useState<'both' | 'spatial_minimap' | 'charts'>('both');

  // Scenario Modifiers
  const [weekendMultiplier, setWeekendMultiplier] = useState<number>(1.35); // 35% weekend jump
  const [heatwaveOffset, setHeatwaveOffset] = useState<number>(0); // +0 to +10 °C heatwave
  const [evChargingLoadLevel, setEvChargingLoadLevel] = useState<'standard' | 'high' | 'ultra'>('high');
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'power' | 'water' | 'occupancy' | 'mesh'>('all');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [recommendationApplied, setRecommendationApplied] = useState<{ [key: string]: boolean }>({});

  // Baseline calculation from current active sites
  const totalSitesCount = sites.length || 10;
  const currentlyOccupiedCount = sites.filter(s => s.status === 'occupied').length;
  const currentOccupancyPercent = Math.round((currentlyOccupiedCount / totalSitesCount) * 100);
  const currentTotalPowerKw = Number((sites.reduce((acc, s) => acc + s.powerDrawWatts, 0) / 1000).toFixed(1));
  const currentTotalWaterGpm = Number(sites.reduce((acc, s) => acc + s.waterFlowGpm, 0).toFixed(1));

  // Compute 7-day date series starting from today
  const forecastDays = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(now);
      dateObj.setDate(now.getDate() + i);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
      
      const formattedDate = dateObj.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[dayOfWeek];
      
      // Calculate realistic occupancy based on current baseline + weekend surges + random variance
      let baseOccupancyPercent = currentOccupancyPercent;
      if (isWeekend) {
        baseOccupancyPercent = Math.min(100, Math.round(baseOccupancyPercent * weekendMultiplier + 10));
      } else if (i > 0) {
        baseOccupancyPercent = Math.max(30, Math.min(95, Math.round(baseOccupancyPercent * (0.85 + (i % 3) * 0.05))));
      }
      
      const predictedOccupiedSites = Math.round((baseOccupancyPercent / 100) * totalSitesCount);
      const predictedGuests = predictedOccupiedSites * 2.8; // avg 2.8 guests per pitch
      
      // Weather factor
      const tempFactor = 1 + (heatwaveOffset * 0.04);
      const solarCondition = (i === 2 || i === 5) ? 'Partly Cloudy' : (i === 4) ? 'Coastal Mist' : 'Sunny & Clear';
      const solarEfficiency = (i === 2 || i === 5) ? 0.75 : (i === 4) ? 0.6 : 1.0;
      
      // Solar generation prediction (kW peak & kWh/day)
      const baseSolarCapacity = energy.solarGenerationKw > 0 ? energy.solarGenerationKw : 28.5;
      const predictedSolarKwh = Math.round(baseSolarCapacity * 6.8 * solarEfficiency);
      
      // Power Consumption: Base infrastructure (12kW) + Occupancy power + Heatwave AC + EV
      const evModifierKw = evChargingLoadLevel === 'ultra' ? 18 : evChargingLoadLevel === 'high' ? 10 : 4;
      const powerPerSiteKw = 2.4 * tempFactor;
      const predictedDailyPowerKwh = Math.round((14 + (predictedOccupiedSites * powerPerSiteKw) + (isWeekend ? evModifierKw : evModifierKw * 0.5)) * 24 * 0.65);
      const peakPowerKw = Number((12 + (predictedOccupiedSites * powerPerSiteKw * 0.8) + evModifierKw).toFixed(1));
      
      // Water Usage: ~160 Liters per guest/day + hot showers + heatwave modifier
      const waterPerGuestLiters = 160 * (1 + heatwaveOffset * 0.06);
      const predictedWaterLiters = Math.round(predictedGuests * waterPerGuestLiters + 600); // 600L communal cleaning
      const predictedPeakWaterGpm = Number((3.5 + (predictedGuests * 0.45)).toFixed(1));
      
      // Waste / Greywater: ~85% of freshwater becomes greywater
      const predictedGreywaterLiters = Math.round(predictedWaterLiters * 0.86);
      const reservoirLevelProjected = Math.min(100, Math.max(30, Math.round(energy.waterReservoirLevelPercent - (i * (predictedWaterLiters / 8000) * 12) + (i % 2 === 0 ? 15 : 0))));
      
      // IoT & Mesh Packets: ~4,200 packets per site/day
      const meshPacketsThousand = Number(((predictedOccupiedSites * 4.2) + 18).toFixed(1));
      const starlinkBandwidthGb = Math.round(predictedGuests * 3.4 + 25);

      // Risk score (0-100)
      let riskLevel: 'low' | 'moderate' | 'high' = 'low';
      let riskReason = 'Within safe microgrid thresholds';
      if (peakPowerKw > 38 || baseOccupancyPercent >= 90) {
        riskLevel = 'high';
        riskReason = 'Peak load approaching 40kW inverter safety limit';
      } else if (peakPowerKw > 30 || baseOccupancyPercent >= 75) {
        riskLevel = 'moderate';
        riskReason = 'Elevated weekend utility demand';
      }

      days.push({
        index: i,
        dateFormatted: formattedDate,
        dayLabel,
        fullDayName: fullDayNames[dayOfWeek],
        isWeekend,
        occupancyPercent: baseOccupancyPercent,
        occupiedSites: predictedOccupiedSites,
        totalSites: totalSitesCount,
        guestHeadcount: Math.round(predictedGuests),
        solarCondition,
        solarKwh: predictedSolarKwh,
        powerDemandKwh: predictedDailyPowerKwh,
        peakPowerKw,
        waterDemandLiters: predictedWaterLiters,
        peakWaterGpm: predictedPeakWaterGpm,
        greywaterLiters: predictedGreywaterLiters,
        reservoirLevelPercent: reservoirLevelProjected,
        meshPacketsThousand,
        starlinkBandwidthGb,
        riskLevel,
        riskReason
      });
    }

    return days;
  }, [sites, energy, weekendMultiplier, heatwaveOffset, evChargingLoadLevel, currentOccupancyPercent, totalSitesCount]);

  const selectedDay = forecastDays[selectedDayIndex] || forecastDays[0];

  // 7-day Totals & Averages
  const sevenDayStats = useMemo(() => {
    const totalPowerKwh = forecastDays.reduce((acc, d) => acc + d.powerDemandKwh, 0);
    const totalSolarKwh = forecastDays.reduce((acc, d) => acc + d.solarKwh, 0);
    const totalWaterLiters = forecastDays.reduce((acc, d) => acc + d.waterDemandLiters, 0);
    const avgOccupancy = Math.round(forecastDays.reduce((acc, d) => acc + d.occupancyPercent, 0) / 7);
    const peakPowerObserved = Math.max(...forecastDays.map(d => d.peakPowerKw));
    const netGridDependenceKwh = Math.max(0, totalPowerKwh - totalSolarKwh);
    const solarCoveragePercent = Math.min(100, Math.round((totalSolarKwh / totalPowerKwh) * 100));

    return {
      totalPowerKwh,
      totalSolarKwh,
      totalWaterLiters,
      avgOccupancy,
      peakPowerObserved,
      netGridDependenceKwh,
      solarCoveragePercent
    };
  }, [forecastDays]);

  const handleApplyRecommendation = (id: string, title: string, action: string) => {
    setRecommendationApplied(prev => ({ ...prev, [id]: true }));
    if (onAddLog) {
      onAddLog({
        timestamp: new Date().toLocaleTimeString(),
        severity: 'optimization',
        pillar: 'Node 2: Predictive Utility Grid',
        title: `PREDICTIVE OPTIMIZATION APPLIED: ${title}`,
        description: `Autonomous schedule adjusted based on 7-day resource demand forecast.`,
        actionTaken: action,
        autonomousAgent: 'Dragon-9 Core',
        status: 'completed'
      });
    }
  };

  return (
    <div id="resource-usage-forecast-module" className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 animate-fadeIn">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                DRAGON 9 PREDICTIVE AI
              </span>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                7-DAY EDGE FORECAST ENGINE
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-100 tracking-tight flex items-center gap-2">
              Resource & Utility Demand Forecast
            </h2>
          </div>
        </div>

        {/* Action / Metric View Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Spatial Heatmap vs Time-Series Switcher */}
          <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center space-x-1">
            <button
              id="viewmode-both"
              onClick={() => setForecastViewMode('both')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                forecastViewMode === 'both'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Unified Dashboard
            </button>
            <button
              id="viewmode-spatial"
              onClick={() => setForecastViewMode('spatial_minimap')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                forecastViewMode === 'spatial_minimap'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Spatial Heatmap</span>
            </button>
            <button
              id="viewmode-charts"
              onClick={() => setForecastViewMode('charts')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                forecastViewMode === 'charts'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Time-Series Curves</span>
            </button>
          </div>

          <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveMetricTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'all'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All Utilities
            </button>
            <button
              onClick={() => setActiveMetricTab('power')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMetricTab === 'power'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Microgrid</span>
            </button>
            <button
              onClick={() => setActiveMetricTab('water')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMetricTab === 'water'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Droplets className="w-3 h-3" />
              <span>Water</span>
            </button>
            <button
              onClick={() => setActiveMetricTab('occupancy')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMetricTab === 'occupancy'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Occupancy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 7-Day Cumulative KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        
        <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>AVG 7-DAY OCCUPANCY</span>
            <Users className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-100">
            {sevenDayStats.avgOccupancy}%
          </div>
          <div className="text-[10px] font-mono text-teal-400">
            {Math.round((sevenDayStats.avgOccupancy / 100) * totalSitesCount)} of {totalSitesCount} pitches avg
          </div>
        </div>

        <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>PROJECTED POWER</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            {sevenDayStats.totalPowerKwh.toLocaleString()} <span className="text-xs font-normal">kWh</span>
          </div>
          <div className="text-[10px] font-mono text-stone-400">
            Peak: <strong className="text-amber-300">{sevenDayStats.peakPowerObserved} kW</strong>
          </div>
        </div>

        <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>SOLAR HARVEST</span>
            <Sun className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {sevenDayStats.totalSolarKwh.toLocaleString()} <span className="text-xs font-normal">kWh</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-300">
            {sevenDayStats.solarCoveragePercent}% Solar Offset
          </div>
        </div>

        <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>WATER CONSUMPTION</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400">
            {Math.round(sevenDayStats.totalWaterLiters / 1000)}k <span className="text-xs font-normal">Liters</span>
          </div>
          <div className="text-[10px] font-mono text-stone-400">
            {sevenDayStats.totalWaterLiters.toLocaleString()} L total
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>MICROGRID HEALTH</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            AUTONOMOUS
          </div>
          <div className="text-[10px] font-mono text-stone-400">
            0 Blackout Risk
          </div>
        </div>

      </div>

      {/* Interactive Scenario Tuning Controls */}
      <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Interactive Scenario Simulator (What-If Analysis)</span>
          </div>
          <button
            onClick={() => {
              setWeekendMultiplier(1.35);
              setHeatwaveOffset(0);
              setEvChargingLoadLevel('high');
            }}
            className="text-[11px] font-mono text-stone-400 hover:text-stone-200 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          
          {/* Weekend Surge Slider */}
          <div className="space-y-1.5 bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-300">
              <span>Weekend Influx Modifier:</span>
              <strong className="text-amber-400">+{Math.round((weekendMultiplier - 1) * 100)}% Surge</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.8"
              step="0.05"
              value={weekendMultiplier}
              onChange={(e) => setWeekendMultiplier(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>Normal (1.0x)</span>
              <span>Holiday Peak (1.8x)</span>
            </div>
          </div>

          {/* Temperature / Heatwave Offset */}
          <div className="space-y-1.5 bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-300">
              <span>Summer Heatwave Offset:</span>
              <strong className={heatwaveOffset > 0 ? "text-rose-400" : "text-emerald-400"}>
                +{heatwaveOffset}°C {heatwaveOffset > 4 ? '(Severe)' : ''}
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={heatwaveOffset}
              onChange={(e) => setHeatwaveOffset(parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>Standard 22°C</span>
              <span>Heatwave 30°C+</span>
            </div>
          </div>

          {/* EV Charging Load Tier */}
          <div className="space-y-1.5 bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between text-stone-300">
              <span>EV Fast-Charger Load:</span>
              <strong className="text-teal-400 uppercase">{evChargingLoadLevel}</strong>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              {(['standard', 'high', 'ultra'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setEvChargingLoadLevel(tier)}
                  className={`py-1 text-[10px] font-bold rounded-lg uppercase transition-all ${
                    evChargingLoadLevel === tier
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-stone-400 text-center">
              {evChargingLoadLevel === 'ultra' ? '18kW Simultaneous DC Fast' : evChargingLoadLevel === 'high' ? '10kW Kiosk Draw' : '4kW Trickle Charging'}
            </div>
          </div>

        </div>
      </div>

      {/* Spatial Heatmap Mini-Map Section */}
      {(forecastViewMode === 'spatial_minimap' || forecastViewMode === 'both') && (
        <PredictedOccupancyMiniMap
          sites={sites}
          energy={energy}
          weather={weather}
          weekendMultiplier={weekendMultiplier}
          heatwaveOffset={heatwaveOffset}
          onSelectZone={(zoneName) => {
            if (onAddLog) {
              onAddLog({
                timestamp: new Date().toLocaleTimeString(),
                severity: 'info',
                pillar: 'Node 1: Grid Telemetry',
                title: `SPATIAL ZONE INSPECTED: ${zoneName}`,
                description: `Operator inspected 7-day predicted peak heat load and feeder capacity for ${zoneName}.`,
                actionTaken: 'Zone telemetry zoomed',
                autonomousAgent: 'Operator Interface',
                status: 'completed'
              });
            }
          }}
        />
      )}

      {/* Main Charts Area */}
      {(forecastViewMode === 'charts' || forecastViewMode === 'both') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>
                  {activeMetricTab === 'all' ? '7-Day Power Generation vs Consumption & Occupancy' :
                   activeMetricTab === 'power' ? 'Microgrid Power Demand & Solar Infeed (kWh/day)' :
                   activeMetricTab === 'water' ? 'Freshwater Consumption & Reservoir Reserve (L)' :
                   'Projected Pitch Occupancy & Headcount'}
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                Click any day bar to inspect detailed hourly dispatch breakdown
              </p>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Power (kWh)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Solar (kWh)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Occupancy %
              </span>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetricTab === 'water' ? (
                <AreaChart
                  data={forecastDays}
                  onClick={(e) => {
                    if (e && e.activeTooltipIndex !== undefined) {
                      setSelectedDayIndex(e.activeTooltipIndex);
                    }
                  }}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="greywaterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '12px', fontSize: '11px', color: '#f5f5f4' }} 
                  />
                  <Area type="monotone" dataKey="waterDemandLiters" name="Water Draw (Liters)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#waterGrad)" />
                  <Area type="monotone" dataKey="greywaterLiters" name="Greywater (Liters)" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#greywaterGrad)" />
                  <Line type="monotone" dataKey="reservoirLevelPercent" name="Reservoir %" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <ReferenceLine y={thresholds.minReservoirPercent} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Min Res (${thresholds.minReservoirPercent}%)`, fill: '#ef4444', fontSize: 10 }} />
                </AreaChart>
              ) : activeMetricTab === 'occupancy' ? (
                <BarChart
                  data={forecastDays}
                  onClick={(e) => {
                    if (e && e.activeTooltipIndex !== undefined) {
                      setSelectedDayIndex(e.activeTooltipIndex);
                    }
                  }}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '12px', fontSize: '11px', color: '#f5f5f4' }} 
                  />
                  <ReferenceLine y={thresholds.maxOccupancyPercent} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Occ Limit (${thresholds.maxOccupancyPercent}%)`, fill: '#f59e0b', fontSize: 10 }} />
                  <Bar dataKey="occupancyPercent" name="Occupancy %" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="guestHeadcount" name="Guest Headcount" stroke="#f59e0b" strokeWidth={2} />
                </BarChart>
              ) : (
                <ComposedChart
                  data={forecastDays}
                  onClick={(e) => {
                    if (e && e.activeTooltipIndex !== undefined) {
                      setSelectedDayIndex(e.activeTooltipIndex);
                    }
                  }}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '12px', fontSize: '11px', color: '#f5f5f4' }} 
                  />
                  <ReferenceLine y={thresholds.maxPeakPowerKw} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Power Limit (${thresholds.maxPeakPowerKw}kW)`, fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Hard Cap (40kW)', fill: '#ef4444', fontSize: 10 }} />
                  <Bar dataKey="powerDemandKwh" name="Power Demand (kWh)" fill="#d97706" radius={[6, 6, 0, 0]} />
                  <Area type="monotone" dataKey="solarKwh" name="Solar Gen (kWh)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#solarGrad)" />
                  <Line type="monotone" dataKey="occupancyPercent" name="Occupancy %" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* 7-Day Quick Selector Pills */}
          <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-stone-800/80">
            {forecastDays.map((d, idx) => {
              const isBreached = d.peakPowerKw > thresholds.maxPeakPowerKw || d.occupancyPercent > thresholds.maxOccupancyPercent || d.reservoirLevelPercent < thresholds.minReservoirPercent;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-2 rounded-xl text-center transition-all relative ${
                    selectedDayIndex === idx
                      ? 'bg-teal-600 text-white font-bold ring-2 ring-teal-400/50 shadow-md'
                      : isBreached
                        ? 'bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800'
                  }`}
                >
                  {isBreached && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                  <div className="text-[10px] font-mono uppercase">{d.dayLabel}</div>
                  <div className="text-xs font-black mt-0.5">{d.occupancyPercent}%</div>
                  <div className="text-[9px] font-mono opacity-80">{d.peakPowerKw}kW</div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Selected Day Deep Dive Inspection Card (1 Col) */}
        <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 space-y-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">DAY INSPECTOR</span>
                <h4 className="text-base font-black text-stone-100">{selectedDay.fullDayName} ({selectedDay.dateFormatted})</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                selectedDay.riskLevel === 'high' 
                  ? 'bg-rose-950 text-rose-300 border-rose-500/40' 
                  : selectedDay.riskLevel === 'moderate'
                  ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
              }`}>
                {selectedDay.riskLevel} Risk
              </span>
            </div>

            <div className="space-y-3 pt-3">
              
              {/* Occupancy Detail */}
              <div className="flex items-center justify-between p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 text-xs">
                <div className="flex items-center space-x-2 text-stone-300">
                  <Users className="w-4 h-4 text-teal-400" />
                  <span>Occupied Pitches</span>
                </div>
                <div className="font-mono font-bold text-stone-100">
                  {selectedDay.occupiedSites} / {selectedDay.totalSites} ({selectedDay.guestHeadcount} guests)
                </div>
              </div>

              {/* Peak Microgrid Power */}
              <div className="flex items-center justify-between p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 text-xs">
                <div className="flex items-center space-x-2 text-stone-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Peak Inverter Load</span>
                </div>
                <div className="font-mono font-bold text-amber-400">
                  {selectedDay.peakPowerKw} kW <span className="text-stone-400 font-normal">({selectedDay.powerDemandKwh} kWh/day)</span>
                </div>
              </div>

              {/* Solar Harvest */}
              <div className="flex items-center justify-between p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 text-xs">
                <div className="flex items-center space-x-2 text-stone-300">
                  <Sun className="w-4 h-4 text-emerald-400" />
                  <span>Solar Harvest</span>
                </div>
                <div className="font-mono font-bold text-emerald-400">
                  {selectedDay.solarKwh} kWh <span className="text-stone-400 font-normal">({selectedDay.solarCondition})</span>
                </div>
              </div>

              {/* Water Consumption */}
              <div className="flex items-center justify-between p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 text-xs">
                <div className="flex items-center space-x-2 text-stone-300">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Freshwater Draw</span>
                </div>
                <div className="font-mono font-bold text-cyan-400">
                  {selectedDay.waterDemandLiters.toLocaleString()} L <span className="text-stone-400 font-normal">({selectedDay.peakWaterGpm} GPM)</span>
                </div>
              </div>

              {/* LoRa IoT Traffic */}
              <div className="flex items-center justify-between p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 text-xs">
                <div className="flex items-center space-x-2 text-stone-300">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Mesh Telemetry</span>
                </div>
                <div className="font-mono font-bold text-purple-400">
                  {selectedDay.meshPacketsThousand}k packets <span className="text-stone-400 font-normal">({selectedDay.starlinkBandwidthGb} GB Starlink)</span>
                </div>
              </div>

            </div>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-[11px] font-mono text-stone-400">
            <span className="text-stone-300 font-bold">Status Assessment: </span>
            {selectedDay.riskReason}.
          </div>

        </div>

      </div>
      )}

      {/* Autonomous Dragon-9 Predictive Recommendations */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-100">
                Dragon 9 Autonomous Resource Recommendations
              </h3>
              <p className="text-xs text-stone-400">
                Pre-emptive optimizations derived from 7-day weather, tide, and site occupancy forecasts
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            AUTONOMOUS DISPATCH
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Recommendation 1: Battery Pre-Charge */}
          <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Pre-charge BESS Bank
                </span>
                <span className="text-[10px] font-mono text-stone-400">HIGH PRIORITY</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Saturday occupancy reaches {Math.max(...forecastDays.map(d => d.occupancyPercent))}%. Pre-charge microgrid battery reserves to 100% on Friday morning via excess solar.
              </p>
            </div>

            <button
              onClick={() => handleApplyRecommendation(
                'rec_battery_precharge', 
                'Pre-charge BESS Storage', 
                'Inverter profile updated: Set BESS bulk absorption window 08:00-14:00 Fri.'
              )}
              disabled={recommendationApplied['rec_battery_precharge']}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                recommendationApplied['rec_battery_precharge']
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
              }`}
            >
              {recommendationApplied['rec_battery_precharge'] ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scheduled in Inverter</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Arm Pre-Charge Schedule</span>
                </>
              )}
            </button>
          </div>

          {/* Recommendation 2: Water Reservoir Refill */}
          <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Stagger Wellhead Pumps
                </span>
                <span className="text-[10px] font-mono text-stone-400">OPTIMIZATION</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Predicted weekly demand is {Math.round(sevenDayStats.totalWaterLiters / 1000)}k Liters. Run borehole pumps during 11:00-15:00 peak solar irradiance to zero out pumping cost.
              </p>
            </div>

            <button
              onClick={() => handleApplyRecommendation(
                'rec_pump_stagger', 
                'Solar-Synchronized Water Pumping', 
                'Borehole pump relay GPIO_22 locked to solar yield > 14kW.'
              )}
              disabled={recommendationApplied['rec_pump_stagger']}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                recommendationApplied['rec_pump_stagger']
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
              }`}
            >
              {recommendationApplied['rec_pump_stagger'] ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solar Pump Sync Active</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enable Solar Pump Sync</span>
                </>
              )}
            </button>
          </div>

          {/* Recommendation 3: EV Charger Smart Shave */}
          <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  Smart EV Peak Shaving
                </span>
                <span className="text-[10px] font-mono text-stone-400">DYNAMIC SHEDDING</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Automatically throttle public EV pedestals from 22kW to 11kW if campground aggregate draw exceeds 34kW during evening meal prep (18:00-20:30).
              </p>
            </div>

            <button
              onClick={() => handleApplyRecommendation(
                'rec_ev_throttle', 
                'Dynamic EV Peak Shaving', 
                'Smart EV load throttle armed: Threshold 34kW on Phase A/B/C.'
              )}
              disabled={recommendationApplied['rec_ev_throttle']}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                recommendationApplied['rec_ev_throttle']
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {recommendationApplied['rec_ev_throttle'] ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EV Dynamic Throttle Armed</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Arm Dynamic Throttle</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
