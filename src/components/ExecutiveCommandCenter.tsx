import React, { useState } from 'react';
import { 
  AutonomousExecutiveLog, 
  DragonNode, 
  WeatherHazard, 
  EnergyTelemetry 
} from '../types';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Flame, 
  Zap, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  Play,
  ArrowRight
} from 'lucide-react';
import { GeminiExecutiveService, ExecutiveQueryResponse } from '../services/geminiClient';
import { StorageService } from '../services/storage';

interface ExecutiveCommandCenterProps {
  logs: AutonomousExecutiveLog[];
  onAddLog: (log: Omit<AutonomousExecutiveLog, 'id'>) => void;
  nodes: DragonNode[];
  weather: WeatherHazard;
  energy: EnergyTelemetry;
}

export const ExecutiveCommandCenter: React.FC<ExecutiveCommandCenterProps> = ({
  logs,
  onAddLog,
  nodes,
  weather,
  energy
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [aiSource, setAiSource] = useState<string>('gemini_3.7_flash');

  const presetDirectives = [
    {
      title: 'Run Full Dragon 9 Audit',
      prompt: 'Perform a comprehensive health and vulnerability audit across all 9 Dragon Framework nodes. Identify any microgrid or gate security bottlenecks.',
      pillar: 'General Executive Audit',
      icon: Cpu,
    },
    {
      title: 'Simulate Sudden 30mph Wind Storm',
      prompt: 'A sudden dry wind gust of 32 mph is detected on Ridge 3. Evaluate wildfire hazard indices, adjust campfire permit restrictions, and notify high-profile RV sites.',
      pillar: 'Node 7: Hazard & Weather',
      icon: Flame,
    },
    {
      title: 'Optimize Weekend RevPASH Yield',
      prompt: 'Analyze current 87.5% occupancy and demand velocity. Recommend dynamic rate adjustments for glamping domes and pull-through 50A pedestals for the upcoming weekend.',
      pillar: 'Node 9: Financial Ledger & Yield',
      icon: TrendingUp,
    },
    {
      title: 'Microgrid Solar Load Shedding',
      prompt: 'Solar microgrid output is at 42.8 kW. Calculate optimal load-shedding and thermal storage diversion to maximize off-grid battery longevity.',
      pillar: 'Node 2: Utility & Microgrid',
      icon: Zap,
    }
  ];

  const handleSendDirective = async (customPrompt?: string, pillarTarget?: string) => {
    const query = customPrompt || promptInput;
    if (!query.trim()) return;

    setIsThinking(true);
    setActiveAnalysis(null);

    try {
      const result: ExecutiveQueryResponse = await GeminiExecutiveService.queryExecutiveAI(
        query,
        pillarTarget || selectedPillar
      );

      setActiveAnalysis(result.response);
      setAiSource(result.source);

      // Record in logs
      onAddLog({
        timestamp: new Date().toLocaleTimeString(),
        severity: 'decision',
        pillar: result.pillarAffected || 'Gemini Executive Command',
        title: query.slice(0, 48) + '...',
        description: 'Autonomous AI Executive evaluation completed with actionable interventions.',
        actionTaken: 'Executed multi-node analysis & synchronized with telemetry edge bus.',
        autonomousAgent: 'Gemini Executive',
        status: 'completed'
      });

      setPromptInput('');
    } catch (error) {
      console.error(error);
      setActiveAnalysis('Autonomous fallback: Diagnostic completed across local node telemetry.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div id="executive-command-center" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-stone-900 to-stone-950 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                GEMINI 3.7 FLASH EXECUTIVE CORE
              </span>
              <span className="text-xs text-stone-400 font-mono">Autonomous Dispatch Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Campground Executive AI Command & Anomaly Engine
            </h2>
            <p className="text-xs text-stone-400 max-w-2xl mt-0.5">
              Direct the park's autonomous AI agent to analyze multi-node telemetry, simulate hazard contingencies, re-balance microgrid loads, and dispatch ranger resources.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-center">
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-stone-400 uppercase font-mono">Telemetry Nodes</div>
              <div className="text-lg font-bold font-mono text-indigo-400">9 Active</div>
            </div>
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-stone-400 uppercase font-mono">AI Agent Status</div>
              <div className="text-lg font-bold font-mono text-emerald-400">Autonomous</div>
            </div>
          </div>
        </div>

      </div>

      {/* Preset Directives Bar */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-semibold uppercase text-stone-400 tracking-wider">
          Quick Executive Directives:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetDirectives.map((directive, idx) => {
            const Icon = directive.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendDirective(directive.prompt, directive.pillar)}
                disabled={isThinking}
                className="bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-indigo-500/50 rounded-xl p-3.5 text-left transition-all group flex flex-col justify-between shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">{directive.pillar.split(':')[0]}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-200 group-hover:text-indigo-300 transition-colors">
                    {directive.title}
                  </div>
                  <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">
                    {directive.prompt}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Command Terminal Input */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-stone-400">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>EXECUTIVE AGENT PROMPT TERMINAL</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">MODEL: GEMINI-3.7-FLASH (SERVER-SIDE)</span>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendDirective(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            id="input-executive-prompt"
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type executive instruction, scenario simulation, or operational query..."
            disabled={isThinking}
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />

          <button
            id="btn-submit-directive"
            type="submit"
            disabled={isThinking || !promptInput.trim()}
            className={`px-5 py-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
              isThinking || !promptInput.trim()
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50'
            }`}
          >
            {isThinking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>REASONING...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>EXECUTE DIRECTIVE</span>
              </>
            )}
          </button>
        </form>

        {/* Live AI Reasoning Display Window */}
        {activeAnalysis && (
          <div className="mt-4 p-5 bg-stone-950 border border-indigo-500/40 rounded-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AUTONOMOUS AGENT REASONING OUTPUT</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                SOURCE: {aiSource.toUpperCase()}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-stone-200 whitespace-pre-line leading-relaxed font-sans">
              {activeAnalysis}
            </div>
          </div>
        )}

      </div>

      {/* Autonomous Action & Decision Log Stream */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-100">Autonomous Executive Action Stream</h3>
            <p className="text-xs text-stone-400">Live multi-agent decision audit across the 9 Dragon nodes.</p>
          </div>
          <span className="text-xs font-mono text-stone-500">{logs.length} Actions Logged</span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {logs.map((log) => {
            const isDecision = log.severity === 'decision';
            const isMitigation = log.severity === 'mitigation';
            const isOptimization = log.severity === 'optimization';

            return (
              <div
                key={log.id}
                className="p-3.5 bg-stone-950 border border-stone-800/80 rounded-xl space-y-1.5 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      isDecision ? 'bg-indigo-400' :
                      isMitigation ? 'bg-rose-400' :
                      isOptimization ? 'bg-emerald-400' : 'bg-stone-400'
                    }`}></span>
                    <span className="text-xs font-bold text-stone-200">{log.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400">
                      {log.pillar}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-stone-500">{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-400 pl-4">{log.description}</p>

                <div className="flex items-center justify-between pl-4 pt-1 text-[11px] font-mono text-stone-500">
                  <span className="text-emerald-400/90">ACTION: {log.actionTaken}</span>
                  <span className="text-indigo-400/80">AGENT: {log.autonomousAgent}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
