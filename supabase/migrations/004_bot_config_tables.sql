-- =============================================
-- iOperator.ai Platform - Bot Configuration Tables
-- Universal business-agnostic schema for bot control
-- =============================================

-- =============================================
-- 1. Locations Table (branches, offices, dispatch points)
-- Each location can have its own CRM credentials and settings
-- =============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages locations" ON locations;
CREATE POLICY "Owner manages locations" ON locations
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_locations_business_id ON locations(business_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. Service Areas Table (coverage zones per location)
-- Stores H3 hexagonal grid data and GeoJSON boundaries
-- =============================================
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  hexes TEXT[] DEFAULT '{}',
  resolution INTEGER DEFAULT 8,
  geojson JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages service areas" ON service_areas;
CREATE POLICY "Owner manages service areas" ON service_areas
  FOR ALL USING (
    location_id IN (
      SELECT id FROM locations
      WHERE business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_service_areas_location_id ON service_areas(location_id);

DROP TRIGGER IF EXISTS update_service_areas_updated_at ON service_areas;
CREATE TRIGGER update_service_areas_updated_at
  BEFORE UPDATE ON service_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. Service Area Restrictions Table
-- Temporary restrictions on service availability
-- =============================================
CREATE TABLE IF NOT EXISTS service_area_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('location_closed', 'area_excluded', 'capacity_limited', 'custom')),
  affected_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  reason TEXT,
  excluded_areas JSONB DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  customer_message TEXT,
  alternatives JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_area_restrictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages restrictions" ON service_area_restrictions;
CREATE POLICY "Owner manages restrictions" ON service_area_restrictions
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_restrictions_business_id ON service_area_restrictions(business_id);
CREATE INDEX IF NOT EXISTS idx_restrictions_is_active ON service_area_restrictions(is_active);
CREATE INDEX IF NOT EXISTS idx_restrictions_type ON service_area_restrictions(type);

DROP TRIGGER IF EXISTS update_restrictions_updated_at ON service_area_restrictions;
CREATE TRIGGER update_restrictions_updated_at
  BEFORE UPDATE ON service_area_restrictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. Promotions Table (discounts, offers, pricing rules)
-- =============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('day_of_week', 'time_range', 'fixed', 'custom')),
  params JSONB NOT NULL DEFAULT '{}',
  product_patterns TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages promotions" ON promotions;
CREATE POLICY "Owner manages promotions" ON promotions
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_promotions_business_id ON promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_promotions_is_enabled ON promotions(is_enabled);

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. Bot Settings Table (categorized key-value config)
-- Stores all bot configuration as categorized settings
-- =============================================
CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, category, key)
);

ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages bot settings" ON bot_settings;
CREATE POLICY "Owner manages bot settings" ON bot_settings
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_bot_settings_business_id ON bot_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_bot_settings_category ON bot_settings(category);
CREATE INDEX IF NOT EXISTS idx_bot_settings_business_category ON bot_settings(business_id, category);

DROP TRIGGER IF EXISTS update_bot_settings_updated_at ON bot_settings;
CREATE TRIGGER update_bot_settings_updated_at
  BEFORE UPDATE ON bot_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
