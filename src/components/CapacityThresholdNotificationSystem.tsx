import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Users, 
  Droplets, 
  BatteryCharging, 
  Radio, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  SlidersHorizontal,
  Flame,
  Check,
  RotateCcw
} from 'lucide-react';
import { 
  CampSite, 
  EnergyTelemetry, 
  WeatherHazard, 
  AutonomousExecutiveLog, 
  CapacityThresholdConfig, 
  ResourceCapacityAlert 
} from '../types';
import { StorageService, DEFAULT_CAPACITY_THRESHOLDS } from '../services/storage';

interface CapacityThresholdNotificationSystemProps {
  sites: CampSite[];
  energy: EnergyTelemetry;
  weather: WeatherHazard;
  onAddLog: (log: Omit<AutonomousExecutiveLog, 'id'>) => void;
  onNavigateToForecast?: () => void;
}

export const CapacityThresholdNotificationSystem: React.FC<CapacityThresholdNotificationSystemProps> = ({
  sites,
  energy,
  weather,
  onAddLog,
  onNavigateToForecast
}) => {
  // Threshold Configuration State
  const [thresholds, setThresholds] = useState<CapacityThresholdConfig>(() => {
    return StorageService.getCapacityThresholds();
  });

  // Alerts State
  const [alerts, setAlerts] = useState<ResourceCapacityAlert[]>(() => {
    return StorageService.getCapacityAlerts();
  });

  // UI Control states
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'warning'>('all');
  const [filterResource, setFilterResource] = useState<'all' | 'power' | 'occupancy' | 'water' | 'ev_charging' | 'mesh_network'>('all');
  const [executingRemediationId, setExecutingRemediationId] = useState<string | null>(null);
  const [bannerDismissedIds, setBannerDismissedIds] = useState<string[]>([]);
  const [lastAudioAlertTime, setLastAudioAlertTime] = useState<number>(0);

  // Audio Context for synthetic telemetry alarm chime
  const playAlarmChime = (severity: 'critical' | 'high' | 'warning') => {
    if (!thresholds.soundAlerts) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = severity === 'critical' ? 880 : severity === 'high' ? 660 : 520;
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.15);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Evaluate Forecast & Predict Capacity Exceedance
  const evaluatedForecastDays = useMemo(() => {
    const totalSitesCount = sites.length || 10;
    const currentlyOccupiedCount = sites.filter(s => s.status === 'occupied').length;
    const currentOccupancyPercent = Math.round((currentlyOccupiedCount / totalSitesCount) * 100);
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(now);
      dateObj.setDate(now.getDate() + i);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[dayOfWeek];
      const formattedDate = `${dayLabel} (${dateObj.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })})`;

      let baseOccupancyPercent = currentOccupancyPercent;
      if (isWeekend) {
        baseOccupancyPercent = Math.min(100, Math.round(baseOccupancyPercent * 1.35 + 12));
      } else if (i > 0) {
        baseOccupancyPercent = Math.max(35, Math.min(95, Math.round(baseOccupancyPercent * (0.88 + (i % 3) * 0.04))));
      }

      const predictedOccupiedSites = Math.round((baseOccupancyPercent / 100) * totalSitesCount);
      const predictedGuests = predictedOccupiedSites * 2.8;

      const evLoadKw = isWeekend ? 14.5 : 7.2;
      const peakPowerKw = Number((12.5 + (predictedOccupiedSites * 2.4 * 0.8) + evLoadKw).toFixed(1));
      const waterDemandLiters = Math.round(predictedGuests * 165 + 650);
      const reservoirLevelProjected = Math.min(100, Math.max(25, Math.round(energy.waterReservoirLevelPercent - (i * (waterDemandLiters / 8000) * 12) + (i % 2 === 0 ? 12 : 0))));
      const meshPacketsThousand = Number(((predictedOccupiedSites * 4.2) + 18).toFixed(1));

      days.push({
        index: i,
        dayLabel,
        formattedDate,
        isWeekend,
        occupancyPercent: baseOccupancyPercent,
        occupiedSites: predictedOccupiedSites,
        guestHeadcount: Math.round(predictedGuests),
        peakPowerKw,
        evLoadKw,
        waterDemandLiters,
        reservoirLevelPercent: reservoirLevelProjected,
        meshPacketsThousand
      });
    }

    return days;
  }, [sites, energy]);

  // Real-time Threshold Scanner Engine
  useEffect(() => {
    const generatedAlerts: ResourceCapacityAlert[] = [];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    evaluatedForecastDays.forEach(day => {
      // 1. Power Threshold Exceedance Check
      if (day.peakPowerKw > thresholds.maxPeakPowerKw) {
        const excess = Number((day.peakPowerKw - thresholds.maxPeakPowerKw).toFixed(1));
        const isCritical = day.peakPowerKw >= 39.0;
        generatedAlerts.push({
          id: `alert-power-${day.index}-${Math.round(day.peakPowerKw)}`,
          timestamp,
          resourceType: 'power',
          severity: isCritical ? 'critical' : 'high',
          dayTarget: day.formattedDate,
          dayIndex: day.index,
          predictedValue: day.peakPowerKw,
          thresholdValue: thresholds.maxPeakPowerKw,
          unit: 'kW',
          headline: `Peak Microgrid Load Breach (+${excess} kW above threshold)`,
          details: `Predicted draw of ${day.peakPowerKw} kW on ${day.formattedDate} exceeds configured ceiling of ${thresholds.maxPeakPowerKw} kW. Inverter safety margin reduced.`,
          recommendedAction: 'Engage autonomous peak-shaving battery discharge & throttle EV chargers to 16A Eco mode.',
          actionPayloadKey: 'power_shedding',
          isAcknowledged: false,
          isRemediated: false
        });
      }

      // 2. Occupancy Surge Check
      if (day.occupancyPercent > thresholds.maxOccupancyPercent) {
        const excessPercent = day.occupancyPercent - thresholds.maxOccupancyPercent;
        generatedAlerts.push({
          id: `alert-occ-${day.index}-${day.occupancyPercent}`,
          timestamp,
          resourceType: 'occupancy',
          severity: day.occupancyPercent >= 95 ? 'critical' : 'high',
          dayTarget: day.formattedDate,
          dayIndex: day.index,
          predictedValue: day.occupancyPercent,
          thresholdValue: thresholds.maxOccupancyPercent,
          unit: '%',
          headline: `High Density Occupancy Surge (${day.occupancyPercent}%)`,
          details: `Projected campsite occupancy is ${excessPercent}% above the safe operational comfort threshold (${thresholds.maxOccupancyPercent}%). ${day.guestHeadcount} guests on site.`,
          recommendedAction: 'Lock secondary overflow allocations and schedule extra sanitation cycles for communal blocks.',
          actionPayloadKey: 'occupancy_overflow',
          isAcknowledged: false,
          isRemediated: false
        });
      }

      // 3. Water Reservoir Depletion Check
      if (day.reservoirLevelPercent < thresholds.minReservoirPercent) {
        const deficit = thresholds.minReservoirPercent - day.reservoirLevelPercent;
        generatedAlerts.push({
          id: `alert-water-${day.index}-${day.reservoirLevelPercent}`,
          timestamp,
          resourceType: 'water',
          severity: day.reservoirLevelPercent <= 25 ? 'critical' : 'warning',
          dayTarget: day.formattedDate,
          dayIndex: day.index,
          predictedValue: day.reservoirLevelPercent,
          thresholdValue: thresholds.minReservoirPercent,
          unit: '%',
          headline: `Freshwater Reserve Drop (${day.reservoirLevelPercent}% remaining)`,
          details: `Water storage drops ${deficit}% below safe reserve threshold (${thresholds.minReservoirPercent}%). Daily usage estimated at ${day.waterDemandLiters.toLocaleString()} L.`,
          recommendedAction: 'Trigger borehole automated transfer pump and enforce 4-minute shower timer advisory.',
          actionPayloadKey: 'water_pumping',
          isAcknowledged: false,
          isRemediated: false
        });
      }

      // 4. EV Charging Peak Load Check
      if (day.evLoadKw > thresholds.maxEvLoadKw) {
        generatedAlerts.push({
          id: `alert-ev-${day.index}-${Math.round(day.evLoadKw)}`,
          timestamp,
          resourceType: 'ev_charging',
          severity: 'warning',
          dayTarget: day.formattedDate,
          dayIndex: day.index,
          predictedValue: day.evLoadKw,
          thresholdValue: thresholds.maxEvLoadKw,
          unit: 'kW',
          headline: `EV Supercharger Demand Exceeds Limit (${day.evLoadKw} kW)`,
          details: `Simultaneous vehicle fast-charging draw on ${day.formattedDate} is projected above the ${thresholds.maxEvLoadKw} kW grid boundary.`,
          recommendedAction: 'Queue vehicle charging sequences via smart dynamic load balancing.',
          actionPayloadKey: 'ev_throttling',
          isAcknowledged: false,
          isRemediated: false
        });
      }
    });

    // Merge with persisted alerts to preserve remediation/acknowledgement statuses
    const existingAlertsMap = new Map<string, ResourceCapacityAlert>(alerts.map(a => [a.id, a]));
    let hasNewBreach = false;

    const merged = generatedAlerts.map(newA => {
      const existing = existingAlertsMap.get(newA.id);
      if (existing) {
        return { ...newA, isAcknowledged: existing.isAcknowledged, isRemediated: existing.isRemediated, remediationNote: existing.remediationNote };
      } else {
        hasNewBreach = true;
        return newA;
      }
    });

    // Sound chime if there is an unacknowledged critical/high breach and sound enabled
    const nowTime = Date.now();
    if (hasNewBreach && thresholds.soundAlerts && (nowTime - lastAudioAlertTime > 10000)) {
      const highestSev = merged.some(a => a.severity === 'critical') ? 'critical' : 'high';
      playAlarmChime(highestSev);
      setLastAudioAlertTime(nowTime);
    }

    // Auto-mitigation execution if configured
    if (thresholds.autoMitigate) {
      merged.forEach(alertItem => {
        if (!alertItem.isRemediated) {
          alertItem.isRemediated = true;
          alertItem.isAcknowledged = true;
          alertItem.remediationNote = `Autonomous Dragon-9 protocol executed: ${alertItem.recommendedAction}`;
          
          onAddLog({
            timestamp: new Date().toLocaleTimeString(),
            severity: 'mitigation',
            pillar: 'Node 2: Predictive Utility Grid',
            title: `AUTONOMOUS CAPACITY MITIGATION: ${alertItem.resourceType.toUpperCase()}`,
            description: `Predicted threshold breach on ${alertItem.dayTarget} (${alertItem.predictedValue}${alertItem.unit} vs limit ${alertItem.thresholdValue}${alertItem.unit}).`,
            actionTaken: alertItem.recommendedAction,
            autonomousAgent: 'Dragon-9 Core',
            status: 'completed'
          });
        }
      });
    }

    setAlerts(merged);
    StorageService.saveCapacityAlerts(merged);
  }, [evaluatedForecastDays, thresholds]);

  // Execute manual remediation
  const handleExecuteRemediation = (alertItem: ResourceCapacityAlert) => {
    setExecutingRemediationId(alertItem.id);

    setTimeout(() => {
      const note = `Operator manual remediation initiated: ${alertItem.recommendedAction}`;
      const updated = StorageService.remediateCapacityAlert(alertItem.id, note);
      setAlerts(updated);
      setExecutingRemediationId(null);

      onAddLog({
        timestamp: new Date().toLocaleTimeString(),
        severity: 'mitigation',
        pillar: 'Node 2: Predictive Utility Grid',
        title: `MANUAL CAPACITY REMEDIATION: ${alertItem.resourceType.toUpperCase()}`,
        description: `Operator resolved predicted breach for ${alertItem.dayTarget} (${alertItem.predictedValue}${alertItem.unit} vs limit ${alertItem.thresholdValue}${alertItem.unit}).`,
        actionTaken: alertItem.recommendedAction,
        autonomousAgent: 'Dragon-9 Core',
        status: 'completed'
      });
    }, 700);
  };

  const handleAcknowledge = (id: string) => {
    const updated = StorageService.acknowledgeCapacityAlert(id);
    setAlerts(updated);
  };

  const handleSaveThresholds = (updated: CapacityThresholdConfig) => {
    setThresholds(updated);
    StorageService.saveCapacityThresholds(updated);
    setIsConfigModalOpen(false);

    onAddLog({
      timestamp: new Date().toLocaleTimeString(),
      severity: 'decision',
      pillar: 'Node 2: Predictive Utility Grid',
      title: 'CAPACITY THRESHOLDS UPDATED',
      description: `Operator reconfigured predictive capacity alert limits. (Peak Power: ${updated.maxPeakPowerKw}kW, Max Occupancy: ${updated.maxOccupancyPercent}%, Reservoir: ${updated.minReservoirPercent}%).`,
      actionTaken: 'Real-time telemetry scan updated with new limits.',
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });
  };

  const handleSimulateTestSpike = () => {
    const testAlert: ResourceCapacityAlert = {
      id: `alert-test-spike-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resourceType: 'power',
      severity: 'critical',
      dayTarget: 'Today (Peak 18:00 Surge)',
      dayIndex: 0,
      predictedValue: 42.4,
      thresholdValue: thresholds.maxPeakPowerKw,
      unit: 'kW',
      headline: 'CRITICAL: Instant 42.4 kW Surge Detected',
      details: 'Dual EV Superchargers and 8 Pitch Heat Pumps fired simultaneously. Microgrid load is 8.4 kW above safety capacity.',
      recommendedAction: 'Trigger immediate 10kW battery discharge and throttle EV chargers.',
      actionPayloadKey: 'power_shedding',
      isAcknowledged: false,
      isRemediated: false
    };

    playAlarmChime('critical');
    const nextAlerts = [testAlert, ...alerts];
    setAlerts(nextAlerts);
    StorageService.saveCapacityAlerts(nextAlerts);
    setIsDrawerOpen(true);

    onAddLog({
      timestamp: new Date().toLocaleTimeString(),
      severity: 'emergency',
      pillar: 'Node 2: Predictive Utility Grid',
      title: 'TEST SIMULATION: INSTANT PEAK LOAD BREACH',
      description: 'Simulated 42.4 kW microgrid draw injected into real-time notification telemetry pipeline.',
      actionTaken: 'Alarm chime sounded. Notification flyout engaged for operator remediation.',
      autonomousAgent: 'Dragon-9 Core',
      status: 'monitoring'
    });
  };

  // Filtered alerts
  const activeUnremediatedAlerts = useMemo(() => {
    return alerts.filter(a => !a.isRemediated);
  }, [alerts]);

  const activeCriticalCount = activeUnremediatedAlerts.filter(a => a.severity === 'critical').length;
  const activeHighCount = activeUnremediatedAlerts.filter(a => a.severity === 'high').length;
  const activeWarningCount = activeUnremediatedAlerts.filter(a => a.severity === 'warning').length;

  const topActiveAlert = activeUnremediatedAlerts[0];
  const isTopBannerVisible = topActiveAlert && !bannerDismissedIds.includes(topActiveAlert.id);

  const displayedAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
      if (filterResource !== 'all' && a.resourceType !== filterResource) return false;
      return true;
    });
  }, [alerts, filterSeverity, filterResource]);

  return (
    <div id="capacity-threshold-notification-system" className="space-y-4">
      
      {/* 1. Real-Time Telemetry Threshold Status Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Status Indicator */}
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center relative shadow-inner ${
            activeCriticalCount > 0 
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse' 
              : activeHighCount > 0 
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' 
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}>
            {activeUnremediatedAlerts.length > 0 ? (
              <BellRing className="w-5 h-5 animate-bounce" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
            {activeUnremediatedAlerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-stone-950 font-mono font-black text-[10px] flex items-center justify-center shadow-md">
                {activeUnremediatedAlerts.length}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                activeCriticalCount > 0
                  ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                  : activeHighCount > 0
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
              }`}>
                {activeCriticalCount > 0 ? 'CRITICAL CAPACITY BREACH' : activeHighCount > 0 ? 'CAPACITY WARNINGS ACTIVE' : 'TELEMETRY NOMINAL'}
              </span>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                REAL-TIME NOTIFICATION ENGINE
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mt-0.5">
              <h3 className="text-sm font-bold text-stone-100">
                Predicted Resource Limits & Surge Watch
              </h3>
              <span className="text-xs text-stone-400">
                ({activeUnremediatedAlerts.length} pending, {alerts.filter(a => a.isRemediated).length} remediated)
              </span>
            </div>
          </div>
        </div>

        {/* Middle Quick Capacity Indicators */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-800">
          
          <div className="px-2.5 py-1.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>PEAK POWER</span>
              <Zap className="w-2.5 h-2.5 text-amber-400" />
            </div>
            <div className="text-xs font-mono font-bold text-stone-200">
              Limit: <span className="text-amber-400">{thresholds.maxPeakPowerKw} kW</span>
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>OCCUPANCY</span>
              <Users className="w-2.5 h-2.5 text-teal-400" />
            </div>
            <div className="text-xs font-mono font-bold text-stone-200">
              Limit: <span className="text-teal-400">{thresholds.maxOccupancyPercent}%</span>
            </div>
          </div>

          <div className="px-2.5 py-1.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>RESERVOIR</span>
              <Droplets className="w-2.5 h-2.5 text-blue-400" />
            </div>
            <div className="text-xs font-mono font-bold text-stone-200">
              Min: <span className="text-blue-400">{thresholds.minReservoirPercent}%</span>
            </div>
          </div>

          <div className="hidden sm:block px-2.5 py-1.5 bg-stone-950 rounded-xl border border-stone-800 space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>AUTO-MITIGATE</span>
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
            </div>
            <div className={`text-xs font-mono font-bold ${thresholds.autoMitigate ? 'text-emerald-400' : 'text-stone-400'}`}>
              {thresholds.autoMitigate ? 'ARMED (ON)' : 'MANUAL'}
            </div>
          </div>

        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 self-end lg:self-center">
          
          <button
            id="btn-capacity-sound-toggle"
            onClick={() => handleSaveThresholds({ ...thresholds, soundAlerts: !thresholds.soundAlerts })}
            className={`p-2 rounded-xl text-xs font-bold border transition-all ${
              thresholds.soundAlerts 
                ? 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-750' 
                : 'bg-stone-950 text-stone-500 border-stone-800 hover:text-stone-300'
            }`}
            title={thresholds.soundAlerts ? 'Sound alarms enabled' : 'Sound alarms muted'}
          >
            {thresholds.soundAlerts ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="btn-open-capacity-config"
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>Set Thresholds</span>
          </button>

          <button
            id="btn-open-capacity-alerts-drawer"
            onClick={() => setIsDrawerOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
              activeUnremediatedAlerts.length > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-black'
                : 'bg-teal-600 hover:bg-teal-500 text-white font-bold'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts Feed ({activeUnremediatedAlerts.length})</span>
          </button>

        </div>

      </div>

      {/* 2. Urgent Live Banner Alert if an unremediated breach exists */}
      {isTopBannerVisible && topActiveAlert && (
        <div className={`p-4 rounded-2xl border transition-all animate-fadeIn flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl ${
          topActiveAlert.severity === 'critical'
            ? 'bg-rose-950/70 border-rose-500/50 text-rose-100'
            : topActiveAlert.severity === 'high'
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-100'
              : 'bg-stone-900 border-stone-700 text-stone-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl mt-0.5 ${
              topActiveAlert.severity === 'critical' ? 'bg-rose-500 text-stone-950' : 'bg-amber-500 text-stone-950'
            }`}>
              <AlertTriangle className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  {topActiveAlert.dayTarget}
                </span>
                <span className="text-xs font-mono font-bold">
                  {topActiveAlert.predictedValue} {topActiveAlert.unit} (Limit: {topActiveAlert.thresholdValue} {topActiveAlert.unit})
                </span>
              </div>
              <h4 className="text-sm font-black mt-0.5 tracking-tight">
                {topActiveAlert.headline}
              </h4>
              <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                {topActiveAlert.details}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
            <button
              id={`btn-remediate-banner-${topActiveAlert.id}`}
              onClick={() => handleExecuteRemediation(topActiveAlert)}
              disabled={executingRemediationId === topActiveAlert.id}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-stone-100 hover:bg-white text-stone-950 shadow-md transition-all flex items-center space-x-1.5"
            >
              {executingRemediationId === topActiveAlert.id ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mitigating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Auto-Mitigate Now</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setBannerDismissedIds(prev => [...prev, topActiveAlert.id]);
                handleAcknowledge(topActiveAlert.id);
              }}
              className="p-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-stone-300 hover:text-white transition-all"
              title="Acknowledge and dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Alerts Feed Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                    Predicted Capacity Alerts & Notifications
                  </h3>
                  <p className="text-xs text-stone-400">
                    Real-time threshold engine continuously checking 7-day utility models
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSimulateTestSpike}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/30 transition-all flex items-center space-x-1"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Simulate Spike</span>
                </button>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="p-4 border-b border-stone-800 bg-stone-950/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-mono uppercase text-stone-400 mr-1">Severity:</span>
                {(['all', 'critical', 'high', 'warning'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      filterSeverity === sev
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-mono uppercase text-stone-400 mr-1">Resource:</span>
                {(['all', 'power', 'occupancy', 'water', 'ev_charging'] as const).map(res => (
                  <button
                    key={res}
                    onClick={() => setFilterResource(res as typeof filterResource)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      filterResource === res
                        ? 'bg-amber-600 text-stone-950 font-black shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {res.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts List Container */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
              {displayedAlerts.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-stone-200">All Systems Nominal</h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    No resource capacity breaches matching active filter criteria. All projected loads remain within defined safety envelopes.
                  </p>
                </div>
              ) : (
                displayedAlerts.map(alertItem => (
                  <div
                    key={alertItem.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      alertItem.isRemediated 
                        ? 'bg-stone-950/40 border-stone-800/80 opacity-75' 
                        : alertItem.severity === 'critical'
                          ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/20'
                          : alertItem.severity === 'high'
                            ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/20'
                            : 'bg-stone-800/40 border-stone-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          alertItem.severity === 'critical'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                            : alertItem.severity === 'high'
                              ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                              : 'bg-stone-800 text-stone-300 border-stone-700'
                        }`}>
                          {alertItem.severity}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-900 text-stone-300 border border-stone-800">
                          {alertItem.dayTarget}
                        </span>

                        <span className="text-[10px] font-mono text-stone-400">
                          {alertItem.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {alertItem.isRemediated ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Remediated</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Headline & Details */}
                    <div>
                      <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                        {alertItem.headline}
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        {alertItem.details}
                      </p>
                    </div>

                    {/* Metric Exceedance Metric Bar */}
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-400">Forecast Value vs Defined Capacity:</span>
                        <span className="font-bold text-stone-200">
                          {alertItem.predictedValue} {alertItem.unit} / <span className="text-amber-400">{alertItem.thresholdValue} {alertItem.unit}</span>
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full ${alertItem.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, (alertItem.predictedValue / (alertItem.thresholdValue * 1.3)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Recommended Action & Action Trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-stone-800/60">
                      <div className="text-xs text-teal-400 font-mono flex items-start space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Recommended: {alertItem.recommendedAction}</span>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                        {!alertItem.isAcknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alertItem.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all"
                          >
                            Acknowledge
                          </button>
                        )}

                        {!alertItem.isRemediated && (
                          <button
                            id={`btn-remediate-alert-${alertItem.id}`}
                            onClick={() => handleExecuteRemediation(alertItem)}
                            disabled={executingRemediationId === alertItem.id}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all flex items-center space-x-1"
                          >
                            {executingRemediationId === alertItem.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Executing...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                                <span>Execute Protocol</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {alertItem.remediationNote && (
                      <div className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
                        {alertItem.remediationNote}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
              <button
                onClick={() => {
                  StorageService.clearAllCapacityAlerts();
                  setAlerts([]);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-200 hover:bg-stone-850 transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Alert History</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-100 transition-all"
              >
                Close Feed
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Threshold Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    Configure Capacity Thresholds
                  </h3>
                  <p className="text-xs text-stone-400">
                    Define predictive limits that trigger real-time operator warnings & autonomous shedding
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Threshold Sliders Form */}
            <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
              
              {/* Preset Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 font-mono uppercase">
                  Quick Scenario Presets:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setThresholds({
                      maxPeakPowerKw: 30.0,
                      maxOccupancyPercent: 75,
                      minReservoirPercent: 50,
                      maxEvLoadKw: 8.0,
                      maxDailyWaterLiters: 7500,
                      maxMeshPacketsDaily: 35.0,
                      autoMitigate: true,
                      soundAlerts: true
                    })}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-stone-300 transition-all text-left"
                  >
                    <div className="font-bold text-teal-400">Conservative</div>
                    <div className="text-[10px] text-stone-400">Early warning (30kW)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThresholds(DEFAULT_CAPACITY_THRESHOLDS)}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-amber-500/30 text-xs font-bold text-stone-300 transition-all text-left"
                  >
                    <div className="font-bold text-amber-400">Standard Grid</div>
                    <div className="text-[10px] text-stone-400">Balanced (34kW / 85%)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThresholds({
                      maxPeakPowerKw: 38.0,
                      maxOccupancyPercent: 95,
                      minReservoirPercent: 25,
                      maxEvLoadKw: 18.0,
                      maxDailyWaterLiters: 12000,
                      maxMeshPacketsDaily: 60.0,
                      autoMitigate: true,
                      soundAlerts: true
                    })}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-stone-300 transition-all text-left"
                  >
                    <div className="font-bold text-purple-400">Peak Surge (Holiday)</div>
                    <div className="text-[10px] text-stone-400">Max headroom (38kW)</div>
                  </button>
                </div>
              </div>

              {/* Slider 1: Power Peak (kW) */}
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-stone-200">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Peak Power Inverter Warning Threshold</span>
                  </span>
                  <span className="font-mono text-amber-400 text-sm font-black">
                    {thresholds.maxPeakPowerKw} kW
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="45"
                  step="0.5"
                  value={thresholds.maxPeakPowerKw}
                  onChange={e => setThresholds(prev => ({ ...prev, maxPeakPowerKw: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>20 kW (Strict)</span>
                  <span>34 kW (Default)</span>
                  <span>45 kW (Inverter Max Safety Cap)</span>
                </div>
              </div>

              {/* Slider 2: Occupancy (%) */}
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-stone-200">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Max Campground Occupancy Ceiling</span>
                  </span>
                  <span className="font-mono text-teal-400 text-sm font-black">
                    {thresholds.maxOccupancyPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  step="5"
                  value={thresholds.maxOccupancyPercent}
                  onChange={e => setThresholds(prev => ({ ...prev, maxOccupancyPercent: parseInt(e.target.value) }))}
                  className="w-full accent-teal-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>60%</span>
                  <span>85% (Optimal Density)</span>
                  <span>100% (Fully Booked)</span>
                </div>
              </div>

              {/* Slider 3: Freshwater Reservoir Min (%) */}
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-stone-200">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span>Minimum Freshwater Reservoir Reserve</span>
                  </span>
                  <span className="font-mono text-blue-400 text-sm font-black">
                    {thresholds.minReservoirPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={thresholds.minReservoirPercent}
                  onChange={e => setThresholds(prev => ({ ...prev, minReservoirPercent: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>20% (Emergency Buffer)</span>
                  <span>40% (Default Safe Floor)</span>
                  <span>60% (High Reserve)</span>
                </div>
              </div>

              {/* Slider 4: EV Charging Peak (kW) */}
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-stone-200">
                    <BatteryCharging className="w-4 h-4 text-purple-400" />
                    <span>EV Supercharger Peak Load Warning</span>
                  </span>
                  <span className="font-mono text-purple-400 text-sm font-black">
                    {thresholds.maxEvLoadKw} kW
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="25"
                  step="1"
                  value={thresholds.maxEvLoadKw}
                  onChange={e => setThresholds(prev => ({ ...prev, maxEvLoadKw: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>6 kW (Single 32A)</span>
                  <span>12 kW (Dual EV Fast)</span>
                  <span>25 kW (High Capacity Fleet)</span>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                <label className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between cursor-pointer hover:border-stone-700 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-200">Autonomous Mitigation</div>
                    <div className="text-[10px] text-stone-400">Auto-execute load shedding on breach</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={thresholds.autoMitigate}
                    onChange={e => setThresholds(prev => ({ ...prev, autoMitigate: e.target.checked }))}
                    className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                  />
                </label>

                <label className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between cursor-pointer hover:border-stone-700 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-200">Synthetic Alarm Chime</div>
                    <div className="text-[10px] text-stone-400">Audio alert on critical threshold trip</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={thresholds.soundAlerts}
                    onChange={e => setThresholds(prev => ({ ...prev, soundAlerts: e.target.checked }))}
                    className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                  />
                </label>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setThresholds(DEFAULT_CAPACITY_THRESHOLDS)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-200 hover:bg-stone-850 transition-all"
              >
                Reset to Defaults
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-save-capacity-thresholds"
                  onClick={() => handleSaveThresholds(thresholds)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all"
                >
                  Save & Apply Thresholds
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
