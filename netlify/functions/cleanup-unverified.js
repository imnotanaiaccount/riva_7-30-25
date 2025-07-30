const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function(event, context) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  // Find unverified signups older than 7 days
  const { data, error } = await supabase
    .from('submissions')
    .select('id')
    .eq('verified', false)
    .lt('created_at', sevenDaysAgo);
  if (error) {
    return { statusCode: 500, body: 'Error finding unverified signups' };
  }
  if (data.length === 0) {
    return { statusCode: 200, body: 'No unverified signups to expire' };
  }
  const ids = data.map(d => d.id);
  await supabase.from('submissions').update({ status: 'expired' }).in('id', ids);
  return { statusCode: 200, body: `Expired ${ids.length} unverified signups` };
}; 