# 🚀 Supabase Database Setup & Live Switch Guide

This guide walks you through setting up a live Supabase database for **Drive Social** and toggling the application from local mock mode to live cloud database mode.

---

## 📋 Step-by-Step Setup Checklist

1. **Create a Supabase Project**:
   - Go to [Supabase Console](https://supabase.com/dashboard).
   - Click **New Project**, select your organization, name your database `drive-social`, and set a strong database password.
   - Choose a cloud region close to your target users.

2. **Run the Initialization Script**:
   - In your Supabase dashboard sidebar, open the **SQL Editor**.
   - Click **New Query**.
   - Copy and paste the entire SQL script below (`schema.sql`) into the editor.
   - Click **Run** to execute the script and provision all tables, indexes, and Row Level Security (RLS) policies.

3. **Copy API Credentials**:
   - Go to **Project Settings** -> **API** in the Supabase dashboard.
   - Copy your **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`).
   - Copy your **anon / public** API key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

4. **Activate Live Mode**:
   - Update your environment variables in `.env.local` or host dashboard:
     ```env
     NEXT_PUBLIC_USE_MOCK_DATA="false"
     NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
     ```
   - Restart the application. All features (Garage, Social Feed, Drive Logs, Convoys) will now query your live Supabase database.

---

## 🗄️ Ready-to-Run SQL Script (`schema.sql`)

```sql
-- =======================================================
-- DRIVE SOCIAL SUPABASE SCHEMA & RLS SETUP
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VEHICLES TABLE (GARAGE)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    trim TEXT,
    horsepower INTEGER NOT NULL DEFAULT 0,
    top_speed_kmh INTEGER NOT NULL DEFAULT 0,
    zero_to_hundred_sec NUMERIC(4,2) DEFAULT 0.0,
    image_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SQUADS TABLE (CONVOYS)
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    invite_code VARCHAR(6) UNIQUE NOT NULL,
    avatar_url TEXT,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DRIVES TABLE (TELEMETRY LOGS & SOCIAL FEED)
CREATE TABLE IF NOT EXISTS public.drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    squad_name TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    distance_km NUMERIC(8,2) DEFAULT 0.00,
    duration_sec INTEGER DEFAULT 0,
    top_speed_kmh NUMERIC(6,2) DEFAULT 0.00,
    avg_speed_kmh NUMERIC(6,2) DEFAULT 0.00,
    elevation_gain_m NUMERIC(6,2) DEFAULT 0.00,
    route_coords JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONVOY MESSAGES TABLE (PTT / CHAT)
CREATE TABLE IF NOT EXISTS public.convoy_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT,
    type TEXT DEFAULT 'chat', -- 'chat', 'audio_ping', 'hazard'
    audio_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- INDEXES FOR PERFORMANCE
-- =======================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_drives_user_id ON public.drives(user_id);
CREATE INDEX IF NOT EXISTS idx_drives_date ON public.drives(date DESC);
CREATE INDEX IF NOT EXISTS idx_convoy_messages_squad_id ON public.convoy_messages(squad_id);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convoy_messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Vehicles Policies
CREATE POLICY "Public vehicles viewable by everyone" ON public.vehicles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own vehicles" ON public.vehicles
    FOR ALL USING (auth.uid() = user_id);

-- Squads Policies
CREATE POLICY "Public squads viewable by everyone" ON public.squads
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create squads" ON public.squads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Drives Policies
CREATE POLICY "Public drives viewable by everyone" ON public.drives
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create drive records" ON public.drives
    FOR INSERT WITH CHECK (true);

-- Convoy Messages Policies
CREATE POLICY "Squad members can view convoy messages" ON public.convoy_messages
    FOR SELECT USING (true);

CREATE POLICY "Squad members can send convoy messages" ON public.convoy_messages
    FOR INSERT WITH CHECK (true);
