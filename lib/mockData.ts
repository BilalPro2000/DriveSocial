export interface UserProfile {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string;
  bio: string;
  emergency_contact?: string;
}

export interface DriveRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_handle: string;
  user_avatar: string;
  squad_name?: string;
  title: string;
  start_time: string;
  end_time?: string;
  top_speed_kmh: number;
  avg_speed_kmh: number;
  distance_km: number;
  duration_seconds: number;
  route_coords: [number, number][];
  is_public: boolean;
  likes_count: number;
  is_liked?: boolean;
  comments_count: number;
  created_at: string;
  vehicle_info?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  photos: string[];
  modifications: { name: string; category: string; cost?: string }[];
  is_primary: boolean;
}

export interface Squad {
  id: string;
  name: string;
  invite_code: string;
  avatar_url: string;
  member_count: number;
  created_at: string;
}

export interface SquadMessage {
  id: string;
  squad_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  message: string;
  created_at: string;
}

export const INITIAL_PROFILE: UserProfile = {
  id: 'user_1',
  display_name: 'Alex Vance',
  handle: '@apex_vance',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Apex hunter | Porsche 911 GT3 RS & Golf R MK8 | Weekend canyon runner 🏎️💨',
};

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    user_id: 'user_1',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2023,
    trim: 'Weissach Package',
    engine: '4.0L Flat-6 NA (518 HP)',
    transmission: '7-Speed PDK',
    is_primary: true,
    photos: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
    ],
    modifications: [
      { name: 'Manthey Racing Coilover Suspension', category: 'Suspension' },
      { name: 'Akrapovič Titanium Slip-On Race Exhaust', category: 'Exhaust' },
      { name: 'BBS FI-R Forged Monoblock Wheels', category: 'Wheels & Tires' },
    ],
  },
  {
    id: 'veh_2',
    user_id: 'user_1',
    make: 'Volkswagen',
    model: 'Golf R',
    year: 2022,
    trim: 'MK8 Performance',
    engine: '2.0L EA888 TSI Turbo (315 HP)',
    transmission: '6-Speed Manual',
    is_primary: false,
    photos: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80'
    ],
    modifications: [
      { name: 'IE Stage 1 ECU Tune', category: 'Engine' },
      { name: 'Eventuri Carbon Fiber Intake', category: 'Intake' },
    ],
  },
  {
    id: 'veh_3',
    user_id: 'user_1',
    make: 'BMW',
    model: 'M4 CSL',
    year: 2023,
    trim: 'Competition Sport Lightweight',
    engine: '3.0L Twin-Turbo Inline-6 (543 HP)',
    transmission: '8-Speed M Steptronic',
    is_primary: false,
    photos: [
      'https://images.unsplash.com/photo-1627454820516-dc7671ceaf86?w=800&auto=format&fit=crop&q=80'
    ],
    modifications: [
      { name: 'M Carbon Ceramic Brakes', category: 'Brakes' },
      { name: 'M Performance Titanium Exhaust', category: 'Exhaust' },
      { name: 'Michelin Pilot Sport Cup 2 R', category: 'Wheels & Tires' },
    ],
  },
];

export const INITIAL_SQUADS: Squad[] = [
  {
    id: 'squad_1',
    name: 'Canyon Apex Crew',
    invite_code: 'APEX99',
    avatar_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&auto=format&fit=crop&q=80',
    member_count: 14,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'squad_2',
    name: 'Pacific Coast Cruisers',
    invite_code: 'PCH101',
    avatar_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&auto=format&fit=crop&q=80',
    member_count: 28,
    created_at: '2024-02-01T12:00:00Z',
  },
];

export const INITIAL_DRIVES: DriveRecord[] = [
  {
    id: 'drive_101',
    user_id: 'user_2',
    user_name: 'Elena Rostova',
    user_handle: '@elena_gt3',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    squad_name: 'Canyon Apex Crew',
    title: 'Mulholland Highway Sunrise Attack 🌅',
    start_time: '2026-08-06T06:15:00Z',
    top_speed_kmh: 184,
    avg_speed_kmh: 88,
    distance_km: 42.5,
    duration_seconds: 1738,
    route_coords: [
      [-118.82, 34.10],
      [-118.80, 34.11],
      [-118.78, 34.09],
      [-118.75, 34.08],
      [-118.72, 34.07]
    ],
    is_public: true,
    likes_count: 34,
    is_liked: true,
    comments_count: 8,
    created_at: '2026-08-06T07:30:00Z',
    vehicle_info: '2023 Porsche 911 GT3',
  },
  {
    id: 'drive_102',
    user_id: 'user_3',
    user_name: 'Marcus Chen',
    user_handle: '@mchen_m3',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    squad_name: 'Pacific Coast Cruisers',
    title: 'PCH Highway 1 Coastal Run 🌊',
    start_time: '2026-08-05T16:20:00Z',
    top_speed_kmh: 142,
    avg_speed_kmh: 76,
    distance_km: 88.2,
    duration_seconds: 4180,
    route_coords: [
      [-121.90, 36.60],
      [-121.85, 36.50],
      [-121.80, 36.40],
      [-121.75, 36.30]
    ],
    is_public: true,
    likes_count: 51,
    is_liked: false,
    comments_count: 12,
    created_at: '2026-08-05T18:00:00Z',
    vehicle_info: '2021 BMW M3 Competition',
  },
  {
    id: 'drive_103',
    user_id: 'user_1',
    user_name: 'Alex Vance',
    user_handle: '@apex_vance',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    squad_name: 'Canyon Apex Crew',
    title: 'Angeles Crest Highway Night Run 🌙',
    start_time: '2026-08-04T21:00:00Z',
    top_speed_kmh: 198,
    avg_speed_kmh: 94,
    distance_km: 64.0,
    duration_seconds: 2450,
    route_coords: [
      [-118.15, 34.20],
      [-118.10, 34.25],
      [-118.05, 34.30],
      [-118.00, 34.35]
    ],
    is_public: true,
    likes_count: 89,
    is_liked: true,
    comments_count: 15,
    created_at: '2026-08-04T22:15:00Z',
    vehicle_info: '2023 Porsche 911 GT3 RS',
  },
  {
    id: 'drive_104',
    user_id: 'user_4',
    user_name: 'Sarah Jenkins',
    user_handle: '@sarah_jdm',
    user_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    squad_name: 'JDM Legends',
    title: 'Midnight Wangan Run 🗼',
    start_time: '2026-08-03T23:30:00Z',
    top_speed_kmh: 210,
    avg_speed_kmh: 110,
    distance_km: 120.5,
    duration_seconds: 3800,
    route_coords: [
      [-118.25, 34.05],
      [-118.20, 34.10],
      [-118.15, 34.15],
      [-118.10, 34.20]
    ],
    is_public: true,
    likes_count: 112,
    is_liked: false,
    comments_count: 24,
    created_at: '2026-08-04T01:00:00Z',
    vehicle_info: '1999 Nissan Skyline GT-R R34',
  },
  {
    id: 'drive_105',
    user_id: 'user_5',
    user_name: 'David Kim',
    user_handle: '@dk_drift',
    user_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    squad_name: 'Slide Syndicate',
    title: 'Touge Practice at Mt. Akina 🏔️',
    start_time: '2026-08-02T05:00:00Z',
    top_speed_kmh: 120,
    avg_speed_kmh: 65,
    distance_km: 25.8,
    duration_seconds: 1500,
    route_coords: [
      [-118.30, 34.20],
      [-118.28, 34.22],
      [-118.26, 34.21],
      [-118.24, 34.23]
    ],
    is_public: true,
    likes_count: 75,
    is_liked: true,
    comments_count: 18,
    created_at: '2026-08-02T06:30:00Z',
    vehicle_info: '1986 Toyota Corolla AE86',
  }
];

export const INITIAL_MESSAGES: SquadMessage[] = [
  {
    id: 'msg_1',
    squad_id: 'squad_1',
    user_id: 'user_2',
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    message: 'Convoy meeting at Stunt Road turnout tomorrow morning at 06:00 AM sharp! 🏎️',
    created_at: '2026-08-06T18:30:00Z',
  },
  {
    id: 'msg_2',
    squad_id: 'squad_1',
    user_id: 'user_3',
    user_name: 'Marcus Chen',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    message: 'Tires warmed up! Bringing the M3 today.',
    created_at: '2026-08-06T18:45:00Z',
  },
  {
    id: 'msg_3',
    squad_id: 'squad_1',
    user_id: 'user_1',
    user_name: 'Alex Vance',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    message: 'GT3 RS is fueled and ready. See you all at sunrise!',
    created_at: '2026-08-06T19:00:00Z',
  }
];
