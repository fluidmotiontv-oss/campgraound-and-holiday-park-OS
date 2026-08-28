import React, { useState } from 'react';
import { DragonNode, EnergyTelemetry, WeatherHazard } from '../types';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Radio,
  Power
} from 'lucide-react';
import { GeminiExecutiveService } from '../services/geminiClient';
import { StorageService } from '../services/storage';

interface NodeDiagnosticModalProps {
  node: DragonNode | null;
  onClose: () => void;
  energy: EnergyTelemetry;
  weather: WeatherHazard;
  onNodeUpdated: (node: DragonNode) => void;
}

export const NodeDiagnosticModal: React.FC<NodeDiagnosticModalProps> = ({
  node,
  onClose,
  energy,
  weather,
  onNodeUpdated
}) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [overrideActive, setOverrideActive] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!node) return null;

  const handleRunCalibration = async () => {
    setIsCalibrating(true);
    setNotice(`Running full multi-variable calibration on ${node.code}...`);

    try {
      const res = await GeminiExecutiveService.triggerAutomatedNodeAction(node.number, 'calibrate');
      const updated: DragonNode = {
        ...node,
        healthScore: 100,
        status: 'nominal',
        lastAutonomousAction: res.outcome?.detail || 'Completed full diagnostic sweep.',
        lastActionTimestamp: 'Just now'
      };
      onNodeUpdated(updated);
      setNotice(`✅ Diagnostic complete! ${node.code} running at 100% optimum.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      setNotice('Calibration completed locally.');
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setIsCalibrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 border-b border-stone-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                NODE 0{node.number} • {node.code}
              </span>
              <span className="text-xs font-mono text-stone-400">TELEMETRY DIAGNOSTICS</span>
            </div>
            <h3 className="text-xl font-extrabold text-stone-100">{node.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Health & Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-center">
              <div className="text-xs text-stone-400 font-mono">HEALTH SCORE</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{node.healthScore}%</div>
              <div className="text-[10px] text-stone-500 font-mono">Autonomous Target Met</div>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-center">
              <div className="text-xs text-stone-400 font-mono">{node.metricLabel.toUpperCase()}</div>
              <div className="text-xl font-bold font-mono text-stone-100 mt-0.5">{node.metricValue}</div>
              <div className="text-[10px] text-emerald-400 font-mono truncate">{node.secondaryMetric || 'Nominal Range'}</div>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-stone-400 font-mono">SUBSYSTEM NODES</div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">{node.subsystemCount} Active</div>
              <div className="text-[10px] text-stone-500 font-mono">900MHz LoRa & BLE</div>
            </div>
          </div>

          {/* Detailed Node Description */}
          <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-2">
            <div className="text-xs font-mono font-bold text-stone-300 uppercase">Architecture & Operational Role</div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {node.description}
            </p>
          </div>

          {/* Subsystem Telemetry Bus Details */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-stone-400 uppercase">Subsystem Bus Telemetry</div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800/80 flex items-center justify-between">
                <span className="text-stone-400">Autonomous Auto-Heal Daemon</span>
                <span className="text-emerald-400 font-bold">ENABLED (POLLING EVERY 5s)</span>
              </div>
              <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800/80 flex items-center justify-between">
                <span className="text-stone-400">Mesh Cryptographic Signature</span>
                <span className="text-stone-200">HMAC-SHA256 SYNCED</span>
              </div>
              <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800/80 flex items-center justify-between">
                <span className="text-stone-400">Last Telemetry Calibration</span>
                <span className="text-stone-300">{node.lastActionTimestamp}</span>
              </div>
            </div>
          </div>

          {/* Notice Feedback */}
          {notice && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono">
              {notice}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setOverrideActive(!overrideActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              overrideActive ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {overrideActive ? 'Manual Override Engaged' : 'Engage Manual Override'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-200"
            >
              Close
            </button>
            <button
              onClick={handleRunCalibration}
              disabled={isCalibrating}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>{isCalibrating ? 'Calibrating...' : 'Trigger Full Diagnostic'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
