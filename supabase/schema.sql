-- Supabase Schema for Drive Social
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    handle TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    trim TEXT,
    engine TEXT,
    transmission TEXT,
    photos TEXT[],
    modifications JSONB,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicles are viewable by everyone." ON vehicles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own vehicle." ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicle." ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicle." ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- 3. Squads Table
CREATE TABLE squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Squads are viewable by everyone." ON squads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create squads." ON squads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Squad creators can update squad." ON squads FOR UPDATE USING (auth.uid() = created_by);

-- 4. Squad Members Table
CREATE TABLE squad_members (
    squad_id UUID REFERENCES squads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (squad_id, user_id)
);

ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Squad members are viewable by everyone." ON squad_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join squads." ON squad_members FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can leave squads." ON squad_members FOR DELETE USING (auth.uid() = user_id);

-- 5. Drives Table
CREATE TABLE drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    squad_id UUID REFERENCES squads(id) ON DELETE SET NULL,
    title TEXT,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    top_speed_kmh NUMERIC DEFAULT 0,
    avg_speed_kmh NUMERIC DEFAULT 0,
    distance_km NUMERIC DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    route_coords JSONB, -- stores array of [lon, lat]
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public drives are viewable by everyone." ON drives FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own drives." ON drives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drives." ON drives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drives." ON drives FOR DELETE USING (auth.uid() = user_id);

-- 6. Squad Messages Table (Real-time chat)
CREATE TABLE squad_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES squads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE squad_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their squads." ON squad_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM squad_members WHERE squad_members.squad_id = squad_messages.squad_id AND squad_members.user_id = auth.uid())
);
CREATE POLICY "Users can send messages to their squads." ON squad_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM squad_members WHERE squad_members.squad_id = squad_messages.squad_id AND squad_members.user_id = auth.uid())
);

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_squads_updated_at BEFORE UPDATE ON squads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drives_updated_at BEFORE UPDATE ON drives FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable publication for real-time squad chat
ALTER PUBLICATION supabase_realtime ADD TABLE squad_messages;
