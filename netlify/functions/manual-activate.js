const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function(event, context) {
  const { id } = JSON.parse(event.body || '{}');
  if (!id) {
    return { statusCode: 400, body: 'Missing id' };
  }
  // Fetch submission
  const { data, error } = await supabase.from('submissions').select('*').eq('id', id).single();
  if (error || !data) {
    return { statusCode: 404, body: 'Submission not found' };
  }
  const newStatus = data.plan === 'trial' ? 'trial_active' : 'active';
  await supabase.from('submissions').update({ verified: true, status: newStatus }).eq('id', id);
  return { statusCode: 200, body: 'User manually activated' };
}; 