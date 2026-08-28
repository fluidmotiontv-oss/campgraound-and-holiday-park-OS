import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Sparkles, 
  Waves, 
  Compass, 
  Camera, 
  Volume2, 
  VolumeX, 
  Radio, 
  CheckCircle2, 
  Upload, 
  Send, 
  Heart, 
  Award, 
  Star, 
  Zap, 
  ShieldCheck, 
  Gift, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Eye, 
  Feather, 
  Moon, 
  Sun, 
  TreePine, 
  Wind, 
  Maximize2, 
  Minimize2,
  Play,
  Pause,
  Layers,
  ChevronRight,
  HelpCircle,
  QrCode,
  Share2,
  FileText
} from 'lucide-react';
import { 
  BoardingPass, 
  DragonQuest, 
  DragonMediaSubmission, 
  DragonNestEmulsionState, 
  ElementalAffinity, 
  WeatherHazard 
} from '../types';
import { StorageService } from '../services/storage';

interface DragonNestEmulsionExperienceProps {
  pass: BoardingPass;
  weather: WeatherHazard;
  onUpdatePass?: (pass: BoardingPass) => void;
  onCloseFullscreen?: () => void;
}

type NestTab = 'altar_portal' | 'realm_quests' | 'media_well' | 'emulsion_wall' | 'codex_perks';

export const DragonNestEmulsionExperience: React.FC<DragonNestEmulsionExperienceProps> = ({
  pass,
  weather,
  onUpdatePass,
  onCloseFullscreen
}) => {
  // Main State
  const [activeTab, setActiveTab] = useState<NestTab>('altar_portal');
  const [nestState, setNestState] = useState<DragonNestEmulsionState>(() => StorageService.getDragonNestState());
  const [quests, setQuests] = useState<DragonQuest[]>(() => StorageService.getDragonQuests());
  const [mediaList, setMediaList] = useState<DragonMediaSubmission[]>(() => StorageService.getDragonMediaSubmissions());

  // Interactive Altar State
  const [altarPulsing, setAltarPulsing] = useState(false);
  const [selectedAltarElement, setSelectedAltarElement] = useState<ElementalAffinity>(nestState.activeElementalDominance);
  const [altarEnergyLevel, setAltarEnergyLevel] = useState(88);
  const [lastAltarMessage, setLastAltarMessage] = useState<string | null>(null);

  // Audio Synth Engine (Web Audio API)
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const waveGainRef = useRef<GainNode | null>(null);

  // Quest Solver Modal
  const [solvingQuest, setSolvingQuest] = useState<DragonQuest | null>(null);
  const [questInputText, setQuestInputText] = useState('');
  const [questMediaUploaded, setQuestMediaUploaded] = useState<string | null>(null);
  const [isVerifyingQuest, setIsVerifyingQuest] = useState(false);
  const [questRewardCelebration, setQuestRewardCelebration] = useState<{
    quest: DragonQuest;
    xp: number;
    reward: string;
  } | null>(null);

  // Media Submission Form
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'audio' | 'story'>('photo');
  const [newMediaLocation, setNewMediaLocation] = useState('Sunset Beach Dunes');
  const [newMediaPreview, setNewMediaPreview] = useState<string>('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80');
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);
  const [mediaSuccessFeedback, setMediaSuccessFeedback] = useState<DragonMediaSubmission | null>(null);

  // Media Filter in Emulsion Wall
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photo' | 'audio' | 'story'>('all');
  const [inspectingMedia, setInspectingMedia] = useState<DragonMediaSubmission | null>(null);

  // Canvas Ref for Visual Fluid Emulsion
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ----------------------------------------------------
  // Dynamic Canvas Shader / Emulsion Animation Loop
  // ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle System
    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      hue: number;
      alpha: number;
      pulseSpeed: number;
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => {
      let baseHue = 38; // Solar default
      if (selectedAltarElement === 'Abyssal Water') baseHue = 190;
      if (selectedAltarElement === 'Verdant Earth') baseHue = 145;
      if (selectedAltarElement === 'Cosmic Plasma') baseHue = 270;
      if (selectedAltarElement === 'Aether Wind') baseHue = 330;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 1.5,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        hue: baseHue + (Math.random() * 30 - 15),
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      };
    });

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Ambient radial gradient core
      const centerX = width / 2;
      const centerY = height / 2;
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.max(width, height) * 0.6
      );

      let colorStop0 = 'rgba(245, 158, 11, 0.25)'; // Solar Amber
      let colorStop1 = 'rgba(217, 119, 6, 0.08)';
      let colorStop2 = 'rgba(12, 10, 9, 0.0)';

      if (selectedAltarElement === 'Abyssal Water') {
        colorStop0 = 'rgba(6, 182, 212, 0.25)';
        colorStop1 = 'rgba(14, 116, 144, 0.08)';
      } else if (selectedAltarElement === 'Verdant Earth') {
        colorStop0 = 'rgba(16, 185, 129, 0.25)';
        colorStop1 = 'rgba(4, 120, 87, 0.08)';
      } else if (selectedAltarElement === 'Cosmic Plasma') {
        colorStop0 = 'rgba(168, 85, 247, 0.28)';
        colorStop1 = 'rgba(126, 34, 206, 0.09)';
      } else if (selectedAltarElement === 'Aether Wind') {
        colorStop0 = 'rgba(244, 63, 94, 0.25)';
        colorStop1 = 'rgba(190, 18, 60, 0.08)';
      }

      coreGradient.addColorStop(0, colorStop0);
      coreGradient.addColorStop(0.5, colorStop1);
      coreGradient.addColorStop(1, colorStop2);

      ctx.fillStyle = coreGradient;
      ctx.fillRect(0, 0, width, height);

      // Render Emulsion Wave Curvature
      ctx.beginPath();
      ctx.moveTo(0, height * 0.7);
      for (let x = 0; x <= width; x += 20) {
        const waveY =
          height * 0.65 +
          Math.sin(x * 0.008 + time) * 25 +
          Math.cos(x * 0.004 + time * 1.5) * 15;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      waveGrad.addColorStop(0, colorStop1);
      waveGrad.addColorStop(1, 'rgba(12, 10, 9, 0.85)');
      ctx.fillStyle = waveGrad;
      ctx.fill();

      // Render Floating Emulsion Spark Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dynamicAlpha = Math.max(0.1, p.alpha + Math.sin(time * 3 + p.x) * 0.15);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${dynamicAlpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.8)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedAltarElement]);

  // ----------------------------------------------------
  // Generative Web Audio Soundscape Engine
  // ----------------------------------------------------
  const toggleSoundscape = () => {
    if (!soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Drone Oscillator (528 Hz or 432 Hz resonance)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(
          selectedAltarElement === 'Solar Flare' ? 528 :
          selectedAltarElement === 'Abyssal Water' ? 432 :
          selectedAltarElement === 'Verdant Earth' ? 639 :
          selectedAltarElement === 'Cosmic Plasma' ? 963 : 741,
          ctx.currentTime
        );

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        droneOscRef.current = osc;
        droneGainRef.current = gain;
        setSoundEnabled(true);
      } catch (err) {
        console.warn('Web Audio could not be started:', err);
      }
    } else {
      if (droneGainRef.current && audioCtxRef.current) {
        droneGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          droneOscRef.current?.stop();
          audioCtxRef.current?.close();
          audioCtxRef.current = null;
        }, 500);
      }
      setSoundEnabled(false);
    }
  };

  const playChimeTone = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(880, ctx.currentTime);
      chimeOsc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);

      chimeGain.gain.setValueAtTime(0.08, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // Audio chime silent fail
    }
  };

  // ----------------------------------------------------
  // Altar Interaction & Element Shift
  // ----------------------------------------------------
  const handleAttuneElement = (elem: ElementalAffinity) => {
    setSelectedAltarElement(elem);
    setAltarPulsing(true);
    const updated = StorageService.attuneAltar(elem);
    setNestState(updated);
    playChimeTone();

    setLastAltarMessage(`Attuned to ${elem}! Realm resonance elevated to ${updated.realmHarmonicResonance}%.`);
    setTimeout(() => {
      setAltarPulsing(false);
    }, 1200);
    setTimeout(() => {
      setLastAltarMessage(null);
    }, 4500);
  };

  const handlePulseAltar = () => {
    setAltarPulsing(true);
    setAltarEnergyLevel(prev => Math.min(100, prev + 4));
    playChimeTone();

    const nextState = {
      ...nestState,
      realmHarmonicResonance: Math.min(100, nestState.realmHarmonicResonance + 1),
      collectiveDragonXp: nestState.collectiveDragonXp + 25
    };
    StorageService.saveDragonNestState(nextState);
    setNestState(nextState);

    setLastAltarMessage('⚡ Harmonic Telemetry Pulse Dispatched across 900MHz LoRa Mesh (+25 Collective XP)!');
    setTimeout(() => setAltarPulsing(false), 900);
    setTimeout(() => setLastAltarMessage(null), 4000);
  };

  // ----------------------------------------------------
  // Quest Submission & Verification
  // ----------------------------------------------------
  const handleStartQuest = (q: DragonQuest) => {
    setSolvingQuest(q);
    setQuestInputText('');
    setQuestMediaUploaded(null);
  };

  const handleVerifyQuestSubmission = () => {
    if (!solvingQuest) return;
    setIsVerifyingQuest(true);

    setTimeout(() => {
      const result = StorageService.completeDragonQuest(solvingQuest.id, {
        note: questInputText || 'Exploration verified at designated Port Waikato landmark.',
        mediaUrl: questMediaUploaded || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
      });

      setQuests(StorageService.getDragonQuests());
      setNestState(StorageService.getDragonNestState());
      setIsVerifyingQuest(false);
      setSolvingQuest(null);

      playChimeTone();
      setQuestRewardCelebration({
        quest: result.quest,
        xp: result.xpGained,
        reward: result.unlockedReward
      });
    }, 1200);
  };

  // ----------------------------------------------------
  // Media Submission
  // ----------------------------------------------------
  const handleSubmitMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim()) return;

    setIsSubmittingMedia(true);

    setTimeout(() => {
      // Compute AI Vision / Sensory Resonance
      let affinity: ElementalAffinity = selectedAltarElement;
      if (newMediaTitle.toLowerCase().includes('surf') || newMediaTitle.toLowerCase().includes('water') || newMediaTitle.toLowerCase().includes('river')) {
        affinity = 'Abyssal Water';
      } else if (newMediaTitle.toLowerCase().includes('tree') || newMediaTitle.toLowerCase().includes('forest') || newMediaTitle.toLowerCase().includes('bird')) {
        affinity = 'Verdant Earth';
      } else if (newMediaTitle.toLowerCase().includes('star') || newMediaTitle.toLowerCase().includes('sky') || newMediaTitle.toLowerCase().includes('night')) {
        affinity = 'Cosmic Plasma';
      } else if (newMediaTitle.toLowerCase().includes('wind') || newMediaTitle.toLowerCase().includes('story') || newMediaTitle.toLowerCase().includes('tale')) {
        affinity = 'Aether Wind';
      }

      const score = Math.floor(92 + Math.random() * 8);

      const created = StorageService.addDragonMediaSubmission({
        guestName: pass.guestName,
        siteNumber: `Site ${pass.siteNumber} (${pass.zone})`,
        type: newMediaType,
        title: newMediaTitle,
        caption: newMediaCaption || 'Immersion capture logged into the Dragon-9 Collective Realm.',
        location: newMediaLocation,
        mediaPreview: newMediaPreview,
        emulsionColor: affinity === 'Solar Flare' ? '#f59e0b' : affinity === 'Abyssal Water' ? '#06b6d4' : affinity === 'Verdant Earth' ? '#10b981' : affinity === 'Cosmic Plasma' ? '#8b5cf6' : '#ec4899',
        resonanceFrequency: `${affinity === 'Solar Flare' ? '528 Hz' : affinity === 'Abyssal Water' ? '432 Hz' : '639 Hz'} • ${affinity} Pulse`,
        dragonTokensAwarded: Math.floor(60 + Math.random() * 40),
        aiVisionAnalysis: {
          elementalAffinity: affinity,
          aestheticResonanceScore: score,
          realmEffect: `Infuses the Port Waikato telemetry nodes with ${affinity.toLowerCase()} energy.`,
          detectedEntities: [newMediaLocation, `${affinity} Resonance`, 'Guest Capture']
        }
      });

      setMediaList(StorageService.getDragonMediaSubmissions());
      setNestState(StorageService.getDragonNestState());
      setIsSubmittingMedia(false);
      setMediaSuccessFeedback(created);
      setNewMediaTitle('');
      setNewMediaCaption('');

      playChimeTone();
    }, 1000);
  };

  const handleLikeMedia = (id: string) => {
    const updated = StorageService.likeDragonMedia(id);
    setMediaList(updated);
  };

  // Filtered media list
  const filteredMedia = mediaList.filter(m => {
    if (mediaFilter === 'all') return true;
    return m.type === mediaFilter;
  });

  return (
    <div id="dragon-nest-emulsion-portal" className="w-full space-y-5 animate-fadeIn">
      
      {/* Top Banner & Realm Status Bar */}
      <div className="relative bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/80 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden">
        
        {/* Background Canvas Ambient Emulsion Fluid Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Realm Header Branding */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-black bg-amber-500 text-stone-950 flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DRAGON 9 NEST</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-amber-300 bg-amber-950/70 border border-amber-500/30">
                PORT WAIKATO REALM • FULL EMULSION
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LoRa MESH 900MHz ACTIVE</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight flex items-center gap-2">
              <span>The Dragon9 Nest Experience</span>
              <span className="text-amber-400 text-sm font-mono font-normal">
                ({selectedAltarElement} Aura)
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Step into the living sensory realm. Submit exploratory media, complete coastal quests across Sunset Beach dunes & the river delta, and attune the elemental matrix to unlock real park privileges.
            </p>
          </div>

          {/* Top Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Audio Synth Soundscape Toggle */}
            <button
              id="btn-toggle-soundscape"
              onClick={toggleSoundscape}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 border shadow-lg ${
                soundEnabled
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-amber-950/60'
                  : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:text-amber-300'
              }`}
              title="Toggle Generative 528Hz Harmonic Soundscape Synth"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Emulsion Audio Active</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-stone-400" />
                  <span>Audio Synth Muted</span>
                </>
              )}
            </button>

            {onCloseFullscreen && (
              <button
                onClick={onCloseFullscreen}
                className="p-2 rounded-2xl bg-stone-900 text-stone-300 hover:text-white border border-stone-700"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Realm HUD Telemetry Chips */}
        <div className="relative z-10 mt-5 pt-4 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* 1. Realm Harmonic Resonance */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-stone-400">Resonance</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                <span>{nestState.realmHarmonicResonance}%</span>
                <span className="text-[10px] text-emerald-400 font-mono">OPTIMAL</span>
              </div>
            </div>
          </div>

          {/* 2. Elemental Dominance */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-stone-400">Elemental Aura</div>
              <div className="text-sm font-bold text-stone-100 truncate">
                {nestState.activeElementalDominance}
              </div>
            </div>
          </div>

          {/* 3. Collective Dragon XP */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-stone-400">Collective XP</div>
              <div className="text-sm font-black text-purple-300 font-mono">
                {nestState.collectiveDragonXp.toLocaleString()} XP
              </div>
            </div>
          </div>

          {/* 4. Guest Rank & Tier */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-stone-400">Your Rank</div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <span>{nestState.guestDragonRank.title}</span>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-1 rounded">
                  Lvl {nestState.guestDragonRank.tier}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Main Experience Tab Selector */}
      <div className="bg-stone-950 p-1.5 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-1 shadow-lg">
        
        <div className="flex flex-wrap items-center gap-1">
          <button
            id="tab-altar-portal"
            onClick={() => setActiveTab('altar_portal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'altar_portal'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Elemental Altar</span>
          </button>

          <button
            id="tab-realm-quests"
            onClick={() => setActiveTab('realm_quests')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'realm_quests'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Realm Quests</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-400 border border-amber-500/20">
              {quests.filter(q => !q.isCompleted).length}
            </span>
          </button>

          <button
            id="tab-media-well"
            onClick={() => setActiveTab('media_well')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'media_well'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Submit Media</span>
          </button>

          <button
            id="tab-emulsion-wall"
            onClick={() => setActiveTab('emulsion_wall')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'emulsion_wall'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Emulsion Tapestry</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-300">
              {mediaList.length}
            </span>
          </button>

          <button
            id="tab-codex-perks"
            onClick={() => setActiveTab('codex_perks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'codex_perks'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Codex & Perks</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              {nestState.guestDragonRank.unlockedPerks.length} Unlocked
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-xs text-stone-400 px-3 font-mono">
          <span>Pitch: <strong className="text-amber-400">{pass.siteNumber}</strong></span>
          <span>•</span>
          <span>Guest: <strong className="text-stone-200">{pass.guestName.split(' ')[0]}</strong></span>
        </div>

      </div>

      {/* ==================================================== */}
      {/* TAB 1: ELEMENTAL ALTAR & SENSORY MATRIX */}
      {/* ==================================================== */}
      {activeTab === 'altar_portal' && (
        <div className="space-y-6">
          
          {/* Notification Feedback Pill */}
          {lastAltarMessage && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950 via-stone-900 to-stone-900 border border-amber-500/50 rounded-2xl flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span>{lastAltarMessage}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                SYNCED
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Central Altar Core Interactive Visualizer (7 Cols) */}
            <div className="lg:col-span-7 bg-stone-950 rounded-3xl border border-stone-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
              
              {/* Altar Glowing Halo */}
              <div className={`absolute w-72 h-72 rounded-full transition-all duration-700 blur-3xl pointer-events-none opacity-40 ${
                selectedAltarElement === 'Solar Flare' ? 'bg-amber-500' :
                selectedAltarElement === 'Abyssal Water' ? 'bg-cyan-500' :
                selectedAltarElement === 'Verdant Earth' ? 'bg-emerald-500' :
                selectedAltarElement === 'Cosmic Plasma' ? 'bg-purple-600' : 'bg-rose-500'
              }`} />

              {/* Glowing Dragon Egg / Resonant Core */}
              <div className="relative z-10 my-4 flex flex-col items-center">
                
                <div 
                  onClick={handlePulseAltar}
                  className={`w-36 h-48 sm:w-44 sm:h-56 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] cursor-pointer select-none transition-all duration-500 flex flex-col items-center justify-center shadow-2xl relative group ${
                    altarPulsing ? 'scale-105 ring-8 ring-amber-400/60' : 'hover:scale-102 ring-4 ring-amber-500/30'
                  } bg-gradient-to-b ${
                    selectedAltarElement === 'Solar Flare' ? 'from-amber-400 via-orange-600 to-amber-950' :
                    selectedAltarElement === 'Abyssal Water' ? 'from-cyan-300 via-blue-600 to-cyan-950' :
                    selectedAltarElement === 'Verdant Earth' ? 'from-emerald-300 via-emerald-600 to-emerald-950' :
                    selectedAltarElement === 'Cosmic Plasma' ? 'from-purple-300 via-violet-600 to-purple-950' :
                    'from-rose-300 via-rose-600 to-rose-950'
                  }`}
                >
                  <div className="absolute inset-2 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] border-2 border-white/20 pointer-events-none" />
                  
                  {/* Pulsing Core Glyph */}
                  <Flame className="w-12 h-12 text-white animate-pulse drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                  <span className="text-[11px] font-mono font-black text-white/90 uppercase tracking-widest mt-2">
                    {selectedAltarElement}
                  </span>
                  <span className="text-[9px] font-mono text-white/70">
                    Tap to Attune
                  </span>

                  {/* Ripple Ring Effect on Pulse */}
                  {altarPulsing && (
                    <div className="absolute -inset-6 rounded-full border-2 border-amber-400 animate-ping pointer-events-none" />
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    DRAGON9 HARMONIC CORE ALIGNMENT
                  </div>
                  <h3 className="text-lg font-bold text-stone-100">
                    Central Sensory Nexus • Pitch {pass.siteNumber} Gateway
                  </h3>
                  <p className="text-xs text-stone-400 max-w-md">
                    Tap the glowing Dragon Core to transmit a biometric resonance pulse to Port Waikato’s 900MHz mesh grid.
                  </p>
                </div>

                {/* Direct Pulse Trigger Button */}
                <button
                  onClick={handlePulseAltar}
                  className="mt-4 px-5 py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/60 transition-all flex items-center space-x-2 active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Transmit Harmonic Telemetry Pulse</span>
                </button>

              </div>

            </div>

            {/* Elemental Attunements Selector (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-stone-950 rounded-3xl border border-stone-800 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Select Elemental Affinity</span>
                  </h4>
                  <span className="text-[10px] font-mono text-stone-400">5 ATTUNEMENTS</span>
                </div>

                <div className="space-y-2.5">
                  
                  {/* 1. Solar Flare */}
                  <button
                    onClick={() => handleAttuneElement('Solar Flare')}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedAltarElement === 'Solar Flare'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Solar Flare (Sunset Dunes)</div>
                        <div className="text-[11px] text-stone-400">528 Hz • Sunset Beach solar peak & black sand warmth</div>
                      </div>
                    </div>
                    {selectedAltarElement === 'Solar Flare' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>

                  {/* 2. Abyssal Water */}
                  <button
                    onClick={() => handleAttuneElement('Abyssal Water')}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedAltarElement === 'Abyssal Water'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/30'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Waves className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Abyssal Water (Waikato River Delta)</div>
                        <div className="text-[11px] text-stone-400">432 Hz • Ocean bar swell & tidal river ebb currents</div>
                      </div>
                    </div>
                    {selectedAltarElement === 'Abyssal Water' && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>

                  {/* 3. Verdant Earth */}
                  <button
                    onClick={() => handleAttuneElement('Verdant Earth')}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedAltarElement === 'Verdant Earth'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TreePine className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Verdant Earth (Pine & Puriri Forest)</div>
                        <div className="text-[11px] text-stone-400">639 Hz • Native canopy oxygen, fern gullies & resin</div>
                      </div>
                    </div>
                    {selectedAltarElement === 'Verdant Earth' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>

                  {/* 4. Cosmic Plasma */}
                  <button
                    onClick={() => handleAttuneElement('Cosmic Plasma')}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedAltarElement === 'Cosmic Plasma'
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Cosmic Plasma (Starlink & Dark Sky)</div>
                        <div className="text-[11px] text-stone-400">963 Hz • Bortle-2 celestial dome & satellite gateway</div>
                      </div>
                    </div>
                    {selectedAltarElement === 'Cosmic Plasma' && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                  </button>

                  {/* 5. Aether Wind */}
                  <button
                    onClick={() => handleAttuneElement('Aether Wind')}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedAltarElement === 'Aether Wind'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <Wind className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Aether Wind (Campfire Tales)</div>
                        <div className="text-[11px] text-stone-400">741 Hz • Tasman breeze & community campfire lore</div>
                      </div>
                    </div>
                    {selectedAltarElement === 'Aether Wind' && <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>

                </div>

              </div>

              {/* LoRa Telemetry Altar Broadcast info */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-2xl flex items-center justify-between text-xs text-stone-300">
                <div className="flex items-center space-x-3">
                  <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <div className="font-bold text-stone-100">Altar Mesh Transmitter Active</div>
                    <div className="text-[11px] text-stone-400">900MHz LoRa node • Latency: 32ms</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  TRANSMITTING
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: REALM QUESTS (EXPLORING THE PARK & DUNES) */}
      {/* ==================================================== */}
      {activeTab === 'realm_quests' && (
        <div className="space-y-6">
          
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REALM EXPLORATION QUESTS
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {quests.filter(q => q.isCompleted).length} of {quests.length} Completed
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-100 mt-1">
                Port Waikato Sensory & Geographical Quests
              </h3>
              <p className="text-xs text-stone-400">
                Explore real park landmarks, dunes, and wharf lookouts. Complete challenges to earn Dragon XP, rank promotions, and real redeemable perks.
              </p>
            </div>

            {/* Quick Filter */}
            <div className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30 self-start sm:self-center">
              Collective Pool: +{quests.reduce((acc, q) => acc + q.dragonXp, 0)} Total XP
            </div>
          </div>

          {/* Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  quest.isCompleted
                    ? 'bg-stone-950/80 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-stone-950 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                
                <div className="space-y-3">
                  
                  {/* Quest Sector & Difficulty Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                      {quest.realmSector}
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        quest.difficulty === 'Initiate' ? 'bg-blue-950 text-blue-300' :
                        quest.difficulty === 'Explorer' ? 'bg-amber-950 text-amber-300' :
                        quest.difficulty === 'Master' ? 'bg-purple-950 text-purple-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {quest.difficulty.toUpperCase()}
                      </span>

                      <span className="text-xs font-black text-amber-400 font-mono">
                        +{quest.dragonXp} XP
                      </span>
                    </div>
                  </div>

                  {/* Quest Title & Description */}
                  <div>
                    <h4 className="text-base font-bold text-stone-100 flex items-center gap-2">
                      <span>{quest.title}</span>
                      {quest.isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </h4>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      {quest.description}
                    </p>
                  </div>

                  {/* Clue Box */}
                  <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 text-xs text-stone-400 flex items-start space-x-2">
                    <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Landmark Clue:</strong> {quest.clue}</span>
                  </div>

                  {/* Unlocked Reward Preview */}
                  <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 text-xs text-amber-200 flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Unlocks:</strong> {quest.unlockedReward}</span>
                  </div>

                  {/* If Completed, show submission note */}
                  {quest.isCompleted && quest.guestSubmission && (
                    <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                      ✓ Completed {quest.completedAt}: {quest.guestSubmission.note}
                    </div>
                  )}

                </div>

                {/* Quest Action Button */}
                <div>
                  {quest.isCompleted ? (
                    <div className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center space-x-1.5 select-none">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Quest Accomplished (+{quest.dragonXp} XP Awarded)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartQuest(quest)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all flex items-center justify-center space-x-1.5 shadow-md active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Embark & Submit Verification</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: MEDIA SUBMISSION & SENSORY WELL */}
      {/* ==================================================== */}
      {activeTab === 'media_well' && (
        <div className="space-y-6">
          
          {/* Submission Success Alert */}
          {mediaSuccessFeedback && (
            <div className="p-4 bg-emerald-950 border border-emerald-500/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 animate-fadeIn shadow-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">
                    Media Successfully Projected into the Dragon9 Realm!
                  </div>
                  <p className="text-emerald-300 text-xs">
                    "{mediaSuccessFeedback.title}" analyzed: {mediaSuccessFeedback.aiVisionAnalysis.elementalAffinity} (Resonance: {mediaSuccessFeedback.aiVisionAnalysis.aestheticResonanceScore}%). Awarded +{mediaSuccessFeedback.dragonTokensAwarded} Tokens!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('emulsion_wall')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-stone-950 hover:bg-emerald-400 transition-colors whitespace-nowrap self-start sm:self-center"
              >
                View on Emulsion Tapestry →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Media Submission Form (7 Cols) */}
            <div className="lg:col-span-7 bg-stone-950 rounded-3xl border border-stone-800 p-6 space-y-5 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                  THE SENSORY WELL
                </span>
                <h3 className="text-xl font-bold text-stone-100 mt-1">
                  Submit Media & Explore the Realm
                </h3>
                <p className="text-xs text-stone-400">
                  Upload your sunset photos, hydrophone river wave sounds, or campsite legends. The Dragon-9 AI Vision engine analyzes your submission and projects it onto the collective park wall.
                </p>
              </div>

              <form onSubmit={handleSubmitMedia} className="space-y-4">
                
                {/* Media Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">Media Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewMediaType('photo');
                        setNewMediaPreview('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        newMediaType === 'photo'
                          ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Photo Capture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewMediaType('audio');
                        setNewMediaPreview('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        newMediaType === 'audio'
                          ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Recording</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewMediaType('story');
                        setNewMediaPreview('https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=900&q=80');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        newMediaType === 'story'
                          ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      <Feather className="w-3.5 h-3.5" />
                      <span>Campfire Tale</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300">Media Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunset Beach Liquid Gold Swell..."
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300">Discovery Location</label>
                  <select
                    value={newMediaLocation}
                    onChange={(e) => setNewMediaLocation(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sunset Beach Dunes">Sunset Beach Dunes (West Point)</option>
                    <option value="Waikato River Wharf">Waikato River Wharf & Delta</option>
                    <option value="Nikau Pinecrest Trail">Nikau Pinecrest Trail (Zone Beta)</option>
                    <option value="Campfire Altar #3">Campfire Altar #3 (Zone Gamma)</option>
                    <option value="Geodesic Glade Stargaze">Geodesic Glade (Zone Delta)</option>
                  </select>
                </div>

                {/* Caption / Story */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300">Caption or Sensory Reflection</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you witnessed, heard, or felt..."
                    value={newMediaCaption}
                    onChange={(e) => setNewMediaCaption(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmittingMedia || !newMediaTitle.trim()}
                  className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
                >
                  {isSubmittingMedia ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Vision & Resonance Frequencies...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit to Collective Emulsion Tapestry</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* AI Vision & Resonance Analyzer Preview Box (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-stone-950 rounded-3xl border border-stone-800 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>AI Vision & Resonance Preview</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                    STANDBY
                  </span>
                </div>

                {/* Live Image Frame */}
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-stone-800 group shadow-inner">
                  <img
                    src={newMediaPreview}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-stone-200">
                    <span className="font-bold truncate">{newMediaTitle || 'Media Artifact'}</span>
                    <span className="font-mono text-amber-400 text-[10px] bg-stone-900/80 px-2 py-0.5 rounded">
                      {newMediaLocation}
                    </span>
                  </div>
                </div>

                {/* Telemetry Matrix Simulated Metrics */}
                <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-300">
                    <span>Aesthetic Harmonic Resonance:</span>
                    <strong className="text-emerald-400 font-mono">98.4% (Calculated)</strong>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Elemental Resonance:</span>
                    <strong className="text-amber-400">{selectedAltarElement}</strong>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Awarded Dragon Tokens:</span>
                    <strong className="text-purple-300 font-mono">+75 TOKENS</strong>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Upon submission, this artifact instantly updates the park-wide ambient colour shaders and elevates the Dragon9 Collective Resonance score.
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: COLLECTIVE REALM EMULSION TAPESTRY */}
      {/* ==================================================== */}
      {activeTab === 'emulsion_wall' && (
        <div className="space-y-6">
          
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  COLLECTIVE REALM TAPESTRY
                </span>
                <span className="text-xs text-stone-400 font-mono">{mediaList.length} Realm Submissions</span>
              </div>
              <h3 className="text-lg font-bold text-stone-100 mt-1">
                Guest Community Emulsion Gallery
              </h3>
              <p className="text-xs text-stone-400">
                Explore captures, sounds, and campfire legends submitted by your fellow holiday park guests.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-center">
              <button
                onClick={() => setMediaFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mediaFilter === 'all' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All ({mediaList.length})
              </button>
              <button
                onClick={() => setMediaFilter('photo')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mediaFilter === 'photo' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => setMediaFilter('audio')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mediaFilter === 'audio' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => setMediaFilter('story')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mediaFilter === 'story' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Stories
              </button>
            </div>
          </div>

          {/* Emulsion Wall Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-stone-950 rounded-3xl border border-stone-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl group"
              >
                
                {/* Media Image Frame */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                  <img
                    src={item.mediaPreview}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                  
                  {/* Top Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      {item.type.toUpperCase()}
                    </span>
                    <span 
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-md text-stone-200 border border-stone-700"
                      style={{ color: item.emulsionColor }}
                    >
                      {item.aiVisionAnalysis.elementalAffinity}
                    </span>
                  </div>

                  {/* Resonance Frequency Badge */}
                  <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-stone-300 bg-stone-900/90 px-2 py-0.5 rounded border border-stone-800">
                    {item.resonanceFrequency}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span className="font-bold text-stone-300">{item.guestName}</span>
                      <span className="font-mono text-amber-400">{item.siteNumber}</span>
                    </div>

                    <h4 className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  {/* Entity Tags & AI Score */}
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <span>{item.aiVisionAnalysis.aestheticResonanceScore}% Resonance</span>
                    </div>

                    {/* Resonant Like Button */}
                    <button
                      onClick={() => handleLikeMedia(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        item.hasLiked
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span>{item.likesCount}</span>
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: CODEX & UNLOCKED PERKS VAULT */}
      {/* ==================================================== */}
      {activeTab === 'codex_perks' && (
        <div className="space-y-6">
          
          {/* Guest Progression Banner */}
          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-purple-950/70 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20 inline-block mb-1">
                  DRAGON CODEX • TIER {nestState.guestDragonRank.tier} OF 5
                </div>
                <h3 className="text-xl font-black text-stone-100 flex items-center gap-2">
                  <span>{nestState.guestDragonRank.title}</span>
                  <span className="text-xs font-mono font-normal text-amber-400">
                    ({nestState.guestDragonRank.currentXp} / {nestState.guestDragonRank.nextTierXp} XP)
                  </span>
                </h3>
              </div>

              <div className="text-xs font-mono text-stone-300">
                Next Rank: <strong className="text-purple-300">
                  {nestState.guestDragonRank.tier === 1 ? 'Dune Wayfarer' :
                   nestState.guestDragonRank.tier === 2 ? 'Tide Alchemist' :
                   nestState.guestDragonRank.tier === 3 ? 'Starlink Sentinel' : 'Dragon Sovereign'}
                </strong>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full space-y-1">
              <div className="w-full bg-stone-900 rounded-full h-3.5 border border-stone-800 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{
                    width: `${Math.min(100, (nestState.guestDragonRank.currentXp / nestState.guestDragonRank.nextTierXp) * 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-stone-400">
                <span>Current: {nestState.guestDragonRank.currentXp} XP</span>
                <span>Tier Goal: {nestState.guestDragonRank.nextTierXp} XP</span>
              </div>
            </div>

          </div>

          {/* Unlocked Perks Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Your Unlocked Park Perks & Digital Vouchers</span>
              </h4>
              <span className="text-[10px] font-mono text-stone-400">
                {nestState.guestDragonRank.unlockedPerks.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nestState.guestDragonRank.unlockedPerks.map((perk) => (
                <div
                  key={perk.id}
                  className="bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg hover:border-amber-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                      VERIFIED VOUCHER
                    </div>
                    <h5 className="text-sm font-bold text-stone-100">{perk.name}</h5>
                    <div className="text-xs font-mono text-amber-400">Code: {perk.code}</div>
                    <div className="text-[11px] text-stone-400">{perk.expiry}</div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                    <QrCode className="w-8 h-8 text-stone-200" />
                    <span className="text-[9px] font-mono text-stone-400 mt-1">TAP TO SCAN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: QUEST SOLVER / SENSORY SUBMISSION */}
      {/* ==================================================== */}
      {solvingQuest && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Embark: {solvingQuest.title}
                </h3>
              </div>
              <button
                onClick={() => setSolvingQuest(null)}
                className="text-stone-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-300">
              <p className="leading-relaxed">{solvingQuest.description}</p>
              
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                <div className="font-bold text-amber-400">Verification Objective:</div>
                <div>{solvingQuest.verificationPrompt}</div>
              </div>

              {/* Input for Verification */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-200">Your Field Verification / Observation Note:</label>
                <textarea
                  rows={3}
                  value={questInputText}
                  onChange={(e) => setQuestInputText(e.target.value)}
                  placeholder="Record your observation or enter verification code..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Simulated Camera / Media Select */}
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-stone-400">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Attach Field Snapshot (Auto-GeoTagged)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">GPS VERIFIED</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSolvingQuest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isVerifyingQuest}
                onClick={handleVerifyQuestSubmission}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-1.5 shadow-lg"
              >
                {isVerifyingQuest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Coordinates & Telemetry...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Claim +{solvingQuest.dragonXp} XP</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* CELEBRATION MODAL: QUEST COMPLETED */}
      {/* ==================================================== */}
      {questRewardCelebration && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-scaleIn">
            
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/30">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                QUEST ACCOMPLISHED!
              </span>
              <h3 className="text-xl font-black text-stone-100">
                {questRewardCelebration.quest.title}
              </h3>
              <p className="text-xs text-stone-300">
                Your exploration has resonated through the Dragon9 Nest telemetry nodes!
              </p>
            </div>

            <div className="p-4 bg-stone-950/80 rounded-2xl border border-amber-500/40 space-y-2">
              <div className="text-lg font-black text-amber-400 font-mono">
                +{questRewardCelebration.xp} DRAGON XP
              </div>
              <div className="text-xs text-stone-200">
                <strong>Unlocked Reward:</strong> {questRewardCelebration.reward}
              </div>
            </div>

            <button
              onClick={() => {
                setQuestRewardCelebration(null);
                setActiveTab('codex_perks');
              }}
              className="w-full py-3 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg"
            >
              Claim Reward in Perk Vault →
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
