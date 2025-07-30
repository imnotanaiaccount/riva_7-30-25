-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  job_title TEXT,
  website TEXT,
  lead_source TEXT,
  status TEXT DEFAULT 'new',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted'))
);

-- Create lead_distribution table
CREATE TABLE IF NOT EXISTS public.lead_distribution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, client_id),
  CONSTRAINT valid_distribution_status CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'rejected'))
);

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_distribution_lead_id ON public.lead_distribution(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_distribution_client_id ON public.lead_distribution(client_id);

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('leads', 'clients', 'lead_distribution', 'automation_rules')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_modtime ON %I.%I', 
                      t.table_name, t.table_schema, t.table_name);
        EXECUTE format('CREATE TRIGGER update_%s_modtime
                       BEFORE UPDATE ON %I.%I
                       FOR EACH ROW EXECUTE FUNCTION update_modified_column()',
                      t.table_name, t.table_schema, t.table_name);
    END LOOP;
END;
$$;
