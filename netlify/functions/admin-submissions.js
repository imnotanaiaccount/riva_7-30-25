const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

exports.handler = async function(event, context) {
  // Check admin key in Authorization header
  const authHeader = event.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token || token !== adminSecretKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // Parse query params for pagination and filtering
  const params = event.queryStringParameters || {};
  const page = parseInt(params.page, 10) || 1;
  const pageSize = parseInt(params.pageSize, 10) || 20;
  const status = params.status && params.status !== 'all' ? params.status : null;
  const plan = params.plan && params.plan !== 'all' ? params.plan : null;
  const verified = params.verified && params.verified !== 'all' ? params.verified === 'true' : null;
  let query = supabase.from('submissions').select('*', { count: 'exact' });
  if (status) query = query.eq('status', status);
  if (plan) query = query.eq('plan', plan);
  if (verified !== null) query = query.eq('verified', verified);
  query = query.order('created_at', { ascending: false });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await query;
  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ submissions: data, total: count })
  };
}; 