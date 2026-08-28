import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  X, 
  Upload, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  ShieldCheck, 
  Car, 
  MapPin, 
  Zap, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  Compass, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Smartphone
} from 'lucide-react';
import jsQR from 'jsqr';
import { BoardingPass, CampSite } from '../types';
import { StorageService, INITIAL_BOARDING_PASSES_VAULT } from '../services/storage';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: (pass: BoardingPass, site?: CampSite) => void;
  onNavigateToTab?: (tabId: string) => void;
}

type ScannerTab = 'camera' | 'samples' | 'upload' | 'manual';

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onCheckInSuccess,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<ScannerTab>('camera');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // Result state
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    pass?: BoardingPass;
    site?: CampSite;
    message: string;
    isAlreadyCheckedIn: boolean;
    verificationDetails?: {
      signatureValid: boolean;
      totpValid: boolean;
      anprWhitelisted: boolean;
      firePermitGranted: boolean;
      latencyMs: number;
    };
  } | null>(null);

  const [barrierCountdown, setBarrierCountdown] = useState<number>(15);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play audio chime synthesized with Web Audio API
  const playAudioFeedback = useCallback((isSuccess: boolean) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (isSuccess) {
        // Dual positive chime: 587.33 Hz (D5) -> 880 Hz (A5)
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.45);
      } else {
        // Soft error tone: 220 Hz
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Audio context might be restricted before gesture
    }
  }, [soundEnabled]);

  // Haptic feedback
  const triggerHaptic = (success: boolean) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (success) {
          navigator.vibrate([35, 50, 40]);
        } else {
          navigator.vibrate([80, 50, 80]);
        }
      } catch {
        // Ignore haptic errors
      }
    }
  };

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setTorchOn(false);
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = (videoTrack as any).getCapabilities?.() || {};
        setTorchSupported(Boolean(capabilities.torch));
      } else {
        setTorchSupported(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('Permission denied') || errMsg.includes('NotAllowedError')) {
        setCameraError('Camera permission was denied. You can still test touchless check-ins using the Pre-Arrival Campers tab or by uploading a pass QR screenshot.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('No active video camera device found. Please select an arriving camper from the list or upload a pass image.');
      } else {
        setCameraError('Unable to open live camera stream. You can pick an arriving camper below or upload a QR image.');
      }
    }
  }, [cameraFacing, stopCamera]);

  // Execute touchless check-in logic
  const handleProcessCode = useCallback((code: string) => {
    setIsProcessing(true);
    setIsScanning(false);

    try {
      const result = StorageService.verifyAndCheckInPass(code);
      setCheckInResult(result);
      playAudioFeedback(result.success);
      triggerHaptic(result.success);

      if (result.success && result.pass) {
        setBarrierCountdown(15);
        if (onCheckInSuccess) {
          onCheckInSuccess(result.pass, result.site);
        }
      }
    } catch (e) {
      console.error('Check-in processing error:', e);
      setCheckInResult({
        success: false,
        message: 'An unexpected verification error occurred during pass validation.',
        isAlreadyCheckedIn: false,
        verificationDetails: {
          signatureValid: false,
          totpValid: false,
          anprWhitelisted: false,
          firePermitGranted: false,
          latencyMs: 40
        }
      });
      playAudioFeedback(false);
    } finally {
      setIsProcessing(false);
    }
  }, [playAudioFeedback, onCheckInSuccess]);

  // QR Scanning frame loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera' || !isScanning || checkInResult?.success) {
      return;
    }

    let isSubscribed = true;

    const scanFrame = () => {
      if (!isSubscribed || !isScanning || checkInResult?.success) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (code && code.data && code.data.trim().length > 0) {
              handleProcessCode(code.data);
              return; // Stop animation loop once recognized
            }
          } catch {
            // Frame analysis catch
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, activeTab, isScanning, checkInResult, handleProcessCode]);

  // Manage camera lifecycle based on tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !checkInResult?.success) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, checkInResult, startCamera, stopCamera]);

  // Barrier countdown timer
  useEffect(() => {
    if (!checkInResult?.success || barrierCountdown <= 0) return;
    const timer = setInterval(() => {
      setBarrierCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [checkInResult, barrierCountdown]);

  // Toggle flashlight
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack && 'applyConstraints' in videoTrack) {
      try {
        const newTorch = !torchOn;
        await (videoTrack as any).applyConstraints({
          advanced: [{ torch: newTorch }]
        });
        setTorchOn(newTorch);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  // Switch between front/back cameras
  const handleFlipCamera = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleProcessCode(code.data);
        } else {
          setCheckInResult({
            success: false,
            message: 'No valid Boarding Pass QR code was detected in the uploaded image. Please ensure the QR code is clearly visible and well-lit.',
            isAlreadyCheckedIn: false
          });
          playAudioFeedback(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Reset scanner to scan another pass
  const handleResetScanner = () => {
    setCheckInResult(null);
    setIsScanning(true);
    setManualCodeInput('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn">
      
      {/* Hidden Canvas for QR frame processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Container */}
      <div 
        id="qr-scanner-overlay"
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                  DRAGON 9 PROTOCOL
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  OFFLINE ACTIVE
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-stone-100 tracking-tight">
                Touchless Guest Check-In & Gate Scanner
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        {!checkInResult && (
          <div className="flex items-center px-4 pt-3 pb-2 bg-stone-950 border-b border-stone-800/80 gap-1 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('camera'); handleResetScanner(); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'camera'
                  ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('samples')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'samples'
                  ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Arriving Campers ({INITIAL_BOARDING_PASSES_VAULT.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Pass QR</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Code / Token</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">

          {/* STATE 1: CHECK-IN SUCCESS RESULT */}
          {checkInResult && checkInResult.success && checkInResult.pass && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Grand Success Banner */}
              <div className="bg-gradient-to-br from-emerald-950/90 via-stone-900 to-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <CheckCircle2 className="w-32 h-32 text-emerald-400" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
                      <CheckCircle2 className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                          {checkInResult.isAlreadyCheckedIn ? 'ACCESS CONFIRMED' : 'TOUCHLESS CHECK-IN COMPLETE'}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {checkInResult.verificationDetails?.latencyMs || 32}ms Offline Handshake
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-stone-100 tracking-tight mt-0.5">
                        Welcome, {checkInResult.pass.guestName}!
                      </h3>
                      <p className="text-xs text-stone-300">
                        {checkInResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Boom Gate Egress Timer */}
                  <div className="bg-stone-950/80 border border-emerald-500/40 rounded-xl p-3 text-center sm:text-right">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center justify-center sm:justify-end gap-1">
                      <Zap className="w-3 h-3 text-amber-400 animate-bounce" />
                      North Boom Gate Lifted
                    </div>
                    <div className="text-2xl font-black font-mono text-stone-100 mt-0.5">
                      {barrierCountdown}s
                    </div>
                    <div className="text-[9px] text-stone-400 font-mono">Egress Window Remaining</div>
                  </div>
                </div>
              </div>

              {/* Key Pitch Assignment & Digital Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pitch & Zone Box */}
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Pitch Allocation</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{checkInResult.pass.confirmationCode}</span>
                  </div>
                  
                  <div className="flex items-baseline space-x-3">
                    <span className="text-4xl font-black font-mono text-amber-400">
                      {checkInResult.pass.siteNumber}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-stone-200">{checkInResult.pass.zone}</div>
                      <div className="text-xs text-stone-400">{checkInResult.pass.siteType}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-stone-400" />
                      Plate: <strong className="text-stone-200 font-mono">{checkInResult.pass.vehiclePlate}</strong>
                    </span>
                    <span>Party: <strong>{checkInResult.pass.partySize} Guests</strong></span>
                  </div>
                </div>

                {/* Smart Lock Key Box */}
                <div className="bg-stone-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-inner flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      Site Smart Lock & Pedestal PIN
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      ACTIVE NOW
                    </span>
                  </div>

                  <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-mono uppercase text-stone-400">4-Digit Keypad Access Code</div>
                    <div className="text-3xl font-black font-mono text-emerald-400 tracking-widest mt-0.5">
                      {checkInResult.pass.smartLockCode}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>WiFi: <strong className="text-teal-400 font-mono">{checkInResult.pass.wifiKey}</strong></span>
                    <span className="flex items-center gap-1 text-orange-300">
                      <Flame className="w-3 h-3 text-orange-400" />
                      Campfire Permit: Granted
                    </span>
                  </div>
                </div>

              </div>

              {/* Cryptographic Verification Details */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Boarding Pass Protocol Verification Summary
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">ISO/IEC 18004 COMPLIANT</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800">
                    <div className="text-[10px] text-stone-400">HMAC-SHA256 Sig</div>
                    <div className="text-emerald-400 font-bold text-[11px] truncate">VALID (0x3D72...)</div>
                  </div>
                  <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800">
                    <div className="text-[10px] text-stone-400">Offline TOTP Hash</div>
                    <div className="text-emerald-400 font-bold text-[11px]">{checkInResult.pass.offlineTotpHash}</div>
                  </div>
                  <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800">
                    <div className="text-[10px] text-stone-400">ANPR Gate Sensor</div>
                    <div className="text-emerald-400 font-bold text-[11px]">WHITELISTED</div>
                  </div>
                  <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800">
                    <div className="text-[10px] text-stone-400">Mesh Synchronization</div>
                    <div className="text-teal-400 font-bold text-[11px]">ENQUEUED (P4)</div>
                  </div>
                </div>
              </div>

              {/* Navigation & Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  id="btn-nav-pass-view"
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('boarding_pass');
                    onClose();
                  }}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950/40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Full Digital Pass</span>
                </button>

                <button
                  id="btn-nav-map-grid"
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('campground_map');
                    onClose();
                  }}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 transition-all flex items-center justify-center space-x-1.5"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Guide to Pitch {checkInResult.pass.siteNumber}</span>
                </button>

                <button
                  id="btn-scan-next-guest"
                  onClick={handleResetScanner}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-all flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Scan Next Camper</span>
                </button>
              </div>

            </div>
          )}

          {/* STATE 2: SCAN FAILURE NOTICE */}
          {checkInResult && !checkInResult.success && (
            <div className="p-5 bg-red-950/70 border border-red-500/50 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-red-200">Cryptographic Verification Failed</h4>
                  <p className="text-xs text-stone-300 mt-1">{checkInResult.message}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleResetScanner}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => { setActiveTab('samples'); setCheckInResult(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
                >
                  Select from Arriving Campers
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: ACTIVE SCANNER MODES (WHEN NOT YET SUCCEEDED) */}
          {!checkInResult && (
            <>
              {/* TAB 1: LIVE CAMERA SCANNER */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  
                  {cameraError ? (
                    <div className="p-6 bg-stone-950 border border-stone-800 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-200">Camera Device Notice</h4>
                        <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">{cameraError}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => setActiveTab('samples')}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow-md"
                        >
                          Select Arriving Guest Pass
                        </button>
                        <button
                          onClick={() => setActiveTab('upload')}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
                        >
                          Upload QR Image File
                        </button>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
                        >
                          Retry Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-stone-950 border-2 border-stone-800 shadow-2xl aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
                      
                      {/* Video Stream Element */}
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />

                      {/* HUD Scan Reticle Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none">
                        
                        {/* Target Box with corner brackets */}
                        <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.15)] flex items-center justify-center">
                          
                          {/* Corner Reticle Accents */}
                          <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                          <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />

                          {/* Animated Laser Scanning Line */}
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-scan-laser" />

                          {/* Subtle center crosshair */}
                          <div className="w-3 h-3 rounded-full border border-amber-400/50 flex items-center justify-center">
                            <div className="w-1 h-1 bg-amber-400 rounded-full" />
                          </div>
                        </div>

                        <div className="mt-4 px-3 py-1 bg-stone-950/80 backdrop-blur-md rounded-full border border-stone-700/80 text-[11px] font-mono text-stone-200 font-semibold shadow-lg">
                          Point camera at Boarding Pass QR or Guest Screen
                        </div>

                      </div>

                      {/* Floating Camera Controls Toolbar */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center space-x-3 pointer-events-auto">
                        {torchSupported && (
                          <button
                            onClick={handleToggleTorch}
                            className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                              torchOn 
                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/50' 
                                : 'bg-stone-900/80 text-stone-300 border-stone-700 hover:bg-stone-800'
                            }`}
                            title="Toggle Torch / Flash"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={handleFlipCamera}
                          className="p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-700 backdrop-blur-md transition-all shadow-lg"
                          title="Switch Front/Rear Camera"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Processing Indicator */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-20 animate-fadeIn">
                          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                          <div className="text-xs font-mono font-bold text-stone-100">
                            Validating Cryptographic Signature...
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Quick-test banner underneath camera */}
                  <div className="p-3.5 bg-stone-950 border border-stone-800/80 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5 text-xs text-stone-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Testing without a second device? Check in arriving reservations instantly.</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('samples')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/20 whitespace-nowrap transition-colors"
                    >
                      View Arriving Guests →
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: SAMPLE ARRIVING GUEST PASSES (1-CLICK RAPID TESTING) */}
              {activeTab === 'samples' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-200">Arriving Campers Ready for Rapid Check-In</h4>
                      <p className="text-xs text-stone-400">Select any pre-arrival reservation to simulate a touchless QR scan & boom gate actuation.</p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      LOCAL VAULT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {INITIAL_BOARDING_PASSES_VAULT.map((pass) => (
                      <div
                        key={pass.id}
                        onClick={() => handleProcessCode(pass.confirmationCode)}
                        className="p-4 bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-md"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                            <span className="text-[10px] font-mono uppercase text-stone-400">PITCH</span>
                            <span className="text-base font-black font-mono leading-none">{pass.siteNumber}</span>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-extrabold text-stone-100 group-hover:text-amber-400 transition-colors">
                                {pass.guestName}
                              </span>
                              <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                                {pass.confirmationCode}
                              </span>
                            </div>
                            <div className="text-xs text-stone-400 mt-0.5">{pass.siteType} • {pass.zone}</div>
                            <div className="flex items-center space-x-3 text-[11px] text-stone-500 font-mono mt-1">
                              <span className="flex items-center gap-1">
                                <Car className="w-3 h-3" />
                                {pass.vehiclePlate}
                              </span>
                              <span>•</span>
                              <span>PIN: {pass.smartLockCode}</span>
                              <span>•</span>
                              <span>{pass.partySize} Guests</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <button
                            id={`btn-sample-checkin-${pass.siteNumber.toLowerCase()}`}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 group-hover:bg-amber-500 text-stone-950 transition-all flex items-center space-x-1 shadow-md"
                          >
                            <span>Rapid Check-In</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: UPLOAD QR IMAGE */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-stone-200">Upload Boarding Pass QR Screenshot / File</h4>
                    <p className="text-xs text-stone-400">Upload an image file containing a Dragon 9 or Aotearoa Holiday Park Boarding Pass QR code.</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-10 bg-stone-950 border-2 border-dashed border-stone-700 hover:border-amber-500/70 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                        Click or Drag & Drop QR Image
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">Supports PNG, JPG, JPEG, WEBP</div>
                    </div>
                    <span className="px-3 py-1 bg-stone-900 text-stone-300 rounded-lg text-xs font-mono border border-stone-800">
                      Browse Files
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: MANUAL TOKEN / CODE INPUT */}
              {activeTab === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-stone-200">Manual Boarding Pass Code Entry</h4>
                    <p className="text-xs text-stone-400">Enter a confirmation code (e.g. FLUID-GL02-RAW), pass token, or raw protocol payload.</p>
                  </div>

                  <div className="space-y-3">
                    <input
                      id="input-manual-pass-code"
                      type="text"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      placeholder="e.g. FLUID-789X-CAMP, FLUID-GL02-RAW, or RV-01"
                      className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl text-stone-100 font-mono text-sm placeholder-stone-600 focus:outline-none transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && manualCodeInput.trim()) {
                          handleProcessCode(manualCodeInput.trim());
                        }
                      }}
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        id="btn-submit-manual-code"
                        onClick={() => {
                          if (manualCodeInput.trim()) {
                            handleProcessCode(manualCodeInput.trim());
                          }
                        }}
                        disabled={!manualCodeInput.trim() || isProcessing}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 transition-colors shadow-md flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isProcessing ? 'Verifying...' : 'Validate & Actuate Gate'}</span>
                      </button>

                      <button
                        onClick={() => setManualCodeInput('FLUID-GL02-RAW')}
                        className="px-3 py-2.5 rounded-xl text-xs font-mono text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800"
                      >
                        Paste Sample: GL-02
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Ribbon */}
        <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-stone-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Fluid Motion Wilderness Protocol • Standalone Gate Mesh</span>
          </div>
          <div>
            <span>Press ESC or close to return</span>
          </div>
        </div>

      </div>

    </div>
  );
};
