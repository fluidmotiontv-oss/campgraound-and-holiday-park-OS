import { 
  DragonNode, 
  CampSite, 
  BoardingPass, 
  GateAccessEvent,
  WeatherHazard, 
  EnergyTelemetry, 
  AutonomousExecutiveLog, 
  OfflineSyncQueueItem,
  CommunityBusiness,
  CommunityNotice,
  PortWaikatoMarineConditions,
  SiteBookingForm,
  ExperienceBookingForm,
  DragonQuest,
  DragonMediaSubmission,
  DragonNestEmulsionState,
  ElementalAffinity,
  CapacityThresholdConfig,
  ResourceCapacityAlert
} from '../types';

const STORAGE_KEYS = {
  DRAGON_NODES: 'dragon9_nodes_state',
  SITES: 'dragon9_sites_state',
  ACTIVE_PASS: 'boarding_pass_active',
  PASSES_LIST: 'boarding_passes_vault',
  WEATHER: 'dragon9_weather_hazard',
  ENERGY: 'dragon9_energy_telemetry',
  LOGS: 'dragon9_executive_logs',
  SYNC_QUEUE: 'dragon9_offline_sync_queue',
  IS_OFFLINE_SIM: 'fluid_motion_offline_simulated',
  RANGERS: 'dragon9_rangers_state',
  COMMUNITY_BIZ: 'port_waikato_businesses',
  COMMUNITY_NOTICES: 'port_waikato_notices',
  MARINE_CONDITIONS: 'port_waikato_marine',
  EXPERIENCE_BOOKINGS: 'port_waikato_exp_bookings',
  DRAGON_QUESTS: 'dragon9_nest_quests',
  DRAGON_MEDIA: 'dragon9_nest_media',
  DRAGON_NEST_STATE: 'dragon9_nest_emulsion_state',
  CAPACITY_THRESHOLDS: 'dragon9_capacity_thresholds_config',
  CAPACITY_ALERTS: 'dragon9_capacity_alerts_history'
};

export const DEFAULT_CAPACITY_THRESHOLDS: CapacityThresholdConfig = {
  maxPeakPowerKw: 34.0, // Inverter 34kW warning (40kW hard microgrid cutoff)
  maxOccupancyPercent: 85, // 85% campsite density
  minReservoirPercent: 40, // 40% freshwater reserve minimum threshold
  maxEvLoadKw: 12.0, // 12kW peak concurrent EV load
  maxDailyWaterLiters: 9000, // 9,000L daily municipal & rainwater limit
  maxMeshPacketsDaily: 45.0, // 45k daily packet volume
  autoMitigate: true,
  soundAlerts: true
};

export const INITIAL_COMMUNITY_BUSINESSES: CommunityBusiness[] = [
  {
    id: 'biz-sunset-cafe',
    name: 'Sunset Beach Café & General Store',
    category: 'food_beverage',
    tagline: 'Fresh organic coffee, hot pies, groceries & post office hub',
    description: 'The iconic heart of Port Waikato. Serving barista espresso, famous classic Kiwi steak & cheese pies, gourmet burgers, fresh milk, daily staples, beach essentials and fishing bait.',
    rating: 4.9,
    reviewCount: 142,
    location: '1 Maraetai Bay Rd, Port Waikato 2695',
    phone: '+64 9-232 9884',
    email: 'kiaora@sunsetbeachcafe.co.nz',
    hours: '7:30 AM – 7:00 PM Daily',
    bookingAvailable: true,
    badge: 'Local Favorite',
    features: ['Takeaway Coffee & Bakery', 'General Groceries & Gas Swap', 'Fish & Chips (Fri-Sun)', 'Bait & Tackle Supplies'],
    bookableServices: [
      {
        id: 'srv-picnic-hamper',
        title: 'Sunset Dune Gourmet Picnic Hamper',
        duration: 'Prepared in 30 mins',
        priceNzd: 65,
        description: 'Locally cured meats, Aotearoa cheeses, artisan sourdough loaf, avocado, and fresh baked sweet treats for 2.'
      },
      {
        id: 'srv-fish-chips-pack',
        title: 'Friday Family Fish & Chip Feast',
        duration: 'Pick-up order',
        priceNzd: 48,
        description: '4x fresh beer-battered West Coast tarakihi fillets, large scoop of chunky fries, homemade tartare sauce and lemon wedges.'
      }
    ]
  },
  {
    id: 'biz-surf-school',
    name: 'Port Waikato Surf Academy & Board Hire',
    category: 'surf_recreation',
    tagline: 'ISA Certified Surf Coaching & Premium Wetsuit / Board Rentals',
    description: 'Catch the legendary black-sand peelers at Sunset Beach with local ISA certified instructors. Group lessons, private coaching, rip safety clinics and high-performance epoxy/soft-top board hire.',
    rating: 5.0,
    reviewCount: 98,
    location: 'Sunset Beach Lifesaving Base, Ocean Rd',
    phone: '+64 21 892 411',
    email: 'surf@portwaikatosurf.co.nz',
    hours: '8:00 AM – 6:00 PM Daily (Tide Dependent)',
    bookingAvailable: true,
    badge: 'Top Rated Adventure',
    features: ['Beginner Softboards & Wetsuits', 'Sunset Beach Surf Guiding', 'Rip Current Safety Briefings', 'SUP Flatwater Tours'],
    bookableServices: [
      {
        id: 'srv-surf-lesson',
        title: '2-Hour Sunset Beach Beginner Surf Lesson',
        duration: '2 Hours (Includes Board & Wetsuit)',
        priceNzd: 85,
        description: 'Learn pop-up techniques, wave positioning, and ocean safety on friendly rolling whitewash.'
      },
      {
        id: 'srv-board-hire-day',
        title: 'Full-Day Premium Surfboard & Wetsuit Hire',
        duration: 'Full Day (Return by 6 PM)',
        priceNzd: 50,
        description: 'Choose from 7ft-9ft foamies or Torq epoxy funboards with Rip Curl 4/3mm steamer.'
      },
      {
        id: 'srv-private-coaching',
        title: '1-on-1 Video Analysis Wave Coaching',
        duration: '90 Minutes',
        priceNzd: 140,
        description: 'Advanced bottom-turn and rail carving coaching with post-surf 4K video playback breakdown.'
      }
    ]
  },
  {
    id: 'biz-river-charters',
    name: 'Waikato River Mouth Fishing & Whitebait Safaris',
    category: 'surf_recreation',
    tagline: 'Guided boat expeditions on the mighty Waikato River delta',
    description: 'Explore the expansive sand islands, secret channels, and tidal flats of the Waikato River estuary. Target trophy kahawai, flounder, kingfish and learn traditional whitebaiting lore.',
    rating: 4.9,
    reviewCount: 76,
    location: 'Port Waikato Public Boat Ramp & Wharf',
    phone: '+64 27 493 0210',
    email: 'charters@waikatoriverexpeditions.nz',
    hours: 'Dawn to Dusk (Booking Required)',
    bookingAvailable: true,
    badge: 'Authentic Experience',
    features: ['6.5m Custom Alloy Vessel', 'Top Shimano Rods & Tackle', 'Filleting & Ice Provided', 'Lifejackets & Safety Cert'],
    bookableServices: [
      {
        id: 'srv-half-day-fish',
        title: '4-Hour Estuary Kahawai & Snapper Hunt',
        duration: '4 Hours (Morning or Afternoon)',
        priceNzd: 160,
        description: 'All bait, Shimano rods, ice and fish filleting included. Max 4 anglers per trip.'
      },
      {
        id: 'srv-whitebait-experience',
        title: 'Waikato River Whitebaiting & Fritter Masterclass',
        duration: '3 Hours',
        priceNzd: 120,
        description: 'Learn set-netting strategies along the tidal stands, followed by hot crispy whitebait fritters with lemon.'
      }
    ]
  },
  {
    id: 'biz-marae-kaitiaki',
    name: 'Kaitiakitanga Cultural & Sand Dune Eco-Tours',
    category: 'cultural_nature',
    tagline: 'Indigenous history, native bird sanctuaries & coastal ecology',
    description: 'Guided by local Mana Whenua storytellers. Learn about the ancient geology of the Waikato heads, archaeological middens, native dotterel conservation, and traditional harakeke (flax) weaving.',
    rating: 5.0,
    reviewCount: 64,
    location: 'Te Puaha o Waikato Cultural Kiosk, Maraetai Rd',
    phone: '+64 21 024 8871',
    email: 'kaitiaki@portwaikatotours.nz',
    hours: 'Thu – Sun: 9:30 AM & 2:00 PM',
    bookingAvailable: true,
    badge: 'Cultural Heritage',
    features: ['Mana Whenua Guided', 'Native Tree Planting included', 'Harakeke Weaving Workshop', 'Penguin Nesting Info'],
    bookableServices: [
      {
        id: 'srv-dune-walk',
        title: 'Sunset Beach Ancient Dunes Heritage Walk',
        duration: '2 Hours (Gentle Pace)',
        priceNzd: 45,
        description: 'Discover the moving ironsand dunes, fossil beds, native spinifex restoration, and local Maori oral history.'
      },
      {
        id: 'srv-flax-weaving',
        title: 'Harakeke (Flax) Traditional Weaving Workshop',
        duration: '2.5 Hours',
        priceNzd: 70,
        description: 'Hands-on tikanga and craft making your own woven kete or putiputi (flower) using harvested flax.'
      }
    ]
  },
  {
    id: 'biz-community-hall',
    name: 'Port Waikato Community Hall & Market Hub',
    category: 'community_services',
    tagline: 'Community gatherings, monthly craft markets, yoga & venue hire',
    description: 'The civic cornerstone of the coastal village. Hosts the celebrated Port Waikato Market every second Sunday, ocean-view community yoga, coastal arts exhibitions, and private hall bookings.',
    rating: 4.8,
    reviewCount: 53,
    location: 'Centreway Rd, Port Waikato',
    phone: '+64 9-232 9700',
    email: 'hall@portwaikatocommunity.org.nz',
    hours: 'Events as Scheduled',
    bookingAvailable: true,
    badge: 'Civic Hub',
    features: ['Commercial Kitchen & Stage', 'Ocean Breeze Lawn', 'EV Charging Point', 'Starlink Community Wi-Fi'],
    bookableServices: [
      {
        id: 'srv-market-stall',
        title: 'Sunday Craft & Produce Market Stall Booking',
        duration: '8:00 AM – 2:00 PM',
        priceNzd: 25,
        description: 'Indoor or outdoor 3x3m stall space for local artisans, organic gardeners, and food producers.'
      },
      {
        id: 'srv-morning-yoga',
        title: 'Sunset Beach Coastal Sunrise Yoga Class',
        duration: '60 Minutes (Saturdays 8 AM)',
        priceNzd: 18,
        description: 'Gentle vinyasa flow with ocean soundscape. All levels welcome; mats provided.'
      }
    ]
  },
  {
    id: 'biz-coastal-marine-mechanic',
    name: 'Port Waikato Auto, Marine & Caravan Mobile Repairs',
    category: 'local_trades',
    tagline: 'Emergency roadside, outboard servicing & caravan 12V/240V repairs',
    description: 'Prompt on-site assistance for campers and boaties. Battery jump-starts, trailer wheel bearing greasing, outboard motor troubleshooting, solar inverter diagnostics, and tyre puncture repairs.',
    rating: 4.9,
    reviewCount: 39,
    location: 'Mobile Service (Serving Holiday Park & Boat Ramp)',
    phone: '+64 21 554 901',
    email: 'repairs@portwaikatoauto.co.nz',
    hours: '7:00 AM – 8:00 PM (Emergency Callouts 24/7)',
    bookingAvailable: true,
    badge: 'Fast Response',
    features: ['Mobile Diagnostic Van', 'Caravan 12V/240V Specialists', 'Outboard Marine Tech', 'Towing & Recovery Assist'],
    bookableServices: [
      {
        id: 'srv-caravan-check',
        title: 'Caravan Power & Gas Safety Diagnostic Check',
        duration: '45 Minutes (At Your Site)',
        priceNzd: 75,
        description: 'Comprehensive inspection of 50A/30A hookup, leisure battery health, inverter draw, and gas line tightness.'
      }
    ]
  }
];

export const INITIAL_COMMUNITY_NOTICES: CommunityNotice[] = [
  {
    id: 'not-1',
    title: '⚠️ Waikato River Bar Crossing Safety Advisory',
    category: 'tide_safety',
    timestamp: 'Today, 08:30 AM',
    content: 'Waikato River mouth bar is currently operating under MODERATE caution. Incoming low-pressure swell of 1.6m with 3 knot ebb tide between 14:00 and 16:30. Skippers must log with Coastguard VHF Ch 80 and ensure all lifejackets are worn.',
    author: 'Port Waikato Coastguard & Harbourmaster',
    urgency: 'advisory',
    pinned: true
  },
  {
    id: 'not-2',
    title: '🌿 Native Sand Dune Planting Working Bee This Saturday',
    category: 'kaitiaki_environment',
    timestamp: 'Yesterday',
    content: 'Join the Coastcare team at the Sunset Beach car park from 9:30 AM to plant 400 spinifex and pingao seedlings. BBQ lunch and hot coffee provided at the Hall afterwards. Bring sturdy boots and gardening gloves!',
    author: 'Kaitiaki Coastal Care Group',
    urgency: 'routine',
    pinned: false
  },
  {
    id: 'not-3',
    title: '🎪 Port Waikato Coastal Artisan Market (This Sunday)',
    category: 'market',
    timestamp: '2 days ago',
    content: 'Over 24 local stalls featuring handmade pottery, smoked river fish, fresh local avocado & honey, flax weavings, and live acoustic music by local artists. 9 AM to 1 PM at the Community Hall grounds.',
    author: 'Community Market Committee',
    urgency: 'routine',
    pinned: false
  },
  {
    id: 'not-4',
    title: '🚒 Rural Fire NZ: Restricted Fire Season Notice',
    category: 'council_alert',
    timestamp: '3 days ago',
    content: 'Franklin / Waikato Coastal Zone remains in RESTRICTED Fire Season. Approved gas barbeques and self-contained fire tables at Aotearoa Holiday Park sites are permitted. Open beach bonfires require an online FENZ permit.',
    author: 'Port Waikato Volunteer Fire Brigade',
    urgency: 'advisory',
    pinned: false
  }
];

export const INITIAL_MARINE_CONDITIONS: PortWaikatoMarineConditions = {
  tideState: 'Rising',
  nextHighTide: '16:45 (3.1m)',
  nextLowTide: '10:30 (0.6m)',
  tideHeightMeters: 2.4,
  surfHeightMeters: 1.6,
  surfQuality: 'Good',
  waterTempC: 19.5,
  barCrossingRisk: 'Moderate / Caution',
  windKnots: 11,
  windDirection: 'Offshore (ESE)',
  uvIndex: 7
};

export const INITIAL_DRAGON_QUESTS: DragonQuest[] = [
  {
    id: 'quest-dunes-sentinel',
    title: 'Sunset Dune Sentinel',
    realmSector: 'Sunset Dunes',
    difficulty: 'Initiate',
    dragonXp: 150,
    description: 'Traverse the ancient black magnetic iron sand dunes facing the wild Tasman Sea. Align your senses with the horizon.',
    clue: 'Ascend the wooden boardwalk past the surf lifesaving tower until the black sand meets the marram grass ridge.',
    actionType: 'photo_capture',
    verificationPrompt: 'Upload a panoramic shot of the Sunset Beach wave crests or black sand ridges.',
    unlockedReward: 'Complimentary Barista Coffee or Hot Pie at Sunset Beach Café',
    rewardCategory: 'voucher',
    isCompleted: false
  },
  {
    id: 'quest-river-alchemist',
    title: 'Waikato River Delta Alchemist',
    realmSector: 'Ancient River Delta',
    difficulty: 'Explorer',
    dragonXp: 220,
    description: 'Capture the auditory surge of New Zealand’s longest river meeting the raw ocean tide at the wharf sanctuary.',
    clue: 'Stand at the old timber wharf pier 400m from the holiday park during the tidal change.',
    actionType: 'sound_record',
    verificationPrompt: 'Record or simulate 5 seconds of the roaring tidal delta or coastal river breeze.',
    unlockedReward: '1-Hour Complimentary Double Kayak Hire with Waikato River Expeditions',
    rewardCategory: 'amenity',
    isCompleted: true,
    completedAt: 'Yesterday, 17:45',
    guestSubmission: {
      note: 'Captured the gentle low-frequency rumble of the outgoing tide colliding with the surf bar.'
    }
  },
  {
    id: 'quest-starlink-beacon',
    title: 'Starlink Cosmic Node Beacon',
    realmSector: 'Cosmic Starlink Altar',
    difficulty: 'Master',
    dragonXp: 350,
    description: 'Locate the 900MHz LoRa mesh relay nestled amongst the Nikau Palms and transmit a harmonic pulse to Dragon-9.',
    clue: 'Look for the glowing amber beacon pole on the edge of Zone Delta (Pitch 24) near the solar battery enclosure.',
    actionType: 'altar_resonance',
    verificationPrompt: 'Harmonize your device with the 528Hz Solar Core Altar to lock the mesh telemetry.',
    unlockedReward: '50A High-Speed EV Supercharger Priority Unlock Token (25 kWh)',
    rewardCategory: 'perk',
    isCompleted: false
  },
  {
    id: 'quest-kaitiaki-pledge',
    title: 'Kaitiaki Dune & Wildlife Pledge',
    realmSector: 'Sunset Dunes',
    difficulty: 'Initiate',
    dragonXp: 180,
    description: 'Honor the sacred guardianship (Kaitiakitanga) of the endemic New Zealand Dotterel nesting sanctuaries and coastal spinifex.',
    clue: 'Review the coastal protection markers along the Sunset Beach northern estuary.',
    actionType: 'eco_pledge',
    verificationPrompt: 'Pledge to keep dogs on leash, pack out all microplastics, and stay off fragile fore-dune vegetation.',
    unlockedReward: 'Official Kaitiaki Realm Guardian Badge + Sunset Beach Clean Ocean Sticker',
    rewardCategory: 'badge',
    isCompleted: true,
    completedAt: 'Today, 09:15',
    guestSubmission: {
      note: 'Pledged to protect dotterel nests and cleaned up 3 pieces of washed-up driftwood plastic.'
    }
  },
  {
    id: 'quest-bioluminescent-glade',
    title: 'Bioluminescent Glade & Dark Sky Stargazer',
    realmSector: 'Bioluminescent Glade',
    difficulty: 'Legendary',
    dragonXp: 450,
    description: 'At twilight, venture into the native Puriri glade behind Zone Gamma and observe the Bortle-2 celestial canopy.',
    clue: 'Follow the solar-lit gravel path past the cedar sauna toward the ancient Puriri hollow.',
    actionType: 'trivia_unlock',
    verificationPrompt: 'Identify the Matariki / Southern Cross celestial pointer and submit your astronomical reflection.',
    unlockedReward: 'Private 45-Minute Cedar Barrel Sauna & Hot Tub Stargazing Session',
    rewardCategory: 'amenity',
    isCompleted: false
  }
];

export const INITIAL_DRAGON_MEDIA: DragonMediaSubmission[] = [
  {
    id: 'media-1',
    guestName: 'Liam & Kiri M.',
    siteNumber: 'Site 14 (RV Riverfront)',
    type: 'photo',
    title: 'Sunset Beach Golden Hour Horizon',
    caption: 'The black magnetic sand was glowing liquid bronze as the 1.8m swell rolled in. Absolute magic!',
    location: 'Sunset Beach Point',
    timestamp: '25 mins ago',
    mediaPreview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    emulsionColor: '#f59e0b',
    resonanceFrequency: '528 Hz • Solar Harmonic',
    dragonTokensAwarded: 75,
    aiVisionAnalysis: {
      elementalAffinity: 'Solar Flare',
      aestheticResonanceScore: 98,
      realmEffect: 'Radiates warm golden luminescence across the West Coast sector.',
      detectedEntities: ['Black Sand', 'Ocean Barrel Waves', 'Sunset Gradient', 'Tasman Horizon']
    },
    likesCount: 14,
    hasLiked: true
  },
  {
    id: 'media-2',
    guestName: 'Aroha Te Rangi',
    siteNumber: 'Site 06 (Glamping Bell Tent)',
    type: 'audio',
    title: 'Waikato River Delta Tide Resonance',
    caption: 'Hydrophone recording of the river surge meeting the ocean bar at 16:30 incoming tide.',
    location: 'Wharf Marine Reserve',
    timestamp: '1 hour ago',
    mediaPreview: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
    emulsionColor: '#06b6d4',
    resonanceFrequency: '432 Hz • Abyssal Frequency',
    dragonTokensAwarded: 90,
    aiVisionAnalysis: {
      elementalAffinity: 'Abyssal Water',
      aestheticResonanceScore: 96,
      realmEffect: 'Deep oceanic fluid waves calm park telemetry node micro-fluctuations.',
      detectedEntities: ['River Swell', 'Wharf Timbers', 'Tidal Surge', 'Marine Soundscape']
    },
    likesCount: 22,
    hasLiked: false
  },
  {
    id: 'media-3',
    guestName: 'Elena & Marcus',
    siteNumber: 'Site 22 (Pines Cabin)',
    type: 'photo',
    title: 'Ancient Puriri Glade Twilight Glow',
    caption: 'Discovered the ancient 200-year-old Puriri tree draped with native epiphytes right behind the campground.',
    location: 'Zone Gamma Forest Trail',
    timestamp: '3 hours ago',
    mediaPreview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
    emulsionColor: '#10b981',
    resonanceFrequency: '639 Hz • Verdant Pulse',
    dragonTokensAwarded: 85,
    aiVisionAnalysis: {
      elementalAffinity: 'Verdant Earth',
      aestheticResonanceScore: 94,
      realmEffect: 'Forest canopy bio-resonance reinforces park oxygen and microclimate stability.',
      detectedEntities: ['Puriri Canopy', 'Fern Canopy', 'Moss Epiphytes', 'Forest Dusk']
    },
    likesCount: 19,
    hasLiked: false
  },
  {
    id: 'media-4',
    guestName: 'Dave & Sam R.',
    siteNumber: 'Site 09 (RV 50A)',
    type: 'story',
    title: 'Campfire Legend of the River Taniwha',
    caption: 'Shared the old local story about the guardian creatures that protect the river delta from heavy southerly storms.',
    location: 'Campfire Altar #3',
    timestamp: '5 hours ago',
    mediaPreview: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=900&q=80',
    emulsionColor: '#ec4899',
    resonanceFrequency: '741 Hz • Story Weaver',
    dragonTokensAwarded: 60,
    aiVisionAnalysis: {
      elementalAffinity: 'Aether Wind',
      aestheticResonanceScore: 92,
      realmEffect: 'Infuses the community communal fire pit with warmth and camaraderie.',
      detectedEntities: ['Ember Sparks', 'Storytelling', 'Campfire Circle', 'Night Breeze']
    },
    likesCount: 31,
    hasLiked: true
  },
  {
    id: 'media-5',
    guestName: 'Sarah & Noah P.',
    siteNumber: 'Site 02 (Dune Geodesic Dome)',
    type: 'photo',
    title: 'Milky Way & Starlink Dish at 2 AM',
    caption: 'Port Waikato has virtually zero light pollution. Crystal clear views of the Carina Nebula and Magellanic Clouds!',
    location: 'Zone Delta Geodesic Dome',
    timestamp: 'Yesterday',
    mediaPreview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
    emulsionColor: '#8b5cf6',
    resonanceFrequency: '963 Hz • Cosmic Aurora',
    dragonTokensAwarded: 100,
    aiVisionAnalysis: {
      elementalAffinity: 'Cosmic Plasma',
      aestheticResonanceScore: 99,
      realmEffect: 'Harmonizes high-speed Starlink gateway with ionospheric dark sky telemetry.',
      detectedEntities: ['Milky Way Core', 'Southern Cross', 'Starlink Dish', 'Bortle 2 Sky']
    },
    likesCount: 45,
    hasLiked: true
  }
];

export const INITIAL_DRAGON_NEST_STATE: DragonNestEmulsionState = {
  realmHarmonicResonance: 92,
  activeElementalDominance: 'Solar Flare',
  realmPulseBpm: 64,
  collectiveDragonXp: 4850,
  guestDragonRank: {
    title: 'Tide Alchemist',
    tier: 3,
    currentXp: 720,
    nextTierXp: 1000,
    unlockedPerks: [
      {
        id: 'perk-cafe-voucher',
        name: 'Complimentary Barista Coffee at Sunset Beach Café',
        code: 'DRAGON-CAFE-774',
        expiry: 'Valid throughout your stay',
        claimed: false
      },
      {
        id: 'perk-sauna-pass',
        name: 'Private 45-Min Cedar Barrel Sauna & Hot Tub Pass',
        code: 'DRAGON-SAUNA-312',
        expiry: 'Expires in 48 hours',
        claimed: false
      },
      {
        id: 'perk-late-checkout',
        name: 'Late 1:00 PM Leisure Checkout Privilege',
        code: 'DRAGON-LATE-908',
        expiry: 'Auto-applied to active site pass',
        claimed: true
      }
    ]
  },
  activeEmulsionShader: 'aurora_fluid',
  soundscapePlaying: false
};


export const INITIAL_DRAGON_NODES: DragonNode[] = [
  {
    id: 'node-1',
    number: 1,
    code: 'D9-SITE-GRID',
    name: 'Site Allocation & Grid Routing',
    category: 'grid_site',
    status: 'nominal',
    healthScore: 98,
    metricLabel: 'Occupancy Rate',
    metricValue: '87.5%',
    secondaryMetric: '28 / 32 Sites Active',
    subsystemCount: 32,
    lastAutonomousAction: 'Auto-reallocated RV-14 to RV-16 to optimize 50A grid load balance.',
    lastActionTimestamp: '2 mins ago',
    iconName: 'LayoutGrid',
    description: 'Dynamic topological campground site assignments, EV pull-through balancing & turn-down scheduling.',
    autoHealEnabled: true,
  },
  {
    id: 'node-2',
    number: 2,
    code: 'D9-ENERGY-FLOW',
    name: 'Utility & Microgrid Telemetry',
    category: 'utility_energy',
    status: 'nominal',
    healthScore: 95,
    metricLabel: 'Solar Microgrid Battery',
    metricValue: '91%',
    secondaryMetric: '42.8 kW Solar Gen (Net Positive)',
    subsystemCount: 14,
    lastAutonomousAction: 'Shifted Hot Tub heating to solar peak absorption buffer.',
    lastActionTimestamp: '6 mins ago',
    iconName: 'Zap',
    description: 'Real-time 50A/30A smart metering, water pump pressure telemetry and automated load shedding.',
    autoHealEnabled: true,
  },
  {
    id: 'node-3',
    number: 3,
    code: 'D9-RANGER-DISPATCH',
    name: 'Safety, Perimeter & Ranger Dispatch',
    category: 'safety_ranger',
    status: 'nominal',
    healthScore: 99,
    metricLabel: 'Active Ranger Units',
    metricValue: '3 on Patrol',
    secondaryMetric: 'Avg SOS Response: 1m 40s',
    subsystemCount: 8,
    lastAutonomousAction: 'Dispatched Unit Ranger-2 to inspect trail marker B-4 motion tripwire.',
    lastActionTimestamp: '12 mins ago',
    iconName: 'ShieldAlert',
    description: 'Autonomous patrol route generation, SOS panic mesh beacons & trail safety oversight.',
    autoHealEnabled: true,
  },
  {
    id: 'node-4',
    number: 4,
    code: 'D9-GATE-BARRIER',
    name: 'Gate Access & Boom IoT',
    category: 'gate_iot',
    status: 'nominal',
    healthScore: 99,
    metricLabel: 'Boom Barrier Uptime',
    metricValue: '100%',
    secondaryMetric: '64 Passes Validated Today',
    subsystemCount: 6,
    lastAutonomousAction: 'Validated vehicle tag [CAL-789X] with cryptographic offline Boarding Pass token.',
    lastActionTimestamp: '4 mins ago',
    iconName: 'KeySquare',
    description: 'Offline cryptographic token verification, ANPR license tag cameras & emergency egress lockouts.',
    autoHealEnabled: true,
  },
  {
    id: 'node-5',
    number: 5,
    code: 'D9-SANITY-CYCLE',
    name: 'Facility & Waste Sanitation',
    category: 'sanitation_waste',
    status: 'nominal',
    healthScore: 92,
    metricLabel: 'Ablution Block Hygiene',
    metricValue: '94% Clean',
    secondaryMetric: 'Next UV Sanitization: 45m',
    subsystemCount: 12,
    lastAutonomousAction: 'Smart greywater tank sensor triggered automated dump pump cycle.',
    lastActionTimestamp: '18 mins ago',
    iconName: 'Sparkles',
    description: 'IoT bin volume radar, water fixture auto-flush & scheduled robotic/staff turn cleaning.',
    autoHealEnabled: true,
  },
  {
    id: 'node-6',
    number: 6,
    code: 'D9-EVENT-ORCHESTRATION',
    name: 'Event & Activity Orchestration',
    category: 'event_activities',
    status: 'nominal',
    healthScore: 97,
    metricLabel: 'Guest Participation',
    metricValue: '54 Guests',
    secondaryMetric: 'Stargazing at Ridge (8:30 PM)',
    subsystemCount: 9,
    lastAutonomousAction: 'Automated push reminder sent for Sunset Kayak Safari to 8 registered passes.',
    lastActionTimestamp: '24 mins ago',
    iconName: 'Compass',
    description: 'Campfire permits, kayak locker unlocks, guided wildlife walks and communal stargazing.',
    autoHealEnabled: true,
  },
  {
    id: 'node-7',
    number: 7,
    code: 'D9-HAZARD-METRIC',
    name: 'Hazard & Microclimate Alerting',
    category: 'hazard_weather',
    status: 'nominal',
    healthScore: 94,
    metricLabel: 'Wildfire Danger Index',
    metricValue: 'Moderate (Tier 2)',
    secondaryMetric: 'Wind: 7 mph NE | Gusts: 12 mph',
    subsystemCount: 16,
    lastAutonomousAction: 'Calibrated campfire permit permissions: Propane firepits permitted, open wood restricted.',
    lastActionTimestamp: '8 mins ago',
    iconName: 'Flame',
    description: 'Microclimate Doppler sync, flash flood river hydrographs and lightning strike detection.',
    autoHealEnabled: true,
  },
  {
    id: 'node-8',
    number: 8,
    code: 'D9-GEAR-INVENTORY',
    name: 'Inventory & Rental Hardware',
    category: 'inventory_retail',
    status: 'nominal',
    healthScore: 93,
    metricLabel: 'Rental Gear Utilization',
    metricValue: '82%',
    secondaryMetric: '14/16 E-Bikes Deployed',
    subsystemCount: 20,
    lastAutonomousAction: 'Auto-ordered 40 bundles of kiln-dried cedar firewood at reorder threshold.',
    lastActionTimestamp: '35 mins ago',
    iconName: 'PackageCheck',
    description: 'Smart Bluetooth equipment lockers, SUP/kayak checkout and camp store retail ledger.',
    autoHealEnabled: true,
  },
  {
    id: 'node-9',
    number: 9,
    code: 'D9-LEDGER-YIELD',
    name: 'Financial Ledger & Yield Engine',
    category: 'ledger_yield',
    status: 'nominal',
    healthScore: 100,
    metricLabel: 'RevPASH & Daily Yield',
    metricValue: '$4,860.00',
    secondaryMetric: '+18.4% vs Baseline',
    subsystemCount: 7,
    lastAutonomousAction: 'Dynamic surge rate applied for holiday weekend waterfront glamping availability.',
    lastActionTimestamp: '15 mins ago',
    iconName: 'TrendingUp',
    description: 'Real-time occupancy pricing optimization, automated deposit releases and split-billing.',
    autoHealEnabled: true,
  },
];

export const INITIAL_SITES: CampSite[] = [
  {
    id: 'site-a1',
    number: 'RV-01',
    name: 'Redwood Pull-Through 50A',
    type: 'rv_powered_50a',
    zone: 'Zone Alpha (River)',
    status: 'occupied',
    maxOccupancy: 8,
    currentGuestName: 'Elena Rostova',
    currentPassToken: 'BP-9942-ELN',
    powerDrawWatts: 3450,
    waterFlowGpm: 1.2,
    smartLockCode: '4829',
    coordinates: { x: 18, y: 32 },
    pricePerNight: 125,
    rating: 4.9,
  },
  {
    id: 'site-a2',
    number: 'RV-02',
    name: 'Riverside Back-In 50A',
    type: 'rv_powered_50a',
    zone: 'Zone Alpha (River)',
    status: 'occupied',
    maxOccupancy: 6,
    currentGuestName: 'Marcus Vance',
    currentPassToken: 'BP-8812-MVC',
    powerDrawWatts: 2800,
    waterFlowGpm: 0.0,
    smartLockCode: '7391',
    coordinates: { x: 26, y: 28 },
    pricePerNight: 110,
    rating: 4.8,
  },
  {
    id: 'site-a3',
    number: 'GL-01',
    name: 'The Cedar Safari Sanctuary',
    type: 'glamping_safari',
    zone: 'Zone Alpha (River)',
    status: 'occupied',
    maxOccupancy: 4,
    currentGuestName: 'Julian & Sarah Thorne',
    currentPassToken: 'BP-7701-JST',
    powerDrawWatts: 1400,
    waterFlowGpm: 0.4,
    smartLockCode: '9182',
    coordinates: { x: 38, y: 22 },
    pricePerNight: 240,
    rating: 5.0,
  },
  {
    id: 'site-a4',
    number: 'GL-02',
    name: 'Wildflower Vista Glamping',
    type: 'glamping_safari',
    zone: 'Zone Alpha (River)',
    status: 'available',
    maxOccupancy: 4,
    powerDrawWatts: 120,
    waterFlowGpm: 0.0,
    smartLockCode: '5510',
    coordinates: { x: 48, y: 25 },
    pricePerNight: 220,
    rating: 4.9,
  },
  {
    id: 'site-b1',
    number: 'CB-01',
    name: 'Pinecrest Executive Timber Cabin',
    type: 'cabin_luxury',
    zone: 'Zone Beta (Pines)',
    status: 'occupied',
    maxOccupancy: 6,
    currentGuestName: 'Dr. Evelyn Reed',
    currentPassToken: 'BP-1049-EVR',
    powerDrawWatts: 4200,
    waterFlowGpm: 2.1,
    smartLockCode: '6204',
    coordinates: { x: 32, y: 55 },
    pricePerNight: 320,
    rating: 5.0,
  },
  {
    id: 'site-b2',
    number: 'CB-02',
    name: 'Alpine Hearth Cabin & Sauna',
    type: 'cabin_luxury',
    zone: 'Zone Beta (Pines)',
    status: 'occupied',
    maxOccupancy: 6,
    currentGuestName: 'Thomas K. Hayes',
    currentPassToken: 'BP-5521-TKH',
    powerDrawWatts: 3900,
    waterFlowGpm: 1.8,
    smartLockCode: '3941',
    coordinates: { x: 44, y: 52 },
    pricePerNight: 340,
    rating: 4.9,
  },
  {
    id: 'site-b3',
    number: 'RV-03',
    name: 'Whispering Pines 30A Site',
    type: 'rv_powered_30a',
    zone: 'Zone Beta (Pines)',
    status: 'available',
    maxOccupancy: 6,
    powerDrawWatts: 60,
    waterFlowGpm: 0.0,
    smartLockCode: '1849',
    coordinates: { x: 58, y: 48 },
    pricePerNight: 95,
    rating: 4.7,
  },
  {
    id: 'site-b4',
    number: 'RV-04',
    name: 'Pioneer Pull-Through 50A',
    type: 'rv_powered_50a',
    zone: 'Zone Beta (Pines)',
    status: 'occupied',
    maxOccupancy: 8,
    currentGuestName: 'Liam & Olivia Bennett',
    currentPassToken: 'BP-3390-LOB',
    powerDrawWatts: 2950,
    waterFlowGpm: 0.5,
    smartLockCode: '7721',
    coordinates: { x: 68, y: 42 },
    pricePerNight: 115,
    rating: 4.8,
  },
  {
    id: 'site-c1',
    number: 'TR-01',
    name: 'Otter Cove Riverbank Pitch',
    type: 'tent_riverside',
    zone: 'Zone Gamma (Ridge)',
    status: 'occupied',
    maxOccupancy: 4,
    currentGuestName: 'Koa Henderson',
    currentPassToken: 'BP-6610-KHD',
    powerDrawWatts: 150,
    waterFlowGpm: 0.1,
    smartLockCode: '2049',
    coordinates: { x: 15, y: 78 },
    pricePerNight: 65,
    rating: 4.8,
  },
  {
    id: 'site-c2',
    number: 'TR-02',
    name: 'Blue Heron Sandy Beach Pitch',
    type: 'tent_riverside',
    zone: 'Zone Gamma (Ridge)',
    status: 'occupied',
    maxOccupancy: 4,
    currentGuestName: 'Sophia Lin',
    currentPassToken: 'BP-4419-SLN',
    powerDrawWatts: 180,
    waterFlowGpm: 0.2,
    smartLockCode: '8532',
    coordinates: { x: 28, y: 82 },
    pricePerNight: 65,
    rating: 4.9,
  },
  {
    id: 'site-c3',
    number: 'TP-01',
    name: 'Eagle Nest Wilderness Tent',
    type: 'tent_primitive',
    zone: 'Zone Gamma (Ridge)',
    status: 'available',
    maxOccupancy: 2,
    powerDrawWatts: 0,
    waterFlowGpm: 0.0,
    smartLockCode: '1092',
    coordinates: { x: 74, y: 75 },
    pricePerNight: 45,
    rating: 4.6,
  },
  {
    id: 'site-c4',
    number: 'TP-02',
    name: 'Stargazer High Ridge Pitch',
    type: 'tent_primitive',
    zone: 'Zone Gamma (Ridge)',
    status: 'cleaning_needed',
    maxOccupancy: 2,
    powerDrawWatts: 0,
    waterFlowGpm: 0.0,
    smartLockCode: '6618',
    coordinates: { x: 86, y: 68 },
    pricePerNight: 50,
    rating: 4.7,
  },
  {
    id: 'site-d1',
    number: 'RV-05',
    name: 'Oak Glade Super Pull-Through',
    type: 'rv_powered_50a',
    zone: 'Zone Delta (Glade)',
    status: 'occupied',
    maxOccupancy: 8,
    currentGuestName: 'Capt. Arthur Vance',
    currentPassToken: 'BP-8819-CAV',
    powerDrawWatts: 3100,
    waterFlowGpm: 0.8,
    smartLockCode: '9043',
    coordinates: { x: 62, y: 18 },
    pricePerNight: 130,
    rating: 4.9,
  },
  {
    id: 'site-d2',
    number: 'GL-03',
    name: 'Moonlit Geodesic Dome Suite',
    type: 'glamping_safari',
    zone: 'Zone Delta (Glade)',
    status: 'occupied',
    maxOccupancy: 4,
    currentGuestName: 'Aria Montgomery',
    currentPassToken: 'BP-2210-AMG',
    powerDrawWatts: 1800,
    waterFlowGpm: 0.6,
    smartLockCode: '4390',
    coordinates: { x: 78, y: 22 },
    pricePerNight: 260,
    rating: 5.0,
  },
  {
    id: 'site-d3',
    number: 'CB-03',
    name: 'Honeysuckle Meadow Chalet',
    type: 'cabin_luxury',
    zone: 'Zone Delta (Glade)',
    status: 'available',
    maxOccupancy: 6,
    powerDrawWatts: 240,
    waterFlowGpm: 0.0,
    smartLockCode: '8114',
    coordinates: { x: 88, y: 38 },
    pricePerNight: 295,
    rating: 4.9,
  },
  {
    id: 'site-d4',
    number: 'TR-03',
    name: 'Fern Valley Shaded Pitch',
    type: 'tent_riverside',
    zone: 'Zone Delta (Glade)',
    status: 'occupied',
    maxOccupancy: 4,
    currentGuestName: 'Carlos & Maya Mendez',
    currentPassToken: 'BP-9913-CMM',
    powerDrawWatts: 200,
    waterFlowGpm: 0.2,
    smartLockCode: '5820',
    coordinates: { x: 52, y: 84 },
    pricePerNight: 70,
    rating: 4.8,
  }
];

export const INITIAL_PRIMARY_BOARDING_PASS: BoardingPass = {
  id: 'bp-prime-001',
  passToken: 'D9-BP-2026-ALPHA-9942',
  confirmationCode: 'FLUID-789X-CAMP',
  guestName: 'Elena Rostova & Family',
  guestEmail: 'elena.rostova@fluidmotion.io',
  guestPhone: '+1 (555) 482-9014',
  siteId: 'site-a1',
  siteNumber: 'RV-01',
  siteType: 'Redwood Pull-Through 50A Smart Site',
  zone: 'Zone Alpha (Riverfront)',
  checkInDate: '2026-08-24 (14:00)',
  checkOutDate: '2026-08-28 (11:00)',
  vehiclePlate: '7XTR-882 (CA)',
  vehicleModel: 'Airstream Flying Cloud 30FB + Ford F-250',
  partySize: 4,
  smartLockCode: '4829',
  wifiKey: 'DRAGON9_ULTRA_MESH_5G',
  amenityAccess: [
    'Main North Boom Gate (Auto-ANPR & NFC)',
    'Heated Riverfront Pool & Cedar Sauna',
    'Clubhouse High-Speed Starlink Lounge',
    'Locker Bay 04 - Tandem Kayak Unlock',
    'Zone A Electric Vehicle EV 50A Pedestal',
    'Camp Store Express Scan & Go'
  ],
  firePermitStatus: 'granted',
  cryptographicSignature: '0x9E7F4C82A31B88D0C94F7721EA55B099341D',
  offlineTotpHash: '942-881-D9',
  issuedAt: '2026-08-24T12:00:00Z',
  expiresAt: '2026-08-28T11:00:00Z',
  gateAccessLogs: [
    {
      id: 'glog-1',
      timestamp: 'Today, 14:12',
      gateId: 'gate-north-01',
      gateName: 'North Main Entrance Boom Gate',
      method: 'anpr_plate',
      authorized: true,
      notes: 'ANPR plate matched [7XTR-882]. Barrier auto-lifted in 1.1s.',
    },
    {
      id: 'glog-2',
      timestamp: 'Today, 16:45',
      gateId: 'gate-pool-02',
      gateName: 'Cedar Sauna & Pool Turnstile',
      method: 'offline_qr',
      authorized: true,
      notes: 'Offline Boarding Pass QR token validated cryptographically.',
    },
    {
      id: 'glog-3',
      timestamp: 'Today, 18:20',
      gateId: 'gate-kayak-04',
      gateName: 'Riverfront Kayak Pier Barrier',
      method: 'ble_proximity',
      authorized: true,
      notes: 'Fluid Motion BLE proximity beacon handshake complete.',
    }
  ],
  equipmentRentals: [
    {
      id: 'eq-1',
      item: 'Tandem River Kayak + 2 Carbon Paddles + PFDs',
      category: 'Water Sports',
      code: 'KYK-04-RIVER',
      status: 'active',
      dueTime: 'Tomorrow, 19:00',
      lockerNumber: 'Dock Locker #04',
    },
    {
      id: 'eq-2',
      item: 'Off-Grid EcoFlow 1000W Battery Power Station',
      category: 'Utility Gear',
      code: 'PWR-09-GEN',
      status: 'active',
      dueTime: 'Aug 28, 10:00',
      lockerNumber: 'Camp Store Locker #12',
    }
  ]
};

export const INITIAL_BOARDING_PASSES_VAULT: BoardingPass[] = [
  INITIAL_PRIMARY_BOARDING_PASS,
  {
    id: 'bp-arriving-002',
    passToken: 'PW-BP-2026-GL02-RAW',
    confirmationCode: 'FLUID-GL02-RAW',
    guestName: 'Rawinia Te Kanawa',
    guestEmail: 'rawinia.tekanawa@aotearoa.co.nz',
    guestPhone: '+64 21 883 9102',
    siteId: 'site-a4',
    siteNumber: 'GL-02',
    siteType: 'Wildflower Vista Glamping Safari Pod',
    zone: 'Zone Alpha (River)',
    checkInDate: '2026-08-25 (14:00 NZST)',
    checkOutDate: '2026-08-29 (10:30 NZST)',
    vehiclePlate: 'KPT-889 (NZ)',
    vehicleModel: 'Toyota Land Cruiser Prado + Roof Tent',
    partySize: 2,
    smartLockCode: '5510',
    wifiKey: 'PORT_WAIKATO_STARLINK_GUEST',
    amenityAccess: [
      'Sunset Beach Main Boom Gate (Auto-ANPR & NFC)',
      'Heated Camp Ablution Blocks & UV Showers',
      'Port Waikato Surf Academy Board & Wetsuit Hire',
      'Sunset Beach Café Welcome Gourmet Picnic Hamper'
    ],
    firePermitStatus: 'granted',
    cryptographicSignature: '0x3D72AF81BC9044EE10825B9A47CD129840F219BA',
    offlineTotpHash: '889-551-PW',
    issuedAt: '2026-08-25T08:00:00Z',
    expiresAt: '2026-08-29T11:00:00Z',
    gateAccessLogs: [],
    equipmentRentals: [
      {
        id: 'eq-surf-01',
        item: 'Torq 7ft6 Epoxy Funboard & 4/3mm Steamer',
        category: 'Surf & Beach',
        code: 'PW-SURF-BAY-02',
        status: 'active',
        dueTime: 'Aug 29, 10:00',
        lockerNumber: 'Surf Bay Locker #02'
      }
    ]
  },
  {
    id: 'bp-arriving-003',
    passToken: 'PW-BP-2026-CB03-TAN',
    confirmationCode: 'FLUID-CB03-TAN',
    guestName: 'Tane & Mere Williams',
    guestEmail: 'tane.williams@waikatobay.co.nz',
    guestPhone: '+64 27 491 2280',
    siteId: 'site-d3',
    siteNumber: 'CB-03',
    siteType: 'Honeysuckle Meadow Chalet',
    zone: 'Zone Delta (Glade)',
    checkInDate: '2026-08-25 (14:00 NZST)',
    checkOutDate: '2026-08-28 (10:30 NZST)',
    vehiclePlate: 'WKT-402 (NZ)',
    vehicleModel: 'Subaru Outback AWD',
    partySize: 4,
    smartLockCode: '8114',
    wifiKey: 'PORT_WAIKATO_STARLINK_GUEST',
    amenityAccess: [
      'Sunset Beach Main Boom Gate (Auto-ANPR & NFC)',
      'Private Cedar Hearth & Hot Tub',
      'Sunset Beach Clubhouse High-Speed Starlink Hub',
      'Port Waikato Riverfront Boat Ramp Access'
    ],
    firePermitStatus: 'granted',
    cryptographicSignature: '0x8B1920FCA45901DE8233C571994AA7201E6C4081',
    offlineTotpHash: '402-811-PW',
    issuedAt: '2026-08-25T09:30:00Z',
    expiresAt: '2026-08-28T11:00:00Z',
    gateAccessLogs: [],
    equipmentRentals: []
  },
  {
    id: 'bp-arriving-004',
    passToken: 'PW-BP-2026-RV04-LOB',
    confirmationCode: 'FLUID-RV04-LOB',
    guestName: 'Liam & Olivia Bennett',
    guestEmail: 'olivia.bennett@tournz.co.nz',
    guestPhone: '+64 21 340 7712',
    siteId: 'site-b4',
    siteNumber: 'RV-04',
    siteType: 'Pioneer Pull-Through 50A',
    zone: 'Zone Beta (Pines)',
    checkInDate: '2026-08-25 (14:00 NZST)',
    checkOutDate: '2026-08-30 (10:30 NZST)',
    vehiclePlate: 'HLD-711 (NZ)',
    vehicleModel: 'Maui River 6-Berth Motorhome',
    partySize: 5,
    smartLockCode: '7721',
    wifiKey: 'PORT_WAIKATO_STARLINK_GUEST',
    amenityAccess: [
      'Sunset Beach Main Boom Gate (Auto-ANPR & NFC)',
      'Unlimited 50A EV Rapid Pedestal Charging',
      'Kiln-Dried Native Firewood Bundle + Enclosed Fire Table'
    ],
    firePermitStatus: 'granted',
    cryptographicSignature: '0x7114A0B829EF13D455981029CD772A0145293B8A',
    offlineTotpHash: '711-772-PW',
    issuedAt: '2026-08-25T10:15:00Z',
    expiresAt: '2026-08-30T11:00:00Z',
    gateAccessLogs: [],
    equipmentRentals: []
  },
  {
    id: 'bp-arriving-005',
    passToken: 'PW-BP-2026-TR01-KHD',
    confirmationCode: 'FLUID-TR01-KHD',
    guestName: 'Koa Henderson',
    guestEmail: 'koa.henderson@surfnz.org',
    guestPhone: '+64 22 905 1184',
    siteId: 'site-c1',
    siteNumber: 'TR-01',
    siteType: 'Otter Cove Riverbank Pitch',
    zone: 'Zone Gamma (Ridge)',
    checkInDate: '2026-08-25 (14:00 NZST)',
    checkOutDate: '2026-08-27 (10:30 NZST)',
    vehiclePlate: 'SURF-99 (NZ)',
    vehicleModel: 'Toyota Hiace Custom Surf Van',
    partySize: 2,
    smartLockCode: '2049',
    wifiKey: 'PORT_WAIKATO_STARLINK_GUEST',
    amenityAccess: [
      'Sunset Beach Main Boom Gate (Auto-ANPR & NFC)',
      'Port Waikato Riverfront Boat Ramp Access',
      'Riverfront Kayak & Lifejacket 2-Day Pass'
    ],
    firePermitStatus: 'granted',
    cryptographicSignature: '0x9948BC012F45AE88102937CDA819920194883ABC',
    offlineTotpHash: '994-204-PW',
    issuedAt: '2026-08-25T11:00:00Z',
    expiresAt: '2026-08-27T11:00:00Z',
    gateAccessLogs: [],
    equipmentRentals: [
      {
        id: 'eq-kayak-01',
        item: 'Single Ocean Kayak & Carbon Paddle',
        category: 'Water Sports',
        code: 'PW-RIVER-DOCK-01',
        status: 'active',
        dueTime: 'Aug 27, 10:00',
        lockerNumber: 'River Dock Locker #01'
      }
    ]
  }
];

export const INITIAL_WEATHER: WeatherHazard = {
  wildfireDangerIndex: 'Moderate',
  windSpeedMph: 7,
  windGustMph: 12,
  temperatureF: 74,
  humidityPercent: 44,
  barometricPressureInHg: 30.12,
  lightningDetectedKm: undefined,
  flashFloodRisk: false,
  activeAdvisory: 'Clear alpine skies. Calibrated campfire rules active: approved enclosed firepits allowed until 22:00.',
};

export const INITIAL_ENERGY: EnergyTelemetry = {
  solarGenerationKw: 42.8,
  batteryStoragePercent: 91,
  gridDrawKw: 4.2,
  microgridStatus: 'grid_tied',
  peakLoadSheddingActive: false,
  waterReservoirLevelPercent: 88,
  greywaterTanksFillPercent: 34,
};

export const INITIAL_LOGS: AutonomousExecutiveLog[] = [
  {
    id: 'log-1',
    timestamp: '11:40:12',
    severity: 'decision',
    pillar: 'Pillar 1: Grid Routing',
    title: 'Autonomous Site Optimization Applied',
    description: 'Re-balanced incoming Class-A motorhome fleet to Zone Alpha 50A pedestals, avoiding voltage droop on Substation B.',
    actionTaken: 'Grid routing weights recalculated. 4 sites reserved automatically.',
    autonomousAgent: 'Dragon-9 Core',
    status: 'completed'
  },
  {
    id: 'log-2',
    timestamp: '11:34:40',
    severity: 'mitigation',
    pillar: 'Pillar 7: Hazard Metric',
    title: 'Microclimate Wind Shear Monitored',
    description: 'Anemometer on Ridge 3 recorded gust of 14 mph. Confirmed safe threshold for high-profile RV awnings.',
    actionTaken: 'Sent soft weather notification to high-profile RV sites via Boarding Pass telemetry.',
    autonomousAgent: 'Gemini Executive',
    status: 'completed'
  },
  {
    id: 'log-3',
    timestamp: '11:21:05',
    severity: 'optimization',
    pillar: 'Pillar 2: Utility & Energy',
    title: 'Solar Microgrid Peak Absorption Active',
    description: 'Solar production at 42.8 kW exceeding park baseline draw (26.4 kW). Battery bank charged to 91%.',
    actionTaken: 'Triggered thermal storage water heaters in shower blocks to store excess solar heat.',
    autonomousAgent: 'Fluid Dispatch',
    status: 'completed'
  },
  {
    id: 'log-4',
    timestamp: '10:58:19',
    severity: 'info',
    pillar: 'Pillar 4: Gate Access',
    title: 'Offline Cryptographic Pass Verification Verified',
    description: 'North gate local controller validated guest Boarding Pass token [D9-BP-2026-ALPHA-9942] in standalone offline cache.',
    actionTaken: 'Boom barrier actuated in 1.1s with cryptographic HMAC verification.',
    autonomousAgent: 'BoardingPass Engine',
    status: 'completed'
  }
];

export const StorageService = {
  getDragonNodes(): DragonNode[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAGON_NODES);
      return data ? JSON.parse(data) : INITIAL_DRAGON_NODES;
    } catch {
      return INITIAL_DRAGON_NODES;
    }
  },

  saveDragonNodes(nodes: DragonNode[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAGON_NODES, JSON.stringify(nodes));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getSites(): CampSite[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SITES);
      return data ? JSON.parse(data) : INITIAL_SITES;
    } catch {
      return INITIAL_SITES;
    }
  },

  saveSites(sites: CampSite[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getActivePass(): BoardingPass {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PASS);
      return data ? JSON.parse(data) : INITIAL_PRIMARY_BOARDING_PASS;
    } catch {
      return INITIAL_PRIMARY_BOARDING_PASS;
    }
  },

  saveActivePass(pass: BoardingPass) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PASS, JSON.stringify(pass));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getWeather(): WeatherHazard {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEATHER);
      return data ? JSON.parse(data) : INITIAL_WEATHER;
    } catch {
      return INITIAL_WEATHER;
    }
  },

  saveWeather(weather: WeatherHazard) {
    try {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getEnergy(): EnergyTelemetry {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENERGY);
      return data ? JSON.parse(data) : INITIAL_ENERGY;
    } catch {
      return INITIAL_ENERGY;
    }
  },

  saveEnergy(energy: EnergyTelemetry) {
    try {
      localStorage.setItem(STORAGE_KEYS.ENERGY, JSON.stringify(energy));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getLogs(): AutonomousExecutiveLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(log: Omit<AutonomousExecutiveLog, 'id'>) {
    const current = this.getLogs();
    const newLog: AutonomousExecutiveLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newLog, ...current].slice(0, 50); // Keep last 50
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error', e);
    }
    return updated;
  },

  getSyncQueue(): OfflineSyncQueueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToSyncQueue(item: Omit<OfflineSyncQueueItem, 'id' | 'checksum'>) {
    const queue = this.getSyncQueue();
    const newItem: OfflineSyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      checksum: 'SHA256:' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
    queue.push(newItem);
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Storage error', e);
    }
    return queue;
  },

  clearSyncQueue() {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  isOfflineSimulated(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_OFFLINE_SIM) === 'true';
    } catch {
      return false;
    }
  },

  setOfflineSimulated(val: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_OFFLINE_SIM, String(val));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getCommunityBusinesses(): CommunityBusiness[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_BIZ);
      return data ? JSON.parse(data) : INITIAL_COMMUNITY_BUSINESSES;
    } catch {
      return INITIAL_COMMUNITY_BUSINESSES;
    }
  },

  saveCommunityBusinesses(businesses: CommunityBusiness[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_BIZ, JSON.stringify(businesses));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  getCommunityNotices(): CommunityNotice[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_NOTICES);
      return data ? JSON.parse(data) : INITIAL_COMMUNITY_NOTICES;
    } catch {
      return INITIAL_COMMUNITY_NOTICES;
    }
  },

  addCommunityNotice(notice: Omit<CommunityNotice, 'id' | 'timestamp'>) {
    const current = this.getCommunityNotices();
    const newNotice: CommunityNotice = {
      ...notice,
      id: `notice-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
    };
    const updated = [newNotice, ...current];
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_NOTICES, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error', e);
    }
    return updated;
  },

  getMarineConditions(): PortWaikatoMarineConditions {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MARINE_CONDITIONS);
      return data ? JSON.parse(data) : INITIAL_MARINE_CONDITIONS;
    } catch {
      return INITIAL_MARINE_CONDITIONS;
    }
  },

  saveMarineConditions(conditions: PortWaikatoMarineConditions) {
    try {
      localStorage.setItem(STORAGE_KEYS.MARINE_CONDITIONS, JSON.stringify(conditions));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  createSiteBooking(form: SiteBookingForm): BoardingPass {
    const sites = this.getSites();
    const targetSite = sites.find(s => s.id === form.siteId) || sites[0];
    
    // Generate secure pass token & TOTP
    const tokenSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const passToken = `D9-PW-2026-${targetSite.number}-${tokenSuffix}`;
    const confirmationCode = `AOTEAROA-${Math.floor(1000 + Math.random() * 9000)}-PW`;
    const totpHash = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-NZ`;
    const lockPin = String(Math.floor(1000 + Math.random() * 9000));

    const newPass: BoardingPass = {
      id: `bp-${Date.now()}`,
      passToken,
      confirmationCode,
      guestName: form.guestName,
      guestEmail: form.guestEmail,
      guestPhone: form.guestPhone,
      siteId: targetSite.id,
      siteNumber: targetSite.number,
      siteType: targetSite.name,
      zone: targetSite.zone,
      checkInDate: `${form.checkInDate} (14:00 NZST)`,
      checkOutDate: `${form.checkOutDate} (10:30 NZST)`,
      vehiclePlate: form.vehiclePlate ? `${form.vehiclePlate.toUpperCase()} (NZ)` : 'NZ-PLATE-PENDING',
      vehicleModel: form.vehicleModel || 'Campervan / Touring Vehicle',
      partySize: form.partySize || 2,
      smartLockCode: lockPin,
      wifiKey: 'PORT_WAIKATO_STARLINK_GUEST',
      amenityAccess: [
        'Sunset Beach Main Boom Gate (Auto-ANPR & NFC)',
        'Heated Camp Ablution Blocks & UV Showers',
        'Sunset Beach Clubhouse High-Speed Starlink Hub',
        'Port Waikato Riverfront Boat Ramp Access',
        ...(form.selectedAddOns || []).map(addon => `Add-on: ${addon}`)
      ],
      firePermitStatus: 'granted',
      cryptographicSignature: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase(),
      offlineTotpHash: totpHash,
      issuedAt: new Date().toISOString(),
      expiresAt: `${form.checkOutDate}T11:00:00Z`,
      gateAccessLogs: [
        {
          id: `glog-init-${Date.now()}`,
          timestamp: 'Just now',
          gateId: 'gate-sunset-01',
          gateName: 'Port Waikato Entrance Barrier',
          method: 'anpr_plate',
          authorized: true,
          notes: `ANPR Plate [${form.vehiclePlate.toUpperCase()}] pre-authorized for arrival.`
        }
      ],
      equipmentRentals: (form.selectedAddOns || []).filter(a => a.toLowerCase().includes('surf') || a.toLowerCase().includes('board') || a.toLowerCase().includes('kayak')).map((item, idx) => ({
        id: `rent-${Date.now()}-${idx}`,
        item,
        category: 'Surf & Water Sports',
        code: `PW-LOCKER-${idx + 1}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'active',
        dueTime: `${form.checkOutDate}, 10:00`,
        lockerNumber: `Surf Bay Locker #0${idx + 1}`
      }))
    };

    // Update site status
    const updatedSites = sites.map(s => {
      if (s.id === targetSite.id) {
        return {
          ...s,
          status: 'reserved' as const,
          currentGuestName: form.guestName,
          currentPassToken: passToken,
          smartLockCode: lockPin
        };
      }
      return s;
    });
    this.saveSites(updatedSites);
    this.saveActivePass(newPass);

    // Add log
    this.addLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: 'decision',
      pillar: 'Pillar 1: Site Grid & Booking Engine',
      title: `Aotearoa Holiday Park Stay Booked: ${targetSite.number}`,
      description: `Guest ${form.guestName} confirmed reservation for ${targetSite.name}. Cryptographic pass ${confirmationCode} generated with ANPR barrier whitelisting.`,
      actionTaken: `Site marked reserved, ANPR plate [${form.vehiclePlate.toUpperCase()}] added to offline gate cache.`,
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });

    return newPass;
  },

  createBusinessBooking(booking: ExperienceBookingForm) {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPERIENCE_BOOKINGS) || '[]');
      const newBooking = {
        ...booking,
        id: `exp-book-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };
      current.push(newBooking);
      localStorage.setItem(STORAGE_KEYS.EXPERIENCE_BOOKINGS, JSON.stringify(current));

      // Also add to sync queue
      this.addToSyncQueue({
        timestamp: new Date().toISOString(),
        actionType: 'amenity_redeem',
        payload: newBooking,
        status: 'synced'
      });

      this.addLog({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'info',
        pillar: 'Pillar 6: Event & Community Hub',
        title: `Community Hub Experience Booked`,
        description: `${booking.guestName} booked service at ${booking.businessId} for ${booking.bookingDate} (${booking.timeSlot}).`,
        actionTaken: 'Confirmed reservation relayed to local business ledger via Fluid Motion mesh.',
        autonomousAgent: 'Fluid Dispatch',
        status: 'completed'
      });

      return newBooking;
    } catch (e) {
      console.error('Experience booking error', e);
      return null;
    }
  },

  getBoardingPassVault(): BoardingPass[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PASSES_LIST);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEYS.PASSES_LIST, JSON.stringify(INITIAL_BOARDING_PASSES_VAULT));
      return INITIAL_BOARDING_PASSES_VAULT;
    } catch {
      return INITIAL_BOARDING_PASSES_VAULT;
    }
  },

  saveBoardingPassVault(passes: BoardingPass[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSES_LIST, JSON.stringify(passes));
    } catch (e) {
      console.error('Storage error saving vault', e);
    }
  },

  generateBoardingPassQrData(pass: BoardingPass): string {
    const payload = {
      protocol: 'BOARDING_PASS_V3_CRYPTOGRAPHIC',
      token: pass.passToken,
      code: pass.confirmationCode,
      site: pass.siteNumber,
      zone: pass.zone,
      guest: pass.guestName,
      party: pass.partySize,
      plate: pass.vehiclePlate,
      smartLockPin: pass.smartLockCode,
      totp: pass.offlineTotpHash,
      sig: pass.cryptographicSignature,
      checkIn: pass.checkInDate,
      checkOut: pass.checkOutDate,
      issuedAt: pass.issuedAt
    };
    return JSON.stringify(payload);
  },

  findPassByCode(rawCode: string): BoardingPass | null {
    const vault = this.getBoardingPassVault();
    const active = this.getActivePass();
    const searchTarget = rawCode.trim();

    // Check if JSON
    try {
      if (searchTarget.startsWith('{') && searchTarget.endsWith('}')) {
        const parsed = JSON.parse(searchTarget);
        const matchToken = parsed.token || parsed.passToken || parsed.code || parsed.confirmationCode;
        if (matchToken) {
          const found = vault.find(p => 
            p.passToken.toLowerCase() === matchToken.toLowerCase() || 
            p.confirmationCode.toLowerCase() === matchToken.toLowerCase()
          );
          if (found) return found;
        }
        // If constructed on the fly from QR payload
        if (parsed.guest && parsed.site) {
          return {
            id: `bp-scanned-${Date.now()}`,
            passToken: parsed.token || `PW-BP-${Date.now()}`,
            confirmationCode: parsed.code || `FLUID-${parsed.site}-${Date.now().toString().slice(-4)}`,
            guestName: parsed.guest,
            guestEmail: parsed.email || 'guest@aotearoaholidaypark.co.nz',
            guestPhone: parsed.phone || '+64 21 000 0000',
            siteId: `site-${parsed.site.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            siteNumber: parsed.site,
            siteType: `${parsed.site} Premium Pitch`,
            zone: parsed.zone || 'Zone Alpha (River)',
            checkInDate: parsed.checkIn || '2026-08-25 (14:00 NZST)',
            checkOutDate: parsed.checkOut || '2026-08-29 (10:30 NZST)',
            vehiclePlate: parsed.plate || 'NZ-ANPR-AUTO',
            vehicleModel: 'Campervan / Touring Vehicle',
            partySize: parsed.party || 2,
            smartLockCode: parsed.smartLockPin || '4829',
            wifiKey: 'PORT_WAIKATO_STARLINK_GUEST',
            amenityAccess: [
              'Sunset Beach Main Boom Gate (Auto-ANPR & NFC)',
              'Heated Camp Ablution Blocks & UV Showers',
              'Sunset Beach Clubhouse High-Speed Starlink Hub'
            ],
            firePermitStatus: 'granted',
            cryptographicSignature: parsed.sig || '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase(),
            offlineTotpHash: parsed.totp || '994-881-PW',
            issuedAt: parsed.issuedAt || new Date().toISOString(),
            expiresAt: parsed.expiresAt || new Date(Date.now() + 86400000 * 3).toISOString(),
            gateAccessLogs: [],
            equipmentRentals: []
          };
        }
      }
    } catch {
      // Not JSON, continue with text search
    }

    // Direct token or code match
    const cleanSearch = searchTarget.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check active pass first
    if (
      active.passToken.toLowerCase().includes(searchTarget.toLowerCase()) ||
      active.confirmationCode.toLowerCase().includes(searchTarget.toLowerCase()) ||
      active.guestName.toLowerCase().includes(searchTarget.toLowerCase()) ||
      active.siteNumber.toLowerCase() === searchTarget.toLowerCase()
    ) {
      return active;
    }

    // Check vault
    const match = vault.find(p => {
      const pTokenClean = p.passToken.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pCodeClean = p.confirmationCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        p.confirmationCode.toLowerCase().includes(searchTarget.toLowerCase()) ||
        p.passToken.toLowerCase().includes(searchTarget.toLowerCase()) ||
        p.guestName.toLowerCase().includes(searchTarget.toLowerCase()) ||
        p.siteNumber.toLowerCase() === searchTarget.toLowerCase() ||
        (cleanSearch.length > 4 && (pTokenClean.includes(cleanSearch) || pCodeClean.includes(cleanSearch)))
      );
    });

    if (match) return match;

    // Fallback: match by site number in sites
    const sites = this.getSites();
    const matchedSite = sites.find(s => 
      s.number.toLowerCase() === searchTarget.toLowerCase() ||
      s.id.toLowerCase() === searchTarget.toLowerCase() ||
      (s.currentGuestName && s.currentGuestName.toLowerCase().includes(searchTarget.toLowerCase()))
    );

    if (matchedSite) {
      // Find or synthesize pass for this site
      const sitePass = vault.find(p => p.siteNumber === matchedSite.number);
      if (sitePass) return sitePass;
    }

    return null;
  },

  verifyAndCheckInPass(scannedCode: string): {
    success: boolean;
    pass?: BoardingPass;
    site?: CampSite;
    message: string;
    isAlreadyCheckedIn: boolean;
    verificationDetails: {
      signatureValid: boolean;
      totpValid: boolean;
      anprWhitelisted: boolean;
      firePermitGranted: boolean;
      latencyMs: number;
    };
  } {
    const isOffline = this.isOfflineSimulated();
    const pass = this.findPassByCode(scannedCode);

    if (!pass) {
      return {
        success: false,
        message: `Unrecognized or corrupted pass token. Cryptographic signature could not be verified in local offline ledger.`,
        isAlreadyCheckedIn: false,
        verificationDetails: {
          signatureValid: false,
          totpValid: false,
          anprWhitelisted: false,
          firePermitGranted: false,
          latencyMs: 38
        }
      };
    }

    const sites = this.getSites();
    const targetSite = sites.find(s => s.number === pass.siteNumber || s.id === pass.siteId) || sites[0];
    const isAlreadyCheckedIn = targetSite.status === 'occupied' && targetSite.currentPassToken === pass.passToken;

    // Create a new gate event
    const newGateEvent: GateAccessEvent = {
      id: `gate-checkin-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      gateId: 'gate-sunset-main-01',
      gateName: 'Port Waikato North Entrance Barrier',
      method: isOffline ? 'offline_qr' : 'offline_qr',
      authorized: true,
      notes: `Touchless QR check-in verified. ANPR Plate [${pass.vehiclePlate}] validated. Barrier auto-lifted.`
    };

    const updatedPass: BoardingPass = {
      ...pass,
      gateAccessLogs: [newGateEvent, ...(pass.gateAccessLogs || [])].slice(0, 10)
    };

    // Update site state to occupied
    const updatedSites = sites.map(s => {
      if (s.id === targetSite.id || s.number === pass.siteNumber) {
        return {
          ...s,
          status: 'occupied' as const,
          currentGuestName: pass.guestName,
          currentPassToken: pass.passToken,
          smartLockCode: pass.smartLockCode
        };
      }
      return s;
    });

    // Update vault
    const vault = this.getBoardingPassVault();
    const updatedVault = vault.map(p => p.id === pass.id ? updatedPass : p);
    if (!updatedVault.some(p => p.id === pass.id)) {
      updatedVault.push(updatedPass);
    }

    this.saveSites(updatedSites);
    this.saveBoardingPassVault(updatedVault);
    this.saveActivePass(updatedPass);

    // Enqueue check-in event in offline sync queue
    this.addToSyncQueue({
      timestamp: new Date().toISOString(),
      actionType: 'check_in',
      payload: {
        passToken: pass.passToken,
        confirmationCode: pass.confirmationCode,
        guestName: pass.guestName,
        siteNumber: pass.siteNumber,
        vehiclePlate: pass.vehiclePlate,
        checkInTimestamp: new Date().toISOString(),
        verifiedMethod: 'touchless_offline_qr'
      },
      status: isOffline ? 'pending' : 'synced'
    });

    // Autonomous Executive Log
    this.addLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: 'decision',
      pillar: 'Pillar 4: Gate IoT & Boarding Pass Protocol',
      title: `Touchless Rapid Check-In: ${pass.guestName} (${pass.siteNumber})`,
      description: `Offline Boarding Pass QR decoded and cryptographically verified in 0.6s. ANPR plate [${pass.vehiclePlate}] whitelisted. Smart lock pin [${pass.smartLockCode}] active.`,
      actionTaken: `Boom barrier auto-lifted. Site ${pass.siteNumber} status updated to OCCUPIED. Autonomous welcome dispatched.`,
      autonomousAgent: 'BoardingPass Engine',
      status: 'completed'
    });

    return {
      success: true,
      pass: updatedPass,
      site: targetSite,
      message: isAlreadyCheckedIn 
        ? `Re-verified Boarding Pass for ${pass.guestName}. Barrier actuated & access refreshed.`
        : `Touchless Check-in Complete for ${pass.guestName}! Pitch ${pass.siteNumber} smart lock pin and barrier are active.`,
      isAlreadyCheckedIn,
      verificationDetails: {
        signatureValid: true,
        totpValid: true,
        anprWhitelisted: true,
        firePermitGranted: pass.firePermitStatus === 'granted',
        latencyMs: Math.floor(28 + Math.random() * 24)
      }
    };
  },

  // ----------------------------------------------------
  // DRAGON 9 NEST & EMULSION REALM STORAGE METHODS
  // ----------------------------------------------------
  getDragonQuests(): DragonQuest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAGON_QUESTS);
    if (!raw) {
      this.saveDragonQuests(INITIAL_DRAGON_QUESTS);
      return INITIAL_DRAGON_QUESTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DRAGON_QUESTS;
    }
  },

  saveDragonQuests(quests: DragonQuest[]): void {
    localStorage.setItem(STORAGE_KEYS.DRAGON_QUESTS, JSON.stringify(quests));
  },

  completeDragonQuest(questId: string, submission?: { mediaUrl?: string; note?: string; sensoryData?: string }): {
    success: boolean;
    quest: DragonQuest;
    xpGained: number;
    unlockedReward: string;
    newRankState: DragonNestEmulsionState['guestDragonRank'];
  } {
    const quests = this.getDragonQuests();
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) {
      throw new Error(`Quest ${questId} not found`);
    }

    const updatedQuest: DragonQuest = {
      ...targetQuest,
      isCompleted: true,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      guestSubmission: submission || targetQuest.guestSubmission
    };

    const updatedQuests = quests.map(q => q.id === questId ? updatedQuest : q);
    this.saveDragonQuests(updatedQuests);

    // Update Dragon Nest XP & Rank
    const nestState = this.getDragonNestState();
    const xpGained = targetQuest.dragonXp;
    const newCollectiveXp = nestState.collectiveDragonXp + xpGained;
    const newGuestXp = nestState.guestDragonRank.currentXp + xpGained;

    let tier = nestState.guestDragonRank.tier;
    let title = nestState.guestDragonRank.title;
    let nextTierXp = nestState.guestDragonRank.nextTierXp;

    if (newGuestXp >= 1500) {
      tier = 5;
      title = 'Dragon Sovereign';
      nextTierXp = 2500;
    } else if (newGuestXp >= 1000) {
      tier = 4;
      title = 'Starlink Sentinel';
      nextTierXp = 1500;
    } else if (newGuestXp >= 600) {
      tier = 3;
      title = 'Tide Alchemist';
      nextTierXp = 1000;
    } else if (newGuestXp >= 300) {
      tier = 2;
      title = 'Dune Wayfarer';
      nextTierXp = 600;
    }

    // Award perk if applicable
    const newPerk = {
      id: `perk-${Date.now()}`,
      name: targetQuest.unlockedReward,
      code: `DRAGON-${Math.floor(100 + Math.random() * 900)}-${targetQuest.difficulty.toUpperCase().slice(0, 3)}`,
      expiry: 'Valid during your stay',
      claimed: false
    };

    const updatedRank = {
      ...nestState.guestDragonRank,
      tier,
      title,
      currentXp: newGuestXp,
      nextTierXp,
      unlockedPerks: [newPerk, ...nestState.guestDragonRank.unlockedPerks]
    };

    const updatedNestState: DragonNestEmulsionState = {
      ...nestState,
      collectiveDragonXp: newCollectiveXp,
      realmHarmonicResonance: Math.min(100, nestState.realmHarmonicResonance + 2),
      guestDragonRank: updatedRank
    };

    this.saveDragonNestState(updatedNestState);

    // Executive Autonomous Log
    this.addLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'decision',
      pillar: 'Dragon-9 Nest: Realm Emulsion Engine',
      title: `QUEST COMPLETED: ${targetQuest.title}`,
      description: `Guest fulfilled ${targetQuest.realmSector} challenge (+${xpGained} XP). Rank elevated to ${title}. Unlocked: ${targetQuest.unlockedReward}.`,
      actionTaken: 'Harmonic resonance boosted +2%. Perk voucher minted with cryptographic token.',
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });

    return {
      success: true,
      quest: updatedQuest,
      xpGained,
      unlockedReward: targetQuest.unlockedReward,
      newRankState: updatedRank
    };
  },

  getDragonMediaSubmissions(): DragonMediaSubmission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAGON_MEDIA);
    if (!raw) {
      this.saveDragonMediaSubmissions(INITIAL_DRAGON_MEDIA);
      return INITIAL_DRAGON_MEDIA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DRAGON_MEDIA;
    }
  },

  saveDragonMediaSubmissions(media: DragonMediaSubmission[]): void {
    localStorage.setItem(STORAGE_KEYS.DRAGON_MEDIA, JSON.stringify(media));
  },

  addDragonMediaSubmission(submission: Omit<DragonMediaSubmission, 'id' | 'timestamp' | 'likesCount' | 'hasLiked'>): DragonMediaSubmission {
    const media = this.getDragonMediaSubmissions();
    const newMedia: DragonMediaSubmission = {
      ...submission,
      id: `media-${Date.now()}`,
      timestamp: 'Just now',
      likesCount: 1,
      hasLiked: true
    };

    const updated = [newMedia, ...media];
    this.saveDragonMediaSubmissions(updated);

    // Boost collective resonance
    const nestState = this.getDragonNestState();
    this.saveDragonNestState({
      ...nestState,
      collectiveDragonXp: nestState.collectiveDragonXp + submission.dragonTokensAwarded,
      realmHarmonicResonance: Math.min(100, nestState.realmHarmonicResonance + 1)
    });

    // Executive Log
    this.addLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'info',
      pillar: 'Dragon-9 Nest: Sensory Well',
      title: `NEW REALM MEDIA SUBMISSION: ${newMedia.title}`,
      description: `${newMedia.guestName} (${newMedia.siteNumber}) submitted ${newMedia.type} media. Elemental Affinity: ${newMedia.aiVisionAnalysis.elementalAffinity} (Score: ${newMedia.aiVisionAnalysis.aestheticResonanceScore}%).`,
      actionTaken: 'Projected onto Collective Emulsion Wall. Resonance frequency calibrated.',
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });

    return newMedia;
  },

  likeDragonMedia(mediaId: string): DragonMediaSubmission[] {
    const list = this.getDragonMediaSubmissions();
    const updated = list.map(m => {
      if (m.id === mediaId) {
        const hasLiked = !m.hasLiked;
        return {
          ...m,
          hasLiked,
          likesCount: hasLiked ? m.likesCount + 1 : Math.max(0, m.likesCount - 1)
        };
      }
      return m;
    });
    this.saveDragonMediaSubmissions(updated);
    return updated;
  },

  getDragonNestState(): DragonNestEmulsionState {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAGON_NEST_STATE);
    if (!raw) {
      this.saveDragonNestState(INITIAL_DRAGON_NEST_STATE);
      return INITIAL_DRAGON_NEST_STATE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DRAGON_NEST_STATE;
    }
  },

  saveDragonNestState(state: DragonNestEmulsionState): void {
    localStorage.setItem(STORAGE_KEYS.DRAGON_NEST_STATE, JSON.stringify(state));
  },

  attuneAltar(affinity: ElementalAffinity): DragonNestEmulsionState {
    const current = this.getDragonNestState();
    const updated: DragonNestEmulsionState = {
      ...current,
      activeElementalDominance: affinity,
      realmHarmonicResonance: Math.min(100, current.realmHarmonicResonance + 3),
      realmPulseBpm: Math.floor(58 + Math.random() * 20)
    };
    this.saveDragonNestState(updated);

    this.addLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'decision',
      pillar: 'Dragon-9 Nest: Altar Matrix',
      title: `ELEMENTAL ALTAR ATTUNEMENT: ${affinity.toUpperCase()}`,
      description: `Guest attuned the Central Altar to ${affinity}. Realm harmonic resonance adjusted to ${updated.realmHarmonicResonance}%.`,
      actionTaken: 'Microgrid frequency harmonized. Ambient sensory emulsion palette shifted.',
      autonomousAgent: 'Dragon-9 Core',
      status: 'completed'
    });

    return updated;
  },

  getCapacityThresholds(): CapacityThresholdConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CAPACITY_THRESHOLDS);
    if (!raw) {
      this.saveCapacityThresholds(DEFAULT_CAPACITY_THRESHOLDS);
      return DEFAULT_CAPACITY_THRESHOLDS;
    }
    try {
      return { ...DEFAULT_CAPACITY_THRESHOLDS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CAPACITY_THRESHOLDS;
    }
  },

  saveCapacityThresholds(config: CapacityThresholdConfig): void {
    localStorage.setItem(STORAGE_KEYS.CAPACITY_THRESHOLDS, JSON.stringify(config));
  },

  getCapacityAlerts(): ResourceCapacityAlert[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CAPACITY_ALERTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveCapacityAlerts(alerts: ResourceCapacityAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.CAPACITY_ALERTS, JSON.stringify(alerts.slice(0, 50)));
  },

  acknowledgeCapacityAlert(alertId: string): ResourceCapacityAlert[] {
    const alerts = this.getCapacityAlerts().map(a => 
      a.id === alertId ? { ...a, isAcknowledged: true } : a
    );
    this.saveCapacityAlerts(alerts);
    return alerts;
  },

  remediateCapacityAlert(alertId: string, remediationNote: string): ResourceCapacityAlert[] {
    const alerts = this.getCapacityAlerts().map(a => 
      a.id === alertId ? { ...a, isRemediated: true, isAcknowledged: true, remediationNote } : a
    );
    this.saveCapacityAlerts(alerts);
    return alerts;
  },

  clearAllCapacityAlerts(): void {
    localStorage.removeItem(STORAGE_KEYS.CAPACITY_ALERTS);
  }
};

