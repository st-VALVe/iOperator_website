-- ============================================================================
-- Migration 005: Customers, Orders, and Events tables
-- 
-- Hybrid architecture: Supabase stores lightweight customer cards + order
-- records. Full conversation history lives in Telegram forum topics,
-- accessed via deep links (telegram_topic_id + telegram_group_id).
-- ============================================================================

-- ============================================================================
-- 1. Customers table
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Identity
  display_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  syrve_customer_id TEXT,
  
  -- Channel info
  primary_channel TEXT CHECK (primary_channel IN ('telegram', 'whatsapp', 'instagram', 'teletype')),
  telegram_chat_id TEXT,
  whatsapp_phone TEXT,
  
  -- Telegram conversation link (for deep links: t.me/c/{group_id}/{topic_id})
  telegram_topic_id INTEGER,
  telegram_group_id TEXT,
  
  -- Aggregated stats (updated by bot on each order)
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  trust_level TEXT DEFAULT 'new' CHECK (trust_level IN ('new', 'verified', 'suspicious')),
  preferred_language TEXT,
  
  -- Timestamps
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraints: one customer record per channel per business
  UNIQUE(business_id, telegram_chat_id),
  UNIQUE(business_id, whatsapp_phone)
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_syrve_id ON customers(syrve_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_last_seen ON customers(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_display_name ON customers(display_name);

-- Updated_at trigger
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers for their business"
  ON customers FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================================
-- 2. Customer Orders table
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Syrve order data
  syrve_order_id TEXT,
  external_number TEXT,
  
  -- Order details
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card')),
  restaurant TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'confirmed', 'cooking', 'delivering', 'delivered', 'cancelled')),
  
  -- Channel the order was placed from
  channel TEXT CHECK (channel IN ('telegram', 'whatsapp', 'instagram', 'teletype')),
  
  -- Timestamps
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for customer_orders
CREATE INDEX IF NOT EXISTS idx_customer_orders_customer_id ON customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_business_id ON customer_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_syrve_order_id ON customer_orders(syrve_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_ordered_at ON customer_orders(ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);

-- Updated_at trigger
CREATE TRIGGER update_customer_orders_updated_at
  BEFORE UPDATE ON customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders for their business"
  ON customer_orders FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage orders"
  ON customer_orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================================
-- 3. Customer Events table
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Event data
  event_type TEXT NOT NULL CHECK (event_type IN (
    'first_contact',
    'escalation',
    'resolved',
    'order_issue',
    'channel_linked'
  )),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for customer_events
CREATE INDEX IF NOT EXISTS idx_customer_events_customer_id ON customer_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_events_business_id ON customer_events(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_events_type ON customer_events(event_type);
CREATE INDEX IF NOT EXISTS idx_customer_events_created_at ON customer_events(created_at DESC);

-- RLS
ALTER TABLE customer_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their business"
  ON customer_events FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage events"
  ON customer_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
