-- ============================================================
-- Smart Car Finder - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with app-specific fields
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: cars
-- Stores user vehicle information
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cars (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_name              TEXT NOT NULL,
  car_model             TEXT NOT NULL,
  bluetooth_device_name TEXT NOT NULL DEFAULT '',
  color                 TEXT,
  license_plate         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: parking_locations
-- Stores every parking event with GPS coordinates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parking_locations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id       UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  address      TEXT,
  notes        TEXT,
  parked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retrieved_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cars_user_id            ON public.cars(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_user_id         ON public.parking_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_car_id          ON public.parking_locations(car_id);
CREATE INDEX IF NOT EXISTS idx_parking_parked_at       ON public.parking_locations(parked_at DESC);
CREATE INDEX IF NOT EXISTS idx_parking_user_parked     ON public.parking_locations(user_id, parked_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- cars
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cars"
  ON public.cars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cars"
  ON public.cars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars"
  ON public.cars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars"
  ON public.cars FOR DELETE
  USING (auth.uid() = user_id);

-- parking_locations
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parking locations"
  ON public.parking_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parking locations"
  ON public.parking_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parking locations"
  ON public.parking_locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own parking locations"
  ON public.parking_locations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on cars
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- VIEWS (optional helpers)
-- ============================================================

-- Latest parking per car
CREATE OR REPLACE VIEW public.latest_parking AS
  SELECT DISTINCT ON (car_id)
    pl.*,
    c.car_name,
    c.car_model,
    c.bluetooth_device_name,
    c.color
  FROM public.parking_locations pl
  JOIN public.cars c ON c.id = pl.car_id
  ORDER BY car_id, parked_at DESC;

-- ============================================================
-- SAMPLE DATA (optional - for testing)
-- Uncomment to insert test data after signing up
-- ============================================================

-- INSERT INTO public.cars (user_id, car_name, car_model, bluetooth_device_name, color, license_plate)
-- VALUES (
--   auth.uid(),
--   'My Honda',
--   'Honda City 2022',
--   'Honda City Audio',
--   '#4c6ef5',
--   'MH 01 AB 1234'
-- );
