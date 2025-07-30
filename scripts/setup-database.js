const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables.');
  console.log('Please make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    console.log('Using Supabase URL:', supabaseUrl.replace(/\/auth.*$/, ''));

    // Check if leads table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (checkError?.code === '42P01') { // Table doesn't exist
      console.log('Creating leads table...');
      await createLeadsTable();
    } else if (checkError) {
      console.error('Error checking for leads table:', checkError);
      throw checkError;
    } else {
      console.log('Leads table already exists');
    }

    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

async function executeSql(queries) {
  // Execute each query sequentially
  for (const query of Array.isArray(queries) ? queries : [queries]) {
    console.log('Executing:', query.split('\n')[0].trim() + '...');
    const { error } = await supabase.rpc('pg_temp.execute_sql', { query });
    if (error) {
      // If the function doesn't exist, create it
      if (error.message.includes('function pg_temp.execute_sql(unknown) does not exist')) {
        console.log('Creating temporary SQL execution function...');
        await supabase.rpc('create_temp_execute_sql');
        // Retry the query
        const retry = await supabase.rpc('pg_temp.execute_sql', { query });
        if (retry.error) throw retry.error;
      } else {
        throw error;
      }
    }
  }
}

async function createLeadsTable() {
  try {
    console.log('Creating leads table...');
    
    // Create the SQL execution function if it doesn't exist
    await supabase.rpc(`
      create or replace function pg_temp.create_temp_execute_sql()
      returns void as $$
      begin
        create or replace function pg_temp.execute_sql(query text)
        returns void
        language plpgsql
        as $$
        begin
          execute query;
        end;
        $$;
      end;
      $$ language plpgsql;
    `);

    // Create the table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS public.leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        assigned_to UUID REFERENCES auth.users(id),
        source TEXT,
        metadata JSONB
      );
    `);

    console.log('Created leads table');

    // Create indexes
    await executeSql([
      `CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at)`
    ]);

    console.log('Created indexes');

    // Enable RLS
    await executeSql('ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY');
    console.log('Enabled Row Level Security');

    // Create RLS policies
    await executeSql([
      `DROP POLICY IF EXISTS "Enable read access for all users" ON public.leads`,
      `DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.leads`,
      `DROP POLICY IF EXISTS "Enable update for admins" ON public.leads`,
      `
      CREATE POLICY "Enable read access for all users" ON public.leads
        FOR SELECT USING (true);
      `,
      `
      CREATE POLICY "Enable insert for authenticated users" ON public.leads
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      `,
      `
      CREATE POLICY "Enable update for admins" ON public.leads
        FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = assigned_to);
      `
    ]);

    console.log('Created RLS policies');
    
  } catch (error) {
    console.error('Error in createLeadsTable:', error);
    throw error;
  }
}

// Run the setup
setupDatabase();
