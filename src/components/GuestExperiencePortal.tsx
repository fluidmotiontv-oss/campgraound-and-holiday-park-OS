import React, { useState } from 'react';
import { 
  BoardingPass, 
  WeatherHazard 
} from '../types';
import { 
  Compass, 
  Flame, 
  Package, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Lock, 
  Key, 
  Sparkles, 
  Send,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface GuestExperiencePortalProps {
  pass: BoardingPass;
  onUpdatePass: (pass: BoardingPass) => void;
  weather: WeatherHazard;
  onNavigateToBoardingPass: () => void;
}

export const GuestExperiencePortal: React.FC<GuestExperiencePortalProps> = ({
  pass,
  onUpdatePass,
  weather,
  onNavigateToBoardingPass
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'concierge' | 'fire_permit' | 'rentals' | 'events'>('concierge');
  const [conciergeQuery, setConciergeQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Kia Ora ${pass.guestName.split(' ')[0]}! Welcome to Aotearoa Holiday Park, Port Waikato. I'm your Dragon 9 AI Concierge. I can help you with Sunset Beach surf conditions, Waikato River fishing charters, booking local cafe hampers, smart lock pins, or fire permits. How can I assist your stay today?`,
      time: '12:00'
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [permitPledged, setPermitPledged] = useState(pass.firePermitStatus === 'granted');
  const [rentalSuccessNotice, setRentalSuccessNotice] = useState<string | null>(null);

  const handleAskConcierge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeQuery.trim()) return;

    const userText = conciergeQuery;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setConciergeQuery('');
    setIsAiThinking(true);

    setTimeout(() => {
      let reply = "I have cross-referenced your request with our Port Waikato telemetry nodes. Everything is running smoothly for your stay!";
      const q = userText.toLowerCase();

      if (q.includes('surf') || q.includes('beach') || q.includes('waves')) {
        reply = `🌊 Sunset Beach is currently running 1.6m clean offshore peelers with an incoming tide. You can hire Torq or soft-top boards directly from Port Waikato Surf Academy in the Community Hub!`;
      } else if (q.includes('coffee') || q.includes('food') || q.includes('eat') || q.includes('cafe') || q.includes('dinner')) {
        reply = `☕ Sunset Beach Café & General Store (1 Maraetai Bay Rd) serves organic espresso, famous Kiwi steak & cheese pies, and fresh Friday fish & chips. You can also book a gourmet dune picnic hamper through the Community Hub.`;
      } else if (q.includes('fish') || q.includes('river') || q.includes('boat') || q.includes('whitebait')) {
        reply = `🎣 The Waikato River mouth wharf is 400m away. Target kahawai on the incoming tide or book a guided river delta charter with Waikato River Expeditions.`;
      } else if (q.includes('wifi') || q.includes('internet')) {
        reply = `📶 High-speed Starlink Wi-Fi is active across the park. Your network is [DRAGON9_ULTRA_MESH_5G] or [PORT_WAIKATO_STARLINK_GUEST] with key: ${pass.wifiKey}.`;
      } else if (q.includes('gate') || q.includes('lock') || q.includes('code') || q.includes('barrier')) {
        reply = `🔑 Your site smart lock code is ${pass.smartLockCode}. Your vehicle [${pass.vehiclePlate}] is whitelisted on the ANPR boom gate, and you can also tap your Boarding Pass for instant offline access.`;
      } else if (q.includes('fire') || q.includes('permit') || q.includes('campfire')) {
        reply = `🔥 Rural Fire NZ Restricted Season is in effect. Enclosed gas fire tables and approved braziers at designated sites are permitted until 22:00. Open beach bonfires require FENZ permits.`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsAiThinking(false);
    }, 900);
  };

  const handleGrantFirePermit = () => {
    setPermitPledged(true);
    const updated = { ...pass, firePermitStatus: 'granted' as const };
    onUpdatePass(updated);
    StorageService.saveActivePass(updated);
  };

  const handleRentItem = (itemTitle: string, category: string, locker: string, code: string) => {
    const newRental = {
      id: `eq-${Date.now()}`,
      item: itemTitle,
      category: category,
      code: code,
      status: 'active' as const,
      dueTime: 'Tomorrow, 18:00',
      lockerNumber: locker
    };

    const updated = {
      ...pass,
      equipmentRentals: [...pass.equipmentRentals, newRental]
    };
    onUpdatePass(updated);
    StorageService.saveActivePass(updated);

    setRentalSuccessNotice(`✅ Checked out ${itemTitle}! Smart Locker ${locker} PIN: ${code}`);
    setTimeout(() => setRentalSuccessNotice(null), 5000);
  };

  return (
    <div id="guest-experience-portal" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              GUEST EXPERIENCE & CONCIERGE
            </span>
            <span className="text-xs text-stone-400 font-mono">Site: {pass.siteNumber}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Redwood Pines Guest Self-Service
          </h2>
          <p className="text-xs text-stone-400">
            Instant gear rental unlocks, digital campfire permits, and 24/7 AI park concierge.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-center">
          <button
            onClick={() => setActiveSubTab('concierge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'concierge' ? 'bg-cyan-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            AI Concierge
          </button>
          <button
            onClick={() => setActiveSubTab('fire_permit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'fire_permit' ? 'bg-cyan-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Fire Permit
          </button>
          <button
            onClick={() => setActiveSubTab('rentals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'rentals' ? 'bg-cyan-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Gear Lockers
          </button>
        </div>
      </div>

      {/* AI Concierge Chat Tab */}
      {activeSubTab === 'concierge' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-stone-100">Live AI Park Concierge</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Offline Ready
            </span>
          </div>

          {/* Chat Stream */}
          <div className="space-y-3 min-h-[240px] max-h-[360px] overflow-y-auto p-3 bg-stone-950 rounded-xl border border-stone-800/80">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-stone-850 text-stone-200 border border-stone-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-stone-500 font-mono mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center space-x-2 text-stone-400 text-xs font-mono p-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Concierge is looking up park telemetry...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleAskConcierge} className="flex gap-2">
            <input
              type="text"
              value={conciergeQuery}
              onChange={(e) => setConciergeQuery(e.target.value)}
              placeholder="Ask about campfire rules, sauna hours, trail conditions, kayak codes..."
              className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!conciergeQuery.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>

        </div>
      )}

      {/* Fire Permit Tab */}
      {activeSubTab === 'fire_permit' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-100">Digital Campfire Permit & Safety Protocol</h3>
                <p className="text-xs text-stone-400">Calibrated against real-time park microclimate sensors.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-orange-950/70 text-orange-300 border border-orange-600/40">
              CURRENT INDEX: {weather.wildfireDangerIndex.toUpperCase()}
            </span>
          </div>

          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2 text-xs text-stone-300">
            <div className="font-bold text-stone-100">Active Fire Safety Constraints for Tonight:</div>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li>Propane fire tables & enclosed charcoal grills: <strong className="text-emerald-400">PERMITTED</strong></li>
              <li>Open wood campfires: <strong className="text-amber-400">PERMITTED UNTIL 22:00 (MUST BE FULLY EXTINGUISHED)</strong></li>
              <li>A 5-gallon water bucket or fire extinguisher must remain within 10 feet of firepit.</li>
            </ul>
          </div>

          {permitPledged ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Fire Permit Granted for Site {pass.siteNumber}</span>
              </div>
              <button
                onClick={onNavigateToBoardingPass}
                className="text-xs text-emerald-300 underline font-mono"
              >
                View on Boarding Pass
              </button>
            </div>
          ) : (
            <button
              id="btn-pledge-fire-safety"
              onClick={handleGrantFirePermit}
              className="w-full py-3 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-stone-950 transition-all shadow-lg shadow-orange-950/40"
            >
              I Accept Safety Rules & Activate Fire Permit
            </button>
          )}
        </div>
      )}

      {/* Smart Gear Locker Rentals Tab */}
      {activeSubTab === 'rentals' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-stone-100">Autonomous Smart Locker Gear Checkout</h3>
            <p className="text-xs text-stone-400">Select gear to receive instant Bluetooth / PIN unlock code.</p>
          </div>

          {rentalSuccessNotice && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center justify-between">
              <span>{rentalSuccessNotice}</span>
              <button onClick={onNavigateToBoardingPass} className="underline text-emerald-400">View Pass</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">WATER SPORTS</span>
                  <span className="text-xs font-mono text-stone-400">$35 / day</span>
                </div>
                <div className="text-sm font-bold text-stone-100 mt-1">Stand-Up Paddleboard (SUP) + Carbon Paddle</div>
                <p className="text-xs text-stone-400 mt-0.5">Includes automatic PFD life jacket and safety leash in Pier Bay #02.</p>
              </div>
              <button
                onClick={() => handleRentItem('Inflatable SUP Board + PFD', 'Water Sports', 'Pier Locker #02', 'SUP-8821')}
                className="w-full py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                Instant Unlock ($35)
              </button>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">TRAIL GEAR</span>
                  <span className="text-xs font-mono text-stone-400">$45 / day</span>
                </div>
                <div className="text-sm font-bold text-stone-100 mt-1">All-Terrain Fat Tire E-Bike (750W)</div>
                <p className="text-xs text-stone-400 mt-0.5">50-mile trail range with dual disc brakes in Clubhouse Bay #08.</p>
              </div>
              <button
                onClick={() => handleRentItem('All-Terrain Fat Tire E-Bike', 'Trail Gear', 'Clubhouse Bay #08', 'EBK-5542')}
                className="w-full py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors"
              >
                Instant Unlock ($45)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
