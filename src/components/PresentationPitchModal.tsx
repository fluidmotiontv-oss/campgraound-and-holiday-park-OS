import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Smartphone, 
  Server, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  WifiOff, 
  Flame, 
  Car, 
  Users, 
  DollarSign, 
  Clock, 
  FileText, 
  HelpCircle,
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';

interface PresentationPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerspective: (perspective: 'guest_mobile' | 'park_server') => void;
  onTriggerDemoAction?: (action: string) => void;
}

export const PresentationPitchModal: React.FC<PresentationPitchModalProps> = ({
  isOpen,
  onClose,
  onSelectPerspective,
  onTriggerDemoAction
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'demo_flow' | 'tech_architecture'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/90 backdrop-blur-lg animate-fadeIn overflow-y-auto">
      
      {/* Modal Card */}
      <div className="w-full max-w-5xl bg-stone-900 border border-stone-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Pitch Ribbon Header */}
        <div className="bg-gradient-to-r from-stone-950 via-teal-950/80 to-stone-950 px-6 py-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
                  HOLIDAY PARK OPERATOR PRESENTATION
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                  DRAGON 9 OS & BOARDING PASS
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-100 tracking-tight">
                Pitch Deck: Dual-App Architecture & Holiday Park OS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 pb-2 bg-stone-950 border-b border-stone-800 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('roi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'roi'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Operator ROI & Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('demo_flow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'demo_flow'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Demonstration Script</span>
          </button>

          <button
            onClick={() => setActiveTab('tech_architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'tech_architecture'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Two-Part Architecture</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Problem vs Solution Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* The Traditional Holiday Park Problem */}
                <div className="p-5 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-red-400">
                    <WifiOff className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-wider">The Rural Park Challenge</h3>
                  </div>
                  <ul className="text-xs text-stone-300 space-y-2 font-mono">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span><strong>Zero Cell Coverage Deadspots:</strong> Guests arrive with no reception, unable to load confirmation emails or web apps.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span><strong>Front-Desk Bottlenecks:</strong> Friday 4pm check-in traffic jams block main access roads with manual paper check-ins.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span><strong>Unmonitored Utility Peaks:</strong> EV chargers and heaters trip campground breakers without automated load shedding.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span><strong>Council Fire Risk Liability:</strong> Manual inspection of guest campfires during dry summer bans.</span>
                    </li>
                  </ul>
                </div>

                {/* The Dragon 9 Solution */}
                <div className="p-5 bg-teal-950/40 border border-teal-500/40 rounded-2xl space-y-3 shadow-lg shadow-teal-950/30">
                  <div className="flex items-center space-x-2 text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-wider">The Dragon 9 Edge Solution</h3>
                  </div>
                  <ul className="text-xs text-stone-200 space-y-2 font-mono">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><strong>100% Offline Cryptographic Passes:</strong> Self-verifying HMAC-SHA256 Boarding Pass QR and rolling TOTP works with zero internet.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><strong>Touchless 0.6s ANPR Gate Actuation:</strong> License plate recognition + instant barrier lifting eliminates all queues.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><strong>Autonomous Microgrid Peak Shaving:</strong> Intelligent load shedding prevents power trips and reduces utility tariffs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><strong>Local Economy Integration:</strong> Direct orders to Sunset Beach Café, surf hire, and community stores.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Two Distinct Apps Section */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-stone-100">Separated Two-Part Experience</h3>
                    <p className="text-xs text-stone-400 mt-0.5">Built to present either as a sleek guest mobile app or a full-scale park command center.</p>
                  </div>
                  <span className="text-xs font-mono text-teal-400 bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-500/30">
                    1-CLICK TOGGLE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  
                  {/* Card 1: Guest Mobile App */}
                  <div 
                    onClick={() => { onSelectPerspective('guest_mobile'); onClose(); }}
                    className="p-4 bg-stone-900 hover:bg-stone-850 border border-stone-700 hover:border-amber-500/60 rounded-2xl cursor-pointer transition-all group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-mono uppercase text-amber-400 font-bold">Part 1: Customer Front End</div>
                          <div className="text-sm font-black text-stone-100">Guest Mobile App (PWA)</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      Optimized for camper smartphones with optional mobile device mockup framing, offline digital boarding pass, PIN codes, marine surf alerts, and local cafe ordering.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono bg-stone-950 text-stone-300 px-2 py-0.5 rounded border border-stone-800">Touchless Check-In</span>
                      <span className="text-[10px] font-mono bg-stone-950 text-stone-300 px-2 py-0.5 rounded border border-stone-800">Smart Lock PIN</span>
                      <span className="text-[10px] font-mono bg-stone-950 text-stone-300 px-2 py-0.5 rounded border border-stone-800">Sunset Beach Swell</span>
                    </div>

                    <div className="text-xs font-bold text-amber-400 pt-1 flex items-center gap-1 group-hover:underline">
                      Launch Guest Mobile View →
                    </div>
                  </div>

                  {/* Card 2: Server Backend */}
                  <div 
                    onClick={() => { onSelectPerspective('park_server'); onClose(); }}
                    className="p-4 bg-stone-900 hover:bg-stone-850 border border-stone-700 hover:border-teal-500/60 rounded-2xl cursor-pointer transition-all group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-mono uppercase text-teal-400 font-bold">Part 2: Campground Management</div>
                          <div className="text-sm font-black text-stone-100">Park Server OS & Command Center</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      Complete operator control room with live pitch grid, power draw, ANPR gate camera telemetry, 900MHz LoRa mesh ledger, and autonomous executive decision logs.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono bg-stone-950 text-stone-300 px-2 py-0.5 rounded border border-stone-800">Dragon 9 Matrix</span>
                      <span className="text-[10px] font-mono bg-stone-950 text-stone-300 px-2 py-0.5 rounded border border-stone-800">ANPR Gate Controller</span>
                      <span className="text-[10px] font-mono bg-stone-950 text-stone-300 px-2 py-0.5 rounded border border-stone-800">Live API Stream</span>
                    </div>

                    <div className="text-xs font-bold text-teal-400 pt-1 flex items-center gap-1 group-hover:underline">
                      Launch Park Server Console →
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: OPERATOR ROI & FINANCIALS */}
          {activeTab === 'roi' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ROI Headline Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                  <div className="text-[10px] font-mono uppercase text-stone-400">Front-Desk Labour</div>
                  <div className="text-2xl font-black text-emerald-400">-85%</div>
                  <div className="text-[10px] text-stone-400 font-mono">Automated self-checkin</div>
                </div>

                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                  <div className="text-[10px] font-mono uppercase text-stone-400">Energy Peak Demand</div>
                  <div className="text-2xl font-black text-amber-400">-$14,200/yr</div>
                  <div className="text-[10px] text-stone-400 font-mono">Microgrid peak shaving</div>
                </div>

                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                  <div className="text-[10px] font-mono uppercase text-stone-400">Gate Actuation Time</div>
                  <div className="text-2xl font-black text-teal-400">0.6s</div>
                  <div className="text-[10px] text-stone-400 font-mono">Down from 4.5 mins</div>
                </div>

                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                  <div className="text-[10px] font-mono uppercase text-stone-400">Guest Ancillary Spend</div>
                  <div className="text-2xl font-black text-purple-400">+32%</div>
                  <div className="text-[10px] text-stone-400 font-mono">Local business integration</div>
                </div>
              </div>

              {/* Detailed Value Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Clock className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Zero Check-in Queues</h4>
                  </div>
                  <p className="text-xs text-stone-300">
                    Campers receive their Boarding Pass on booking. The camera recognizes their plate or QR on arrival and lifts the barrier automatically. Staff focus on hospitality rather than key handoffs.
                  </p>
                </div>

                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Microgrid Protection</h4>
                  </div>
                  <p className="text-xs text-stone-300">
                    Autonomous node monitoring detects sudden RV heater spikes and dials back non-critical water heating or EV charging to prevent campground blackouts.
                  </p>
                </div>

                <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-teal-400">
                    <ShieldCheck className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Council & Fire Safety</h4>
                  </div>
                  <p className="text-xs text-stone-300">
                    When high winds or dry indices occur, the system automatically revokes fire permits on all guest boarding passes and broadcasts silent notifications in real time.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: LIVE DEMO SCRIPT */}
          {activeTab === 'demo_flow' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-100">Step-by-Step Operator Presentation Script</h3>
                  <p className="text-xs text-stone-400">Follow this 5-minute walkthrough when pitching to holiday park managers.</p>
                </div>
                <span className="text-xs font-mono text-teal-400 font-bold bg-teal-950 px-2 py-1 rounded">5-MINUTE PITCH</span>
              </div>

              <div className="space-y-3">
                
                {/* Step 1 */}
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-200">Show the Guest Mobile Experience</h4>
                      <button
                        onClick={() => { onSelectPerspective('guest_mobile'); onClose(); }}
                        className="text-[11px] font-mono text-amber-400 hover:underline"
                      >
                        Switch to Mobile →
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Start in <strong>Guest Mobile App</strong> mode. Highlight the Port Waikato Community Hub, local fish & chips ordering, Sunset Beach surf tide tracker, and instant campsite booking.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-200">Demonstrate the Offline Boarding Pass & Smart Lock</h4>
                      <button
                        onClick={() => { onSelectPerspective('guest_mobile'); onClose(); }}
                        className="text-[11px] font-mono text-amber-400 hover:underline"
                      >
                        Open Boarding Pass →
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Navigate to the <strong>Boarding Pass</strong> tab. Reveal the 4-digit keypad PIN, dynamic offline TOTP hash, and Starlink Wi-Fi credentials that work with zero cell service.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-200">Simulate Touchless QR Check-in & Gate Opening</h4>
                      <button
                        onClick={() => {
                          if (onTriggerDemoAction) onTriggerDemoAction('open_qr_scanner');
                          onClose();
                        }}
                        className="text-[11px] font-mono text-teal-400 hover:underline"
                      >
                        Launch Scanner →
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Trigger the <strong>QR Scanner / Rapid Check-in</strong>. Select an arriving guest (e.g. Rawinia on Safari Pod GL-02) and watch the boom gate lift and site occupancy change in 0.6s.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-200">Flip to Campground Management & Server OS</h4>
                      <button
                        onClick={() => { onSelectPerspective('park_server'); onClose(); }}
                        className="text-[11px] font-mono text-teal-400 hover:underline"
                      >
                        Switch to Server →
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Switch to the <strong>Park Server Backend</strong>. Show the 9 autonomous nodes, live power draw per pitch, ANPR gate camera controller, and the offline LoRa mesh sync queue.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-stone-200">Simulate Offline Wilderness Disconnection</h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Toggle <strong>Offline Wilderness Mode</strong>. Show that all operations, check-ins, and cryptographic validations continue uninterrupted and automatically batch-sync upon reconnection.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TWO-PART ARCHITECTURE */}
          {activeTab === 'tech_architecture' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-teal-400" />
                  Hardware & Edge Networking Stack
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-stone-300">
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                    <div className="text-teal-400 font-bold">Edge Server Hardware</div>
                    <div className="text-stone-400 text-[11px]">ARM64 Edge Appliance • Solar Inverter RS-485 Modbus • Starlink High-Performance Dish</div>
                  </div>
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                    <div className="text-teal-400 font-bold">Mesh Frequency & Protocol</div>
                    <div className="text-stone-400 text-[11px]">915MHz LoRa NZ ISM Band • AES-128 Node Enclave • ISO/IEC 18004 Boarding Pass Standard</div>
                  </div>
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                    <div className="text-teal-400 font-bold">Offline Cryptography</div>
                    <div className="text-stone-400 text-[11px]">HMAC-SHA256 asymmetric pass token • 30-sec rolling TOTP key • Zero server-call verification</div>
                  </div>
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                    <div className="text-teal-400 font-bold">Local Gate & ANPR Controller</div>
                    <div className="text-stone-400 text-[11px]">Embedded Optical Character Recognition • Relay Dry Contact Boom Barrier Actuator</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-stone-950 px-6 py-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Ready for Holiday Park presentation</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => { onSelectPerspective('guest_mobile'); onClose(); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors flex items-center space-x-1.5 shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch Guest App</span>
            </button>

            <button
              onClick={() => { onSelectPerspective('park_server'); onClose(); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center space-x-1.5 shadow-md"
            >
              <Server className="w-4 h-4" />
              <span>Launch Park Server OS</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
