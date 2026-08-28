import React, { useState } from 'react';
import { 
  DragonNode, 
  EnergyTelemetry, 
  WeatherHazard 
} from '../types';
import { 
  LayoutGrid, 
  Zap, 
  ShieldAlert, 
  KeySquare, 
  Sparkles, 
  Compass, 
  Flame, 
  PackageCheck, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Power,
  ChevronRight,
  Wifi,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { GeminiExecutiveService } from '../services/geminiClient';
import { StorageService } from '../services/storage';

interface DragonNineMatrixProps {
  nodes: DragonNode[];
  onUpdateNodes: (nodes: DragonNode[]) => void;
  energy: EnergyTelemetry;
  weather: WeatherHazard;
  onSelectNodeForDiagnosis: (node: DragonNode) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DragonNineMatrix: React.FC<DragonNineMatrixProps> = ({
  nodes,
  onUpdateNodes,
  energy,
  weather,
  onSelectNodeForDiagnosis,
  onNavigateToTab
}) => {
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'KeySquare': return <KeySquare className="w-5 h-5 text-blue-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-indigo-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'PackageCheck': return <PackageCheck className="w-5 h-5 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default: return <Activity className="w-5 h-5 text-stone-400" />;
    }
  };

  const handleAutonomousOptimization = async (node: DragonNode) => {
    setExecutingNodeId(node.id);
    setActionNotice(`Executing autonomous calibration routine for ${node.code}...`);

    try {
      const res = await GeminiExecutiveService.triggerAutomatedNodeAction(node.number, 'auto_heal');
      
      // Update node in state
      const updatedNodes = nodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            status: 'nominal' as const,
            healthScore: Math.min(100, n.healthScore + 3),
            lastAutonomousAction: res.outcome?.detail || 'Recalibrated telemetry vectors.',
            lastActionTimestamp: 'Just now'
          };
        }
        return n;
      });

      onUpdateNodes(updatedNodes);
      StorageService.saveDragonNodes(updatedNodes);

      StorageService.addLog({
        timestamp: new Date().toLocaleTimeString(),
        severity: 'optimization',
        pillar: `Node ${node.number}: ${node.name}`,
        title: res.outcome?.action || `Auto-Heal Executed on ${node.code}`,
        description: res.outcome?.detail || 'Recalibrated subsystems to optimal threshold.',
        actionTaken: 'Executed autonomous self-healing matrix sequence.',
        autonomousAgent: 'Dragon-9 Core',
        status: 'completed'
      });

      setActionNotice(`✅ ${node.code} autonomous optimization completed successfully.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error(e);
      setActionNotice(`Calibration finished locally for ${node.code}.`);
      setTimeout(() => setActionNotice(null), 3000);
    } finally {
      setExecutingNodeId(null);
    }
  };

  const filteredNodes = nodes.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'nominal') return n.status === 'nominal';
    if (activeFilter === 'critical') return n.status !== 'nominal';
    return true;
  });

  const avgHealth = Math.round(nodes.reduce((acc, n) => acc + n.healthScore, 0) / nodes.length);

  return (
    <section id="dragon-9-matrix-section" className="space-y-6">
      
      {/* Top Banner & KPI Strip */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        
        {/* Decorative Grid Mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DRAGON 9 OPERATIONAL MATRIX
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-400 font-mono">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                9/9 Nodes Online
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-100 tracking-tight">
              Campground & Holiday Park Autonomous Grid
            </h1>
            <p className="text-sm text-stone-400 max-w-2xl">
              Synthesized architecture unifying 9 core operational pillars, the Boarding Pass cryptographic protocol, and fluid real-time offline telemetry.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-400 font-medium">Matrix Health</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{avgHealth}%</div>
              <div className="text-[10px] text-emerald-500/80 font-mono">Autonomous Target Met</div>
            </div>

            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-400 font-medium">Solar Microgrid</div>
              <div className="text-xl font-bold font-mono text-amber-400">{energy.solarGenerationKw} kW</div>
              <div className="text-[10px] text-stone-400 font-mono">{energy.batteryStoragePercent}% Battery</div>
            </div>

            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-400 font-medium">Wildfire Index</div>
              <div className="text-xl font-bold font-mono text-orange-400">{weather.wildfireDangerIndex}</div>
              <div className="text-[10px] text-stone-400 font-mono">Wind: {weather.windSpeedMph} mph</div>
            </div>

            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 text-center">
              <div className="text-xs text-stone-400 font-medium">Boarding Passes</div>
              <div className="text-xl font-bold font-mono text-cyan-400">32 Active</div>
              <div className="text-[10px] text-cyan-500/80 font-mono">100% Cryptographic</div>
            </div>
          </div>

        </div>

        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono flex items-center justify-between animate-fadeIn">
            <span>{actionNotice}</span>
            <span className="text-[10px] text-emerald-400/80">LATENCY: 0.8s</span>
          </div>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Filter Nodes:</span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              activeFilter === 'all' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All 9 Nodes
          </button>
          <button
            onClick={() => setActiveFilter('nominal')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              activeFilter === 'nominal' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Nominal (9)
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateToTab('executive')}
            className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 border border-indigo-800/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Ask Gemini Executive</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The 9 Core Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredNodes.map((node) => {
          const isExecuting = executingNodeId === node.id;

          return (
            <div
              key={node.id}
              id={`dragon-node-card-${node.number}`}
              className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              {/* Header: Node Number, Code & Status */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {getIcon(node.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-stone-400">NODE 0{node.number}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                          {node.code}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-100 leading-snug mt-0.5">
                        {node.name}
                      </h3>
                    </div>
                  </div>

                  {/* Health Score Pill */}
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {node.healthScore}%
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">HEALTH</span>
                  </div>
                </div>

                <p className="text-xs text-stone-400 line-clamp-2 mb-4 leading-relaxed">
                  {node.description}
                </p>

                {/* Primary & Secondary Metrics Box */}
                <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-medium">{node.metricLabel}:</span>
                    <span className="text-xs font-mono font-bold text-stone-100">{node.metricValue}</span>
                  </div>
                  {node.secondaryMetric && (
                    <div className="flex items-center justify-between pt-1 border-t border-stone-900">
                      <span className="text-[11px] text-stone-500 font-mono">TELEMETRY:</span>
                      <span className="text-[11px] font-mono text-emerald-400/90">{node.secondaryMetric}</span>
                    </div>
                  )}
                </div>

                {/* Last Autonomous Action */}
                <div className="text-[11px] text-stone-400 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/50 mb-4">
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-1">
                    <span>AUTONOMOUS AGENT LOG</span>
                    <span>{node.lastActionTimestamp}</span>
                  </div>
                  <p className="italic text-stone-300 font-sans line-clamp-2">
                    "{node.lastAutonomousAction}"
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                <button
                  id={`btn-diagnose-${node.number}`}
                  onClick={() => onSelectNodeForDiagnosis(node)}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-stone-400" />
                  <span>Inspect Telemetry</span>
                </button>

                <button
                  id={`btn-heal-${node.number}`}
                  onClick={() => handleAutonomousOptimization(node)}
                  disabled={isExecuting}
                  title="Trigger autonomous node recalibration & self-healing"
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1.5 ${
                    isExecuting
                      ? 'bg-emerald-700 text-white cursor-wait'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'Heal...' : 'Auto-Heal'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
