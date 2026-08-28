import React, { useState, useEffect } from 'react';
import { 
  BoardingPass, 
  GateAccessEvent,
  WeatherHazard 
} from '../types';
import { 
  QrCode, 
  Key, 
  Car, 
  ShieldCheck, 
  Flame, 
  Wifi, 
  Lock, 
  Unlock, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Share2, 
  Download, 
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  SmartphoneNfc
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface BoardingPassCardProps {
  pass: BoardingPass;
  onUpdatePass: (pass: BoardingPass) => void;
  weather: WeatherHazard;
  isOffline: boolean;
  onOpenQrScanner?: () => void;
}

export const BoardingPassCard: React.FC<BoardingPassCardProps> = ({
  pass,
  onUpdatePass,
  weather,
  isOffline,
  onOpenQrScanner
}) => {
  const [showLockCode, setShowLockCode] = useState(false);
  const [totpCountdown, setTotpCountdown] = useState(24);
  const [gateActuating, setGateActuating] = useState(false);
  const [gateNotice, setGateNotice] = useState<string | null>(null);
  const [offlineScanVerified, setOfflineScanVerified] = useState<boolean | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pass' | 'amenities' | 'gates' | 'verify'>('pass');

  // Rotating TOTP Countdown Simulator (30s rotation)
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpCountdown((prev) => {
        if (prev <= 1) {
          // Rotate hash
          const nextHash = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-D9`;
          const updated = { ...pass, offlineTotpHash: nextHash };
          onUpdatePass(updated);
          StorageService.saveActivePass(updated);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pass, onUpdatePass]);

  // Simulate Instant Boom Gate Actuation via BLE/NFC offline token
  const handleTriggerBoomGate = (gateName: string = 'North Main Boom Gate') => {
    setGateActuating(true);
    setGateNotice(`Transmitting offline cryptographic token [${pass.offlineTotpHash}] to ${gateName}...`);

    setTimeout(() => {
      const newGateEvent: GateAccessEvent = {
        id: `gate-event-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        gateId: 'gate-actuated',
        gateName: gateName,
        method: isOffline ? 'offline_qr' : 'ble_proximity',
        authorized: true,
        notes: `Offline token HMAC verified. Barrier opened (1.1s latency).`,
      };

      const updatedPass: BoardingPass = {
        ...pass,
        gateAccessLogs: [newGateEvent, ...pass.gateAccessLogs].slice(0, 10),
      };

      onUpdatePass(updatedPass);
      StorageService.saveActivePass(updatedPass);

      // Add to offline sync queue
      StorageService.addToSyncQueue({
        timestamp: new Date().toISOString(),
        actionType: 'gate_event',
        payload: newGateEvent,
        status: isOffline ? 'pending' : 'synced',
      });

      setGateActuating(false);
      setGateNotice(`✅ ${gateName} actuated successfully! Offline cryptographic validation passed.`);
      setTimeout(() => setGateNotice(null), 5000);
    }, 1200);
  };

  // Offline Verification Scanner Tool
  const handleVerifyOfflineSignature = () => {
    setOfflineScanVerified(null);
    setTimeout(() => {
      setOfflineScanVerified(true);
    }, 600);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div id="boarding-pass-protocol-container" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              THE BOARDING PASS PROTOCOL
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Offline-Resilient Cryptographic Pass v3.4
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Autonomous Digital Guest Pass & Access Key
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Self-verifying offline token protocol ensuring seamless boom gate access, site unlocks, and permits even in complete wilderness connectivity blackouts.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('pass')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pass' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Digital Pass
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'amenities' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Amenities & Lockers
          </button>
          <button
            onClick={() => setActiveTab('gates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'gates' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Gate Ledger ({pass.gateAccessLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'verify' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Ranger Verifier
          </button>
        </div>
      </div>

      {/* Main Boarding Pass Card */}
      {activeTab === 'pass' && (
        <div className="relative">
          
          {/* Physical Style Boarding Pass Container */}
          <div className="bg-stone-950 border-2 border-amber-600/40 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Top Amber Header Ribbon */}
            <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-6 py-4 text-stone-950 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-mono font-black text-lg">
                  D9
                </div>
                <div>
                  <div className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-amber-950">
                    CAMPGROUND BOARDING PASS
                  </div>
                  <div className="text-base sm:text-lg font-black tracking-tight text-stone-950">
                    REDWOOD PINES RESORT & HOLIDAY PARK
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-stone-950/20 px-3 py-1 rounded-lg border border-stone-950/30">
                <ShieldCheck className="w-4 h-4 text-stone-950" />
                <span className="text-xs font-mono font-black text-stone-950">
                  OFFLINE CRYPTO SECURED
                </span>
              </div>
            </div>

            {/* Pass Body Content */}
            <div className="p-6 sm:p-8 space-y-6 text-stone-100">
              
              {/* Primary Guest & Site Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-stone-800">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-stone-400">Primary Guest</div>
                  <div className="text-lg sm:text-xl font-extrabold text-stone-100">{pass.guestName}</div>
                  <div className="text-xs text-stone-400 font-mono mt-0.5">{pass.guestPhone}</div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-stone-400">Site Assignment</div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{pass.siteNumber}</span>
                    <span className="text-xs font-semibold text-stone-300">{pass.zone}</span>
                  </div>
                  <div className="text-xs text-stone-400 truncate">{pass.siteType}</div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-stone-400">Pass Token</div>
                  <div className="text-sm font-mono font-bold text-amber-300/90">{pass.confirmationCode}</div>
                  <div className="text-[11px] text-stone-400 font-mono mt-0.5">Party Size: {pass.partySize} Guests</div>
                </div>
              </div>

              {/* Dates, Vehicle & Smart Keys */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-stone-800">
                <div>
                  <div className="text-xs font-mono text-stone-400">Check-In</div>
                  <div className="text-sm font-bold text-stone-200 mt-0.5">{pass.checkInDate}</div>
                </div>

                <div>
                  <div className="text-xs font-mono text-stone-400">Check-Out</div>
                  <div className="text-sm font-bold text-stone-200 mt-0.5">{pass.checkOutDate}</div>
                </div>

                <div>
                  <div className="text-xs font-mono text-stone-400 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-stone-400" />
                    <span>Vehicle Plate (ANPR)</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">{pass.vehiclePlate}</div>
                  <div className="text-[10px] text-stone-500 truncate">{pass.vehicleModel}</div>
                </div>

                <div>
                  <div className="text-xs font-mono text-stone-400 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-stone-400" />
                    <span>Starlink WiFi Key</span>
                  </div>
                  <div 
                    onClick={() => copyToClipboard(pass.wifiKey, 'wifi')}
                    className="text-xs font-mono font-bold text-teal-400 mt-0.5 cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <span>{pass.wifiKey}</span>
                    <Copy className="w-3 h-3 text-stone-500" />
                  </div>
                  {copiedCode === 'wifi' && <span className="text-[10px] text-teal-300">Copied!</span>}
                </div>
              </div>

              {/* Smart Lock Code Reveal Box */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    {showLockCode ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-mono text-stone-400">Site Pedestal & Cabin Smart Lock</div>
                    <div className="text-base font-bold text-stone-100">
                      {showLockCode ? (
                        <span className="font-mono text-xl font-black text-emerald-400 tracking-widest">
                          {pass.smartLockCode}
                        </span>
                      ) : (
                        <span className="font-mono tracking-widest text-stone-500">•••• (Tap to reveal)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id="btn-toggle-lock-code"
                    onClick={() => setShowLockCode(!showLockCode)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
                  >
                    {showLockCode ? 'Hide Code' : 'Reveal Lock Code'}
                  </button>

                  <button
                    id="btn-trigger-gate-now"
                    onClick={() => handleTriggerBoomGate('North Entrance Gate')}
                    disabled={gateActuating}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 transition-all flex items-center space-x-1.5"
                  >
                    <SmartphoneNfc className="w-4 h-4" />
                    <span>{gateActuating ? 'Actuating...' : 'Tap to Open Gate'}</span>
                  </button>
                </div>
              </div>

              {/* Gate Notification Feedback */}
              {gateNotice && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center justify-between animate-fadeIn">
                  <span>{gateNotice}</span>
                  <span className="text-[10px] text-emerald-400">OFFLINE NFC RELAY</span>
                </div>
              )}

              {/* Cryptographic Offline QR & TOTP Section */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Simulated SVG QR Code */}
                <div className="bg-stone-100 p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center">
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                    {/* Stylized QR Matrix Pattern */}
                    <rect x="5" y="5" width="25" height="25" fill="#1c1917" rx="3" />
                    <rect x="10" y="10" width="15" height="15" fill="#f5f5f4" />
                    <rect x="13" y="13" width="9" height="9" fill="#1c1917" />

                    <rect x="70" y="5" width="25" height="25" fill="#1c1917" rx="3" />
                    <rect x="75" y="10" width="15" height="15" fill="#f5f5f4" />
                    <rect x="78" y="13" width="9" height="9" fill="#1c1917" />

                    <rect x="5" y="70" width="25" height="25" fill="#1c1917" rx="3" />
                    <rect x="10" y="75" width="15" height="15" fill="#f5f5f4" />
                    <rect x="13" y="78" width="9" height="9" fill="#1c1917" />

                    {/* Data payload blocks */}
                    <rect x="35" y="10" width="6" height="6" fill="#1c1917" />
                    <rect x="45" y="10" width="6" height="6" fill="#d97706" />
                    <rect x="55" y="10" width="6" height="6" fill="#1c1917" />
                    
                    <rect x="35" y="25" width="6" height="6" fill="#1c1917" />
                    <rect x="45" y="25" width="16" height="6" fill="#1c1917" />
                    
                    <rect x="10" y="40" width="15" height="6" fill="#1c1917" />
                    <rect x="30" y="40" width="25" height="6" fill="#1c1917" />
                    <rect x="65" y="40" width="25" height="6" fill="#1c1917" />

                    <rect x="10" y="52" width="20" height="6" fill="#1c1917" />
                    <rect x="40" y="52" width="15" height="6" fill="#d97706" />
                    <rect x="60" y="52" width="30" height="6" fill="#1c1917" />

                    <rect x="35" y="70" width="15" height="6" fill="#1c1917" />
                    <rect x="60" y="70" width="6" height="20" fill="#1c1917" />
                    <rect x="75" y="70" width="20" height="6" fill="#1c1917" />
                    
                    <rect x="35" y="85" width="20" height="6" fill="#1c1917" />
                    <rect x="70" y="85" width="15" height="6" fill="#d97706" />
                  </svg>
                  <span className="text-[10px] font-mono text-stone-900 font-bold mt-1">OFFLINE VERIFIABLE</span>
                </div>

                {/* Dynamic Token Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-stone-400">Rotating HMAC Token</span>
                    <span className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Rotates in {totpCountdown}s
                    </span>
                  </div>

                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                    <span className="text-lg font-mono font-bold text-amber-300 tracking-wider">
                      {pass.offlineTotpHash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(pass.offlineTotpHash, 'totp')}
                      className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 bg-stone-800 rounded font-mono"
                    >
                      {copiedCode === 'totp' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-stone-400 font-mono">Cryptographic Checksum:</div>
                    <div className="text-[10px] font-mono text-stone-500 break-all bg-stone-950/70 p-2 rounded border border-stone-800/60">
                      {pass.cryptographicSignature}
                    </div>
                  </div>

                  {/* Offline Fire Permit Status */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-800">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      Campfire Permit:
                    </span>
                    <span className="font-mono font-bold text-emerald-400 uppercase">
                      {pass.firePermitStatus} (Enclosed Only)
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Card Footer */}
            <div className="bg-stone-900/80 px-6 py-3 border-t border-stone-800 text-[11px] font-mono text-stone-500 flex flex-wrap items-center justify-between gap-2">
              <span>ISSUED BY DRAGON 9 AUTONOMOUS PROTOCOL</span>
              <span>EXP: {pass.expiresAt}</span>
            </div>

          </div>

        </div>
      )}

      {/* Amenities & Smart Locker Keys Tab */}
      {activeTab === 'amenities' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-stone-100">Authorized Amenity Badges & Smart Locker Keys</h3>
            <p className="text-xs text-stone-400">All permissions are encoded directly into your offline pass token.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pass.amenityAccess.map((amenity, idx) => (
              <div key={idx} className="p-3.5 bg-stone-950 border border-stone-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">{amenity}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-950/60 rounded">
                  UNLOCKED
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-800 space-y-4">
            <h4 className="text-sm font-bold text-stone-200">Active Gear Rentals & Smart Locker Codes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pass.equipmentRentals.map((rental) => (
                <div key={rental.id} className="p-4 bg-stone-950 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{rental.category}</span>
                    <span className="text-[10px] font-mono text-stone-400">{rental.lockerNumber}</span>
                  </div>
                  <div className="text-sm font-bold text-stone-100">{rental.item}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                    <span className="text-stone-400 font-mono">Unlock Code:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-stone-900 px-2 py-1 rounded">
                      {rental.code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gate Access Logs Tab */}
      {activeTab === 'gates' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-100">Gate & Barrier Access History</h3>
              <p className="text-xs text-stone-400">Cryptographically logged offline and synchronized with park ledger.</p>
            </div>
            <button
              onClick={() => handleTriggerBoomGate('North Main Boom Gate')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors"
            >
              Test Gate Handshake
            </button>
          </div>

          <div className="space-y-2">
            {pass.gateAccessLogs.map((log) => (
              <div key={log.id} className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-200">{log.gateName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 uppercase">
                      {log.method}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{log.notes}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">AUTHORIZED</div>
                  <div className="text-[10px] text-stone-500 font-mono">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranger Offline Verifier Tool Tab */}
      {activeTab === 'verify' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-stone-100">Park Ranger Standalone Pass Verifier</h3>
            <p className="text-xs text-stone-400">
              Simulates a handheld ranger terminal scanning and validating the Boarding Pass cryptographically with ZERO internet connectivity.
            </p>
          </div>

          <div className="p-5 bg-stone-950 border border-stone-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-stone-400">Loaded Guest Signature:</div>
                <div className="text-xs font-mono font-bold text-stone-200 truncate max-w-md">{pass.cryptographicSignature}</div>
              </div>

              <div className="flex items-center space-x-2">
                {onOpenQrScanner && (
                  <button
                    id="btn-open-camera-verifier"
                    onClick={onOpenQrScanner}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all shadow-md flex items-center space-x-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-stone-950" />
                    <span>Open Live QR Scanner</span>
                  </button>
                )}
                <button
                  id="btn-scan-offline-pass"
                  onClick={handleVerifyOfflineSignature}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                >
                  Verify Active Signature
                </button>
              </div>
            </div>

            {offlineScanVerified && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CRYPTOGRAPHIC SIGNATURE VALID (HMAC-SHA256 OK)</span>
                </div>
                <div className="text-xs text-stone-300 font-mono space-y-1">
                  <div>• Guest: {pass.guestName}</div>
                  <div>• Authorized Site: {pass.siteNumber} ({pass.siteType})</div>
                  <div>• Vehicle Tag: {pass.vehiclePlate}</div>
                  <div>• Stay Window: {pass.checkInDate} to {pass.checkOutDate}</div>
                  <div>• Campfire Permit: {pass.firePermitStatus.toUpperCase()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
