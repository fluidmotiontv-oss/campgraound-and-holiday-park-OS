/**
 * Dragon 9 Framework, Boarding Pass Protocol & Fluid Motion Types
 */

export type ParkNodeCategory = 
  | 'grid_site'
  | 'utility_energy'
  | 'safety_ranger'
  | 'gate_iot'
  | 'sanitation_waste'
  | 'event_activities'
  | 'hazard_weather'
  | 'inventory_retail'
  | 'ledger_yield';

export interface DragonNode {
  id: string;
  number: number; // 1-9
  code: string;
  name: string;
  category: ParkNodeCategory;
  status: 'nominal' | 'active' | 'warning' | 'critical' | 'offline';
  healthScore: number; // 0-100
  metricLabel: string;
  metricValue: string | number;
  secondaryMetric?: string;
  subsystemCount: number;
  lastAutonomousAction: string;
  lastActionTimestamp: string;
  iconName: string;
  description: string;
  autoHealEnabled: boolean;
}

export type SiteType = 'rv_powered_50a' | 'rv_powered_30a' | 'glamping_safari' | 'cabin_luxury' | 'tent_riverside' | 'tent_primitive';
export type SiteStatus = 'occupied' | 'reserved' | 'available' | 'maintenance' | 'cleaning_needed';

export interface CampSite {
  id: string;
  number: string;
  name: string;
  type: SiteType;
  zone: 'Zone Alpha (River)' | 'Zone Beta (Pines)' | 'Zone Gamma (Ridge)' | 'Zone Delta (Glade)';
  status: SiteStatus;
  maxOccupancy: number;
  currentGuestName?: string;
  currentPassToken?: string;
  powerDrawWatts: number;
  waterFlowGpm: number;
  smartLockCode: string;
  coordinates: { x: number; y: number }; // normalized 0-100%
  pricePerNight: number;
  rating: number;
}

export interface BoardingPass {
  id: string;
  passToken: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  siteId: string;
  siteNumber: string;
  siteType: string;
  zone: string;
  checkInDate: string;
  checkOutDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  partySize: number;
  smartLockCode: string;
  wifiKey: string;
  amenityAccess: string[]; // e.g. ['Pool & Sauna', 'Clubhouse Starlink', 'Kayak Launch', 'Laundry B', 'EV Supercharger']
  firePermitStatus: 'granted' | 'restricted' | 'banned';
  cryptographicSignature: string;
  offlineTotpHash: string; // Dynamic offline verification code
  issuedAt: string;
  expiresAt: string;
  gateAccessLogs: GateAccessEvent[];
  equipmentRentals: EquipmentRental[];
}

export interface GateAccessEvent {
  id: string;
  timestamp: string;
  gateId: string;
  gateName: string;
  method: 'offline_qr' | 'ble_proximity' | 'anpr_plate' | 'nfc_pass';
  authorized: boolean;
  notes?: string;
}

export interface EquipmentRental {
  id: string;
  item: string;
  category: string;
  code: string;
  status: 'active' | 'returned';
  dueTime: string;
  lockerNumber: string;
}

export interface WeatherHazard {
  wildfireDangerIndex: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  windSpeedMph: number;
  windGustMph: number;
  temperatureF: number;
  humidityPercent: number;
  barometricPressureInHg: number;
  lightningDetectedKm?: number;
  flashFloodRisk: boolean;
  activeAdvisory?: string;
}

export interface EnergyTelemetry {
  solarGenerationKw: number;
  batteryStoragePercent: number;
  gridDrawKw: number;
  microgridStatus: 'islanded' | 'grid_tied' | 'generator_assisted';
  peakLoadSheddingActive: boolean;
  waterReservoirLevelPercent: number;
  greywaterTanksFillPercent: number;
}

export interface AutonomousExecutiveLog {
  id: string;
  timestamp: string;
  severity: 'info' | 'decision' | 'optimization' | 'mitigation' | 'emergency';
  pillar: string;
  title: string;
  description: string;
  actionTaken: string;
  autonomousAgent: 'Dragon-9 Core' | 'BoardingPass Engine' | 'Fluid Dispatch' | 'Gemini Executive';
  status: 'completed' | 'monitoring' | 'executing';
}

export interface OfflineSyncQueueItem {
  id: string;
  timestamp: string;
  actionType: 'check_in' | 'gate_event' | 'lock_code_update' | 'amenity_redeem' | 'hazard_ack' | 'site_reallocate';
  payload: any;
  status: 'synced' | 'pending' | 'conflict_resolved';
  checksum: string;
}

export type BusinessCategory = 
  | 'food_beverage'
  | 'surf_recreation'
  | 'cultural_nature'
  | 'community_services'
  | 'local_trades'
  | 'retail_craft';

export interface CommunityBusiness {
  id: string;
  name: string;
  category: BusinessCategory;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  email: string;
  hours: string;
  bookingAvailable: boolean;
  bookableServices?: Array<{
    id: string;
    title: string;
    duration: string;
    priceNzd: number;
    description: string;
  }>;
  specialOffer?: string;
  badge?: string;
  features: string[];
}

export interface CommunityNotice {
  id: string;
  title: string;
  category: 'tide_safety' | 'community_event' | 'kaitiaki_environment' | 'council_alert' | 'market';
  timestamp: string;
  content: string;
  author: string;
  urgency: 'routine' | 'advisory' | 'critical';
  pinned?: boolean;
}

export interface PortWaikatoMarineConditions {
  tideState: 'Rising' | 'Falling' | 'High Tide' | 'Low Tide';
  nextHighTide: string;
  nextLowTide: string;
  tideHeightMeters: number;
  surfHeightMeters: number;
  surfQuality: 'Fair' | 'Good' | 'Epic' | 'Rough';
  waterTempC: number;
  barCrossingRisk: 'Low / Safe' | 'Moderate / Caution' | 'Dangerous / Closed';
  windKnots: number;
  windDirection: string;
  uvIndex: number;
}

export interface SiteBookingForm {
  siteId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  checkInDate: string;
  checkOutDate: string;
  partySize: number;
  selectedAddOns: string[];
  specialRequests?: string;
}

export interface ExperienceBookingForm {
  businessId: string;
  serviceId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  bookingDate: string;
  timeSlot: string;
  guestsCount: number;
  notes?: string;
}

export type ElementalAffinity = 'Solar Flare' | 'Abyssal Water' | 'Verdant Earth' | 'Aether Wind' | 'Cosmic Plasma';

export interface DragonQuest {
  id: string;
  title: string;
  realmSector: 'Sunset Dunes' | 'Ancient River Delta' | 'Pinecrest Canopy' | 'Cosmic Starlink Altar' | 'Bioluminescent Glade';
  difficulty: 'Initiate' | 'Explorer' | 'Master' | 'Legendary';
  dragonXp: number;
  description: string;
  clue: string;
  actionType: 'photo_capture' | 'sound_record' | 'altar_resonance' | 'eco_pledge' | 'trivia_unlock';
  verificationPrompt: string;
  unlockedReward: string;
  rewardCategory: 'voucher' | 'perk' | 'amenity' | 'badge';
  isCompleted: boolean;
  completedAt?: string;
  guestSubmission?: {
    mediaUrl?: string;
    note?: string;
    sensoryData?: string;
  };
}

export interface DragonMediaSubmission {
  id: string;
  guestName: string;
  siteNumber: string;
  type: 'photo' | 'audio' | 'story' | 'artifact' | 'sensor_reading';
  title: string;
  caption: string;
  location: string;
  timestamp: string;
  mediaPreview: string;
  emulsionColor: string;
  resonanceFrequency: string;
  dragonTokensAwarded: number;
  aiVisionAnalysis: {
    elementalAffinity: ElementalAffinity;
    aestheticResonanceScore: number; // 0 - 100
    realmEffect: string;
    detectedEntities: string[];
  };
  likesCount: number;
  hasLiked?: boolean;
}

export interface DragonNestEmulsionState {
  realmHarmonicResonance: number; // 0-100%
  activeElementalDominance: ElementalAffinity;
  realmPulseBpm: number;
  collectiveDragonXp: number;
  guestDragonRank: {
    title: string;
    tier: number; // 1 to 5
    currentXp: number;
    nextTierXp: number;
    unlockedPerks: Array<{
      id: string;
      name: string;
      code: string;
      expiry: string;
      claimed: boolean;
    }>;
  };
  activeEmulsionShader: 'aurora_fluid' | 'solar_embers' | 'bioluminescent_tides' | 'cosmic_mesh';
  soundscapePlaying: boolean;
}

export interface CapacityThresholdConfig {
  maxPeakPowerKw: number; // e.g. 36 kW
  maxOccupancyPercent: number; // e.g. 85%
  minReservoirPercent: number; // e.g. 35%
  maxEvLoadKw: number; // e.g. 14 kW
  maxDailyWaterLiters: number; // e.g. 10000 L
  maxMeshPacketsDaily: number; // e.g. 50k
  autoMitigate: boolean;
  soundAlerts: boolean;
}

export interface ResourceCapacityAlert {
  id: string;
  timestamp: string;
  resourceType: 'power' | 'occupancy' | 'water' | 'ev_charging' | 'mesh_network';
  severity: 'critical' | 'high' | 'warning';
  dayTarget: string; // e.g. 'Sat, Aug 29' or 'Today (Peak 18:00)'
  dayIndex: number;
  predictedValue: number;
  thresholdValue: number;
  unit: string;
  headline: string;
  details: string;
  recommendedAction: string;
  actionPayloadKey: string;
  isAcknowledged: boolean;
  isRemediated: boolean;
  remediationNote?: string;
}

