const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const leadData = JSON.parse(event.body);
    
    // Validate required fields
    if (!leadData.email && !leadData.phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email or phone number is required' })
      };
    }

    // Insert lead into database
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        company_name: leadData.company_name,
        job_title: leadData.job_title,
        website: leadData.website,
        lead_source: leadData.lead_source || 'website',
        metadata: leadData.metadata || {}
      }])
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create lead' })
      };
    }

    // Get active clients who should receive this lead
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return {
        statusCode: 200, // Still return success for the lead creation
        body: JSON.stringify({ 
          success: true, 
          lead_id: lead.id,
          message: 'Lead created but client distribution failed',
          error: clientsError.message 
        })
      };
    }

    // Create distribution records for each client
    const distributionRecords = clients.map(client => ({
      lead_id: lead.id,
      client_id: client.id,
      status: 'pending'
    }));

    const { error: distError } = await supabase
      .from('lead_distribution')
      .insert(distributionRecords);

    if (distError) {
      console.error('Error creating distribution records:', distError);
      return {
        statusCode: 200, // Still return success for the lead creation
        body: JSON.stringify({ 
          success: true, 
          lead_id: lead.id,
          message: 'Lead created but distribution records failed',
          error: distError.message 
        })
      };
    }

    // Process automation rules in the background
    context.callbackWaitsForEmptyEventLoop = false;
    processAutomationRules(lead);

    return {
      statusCode: 201,
      body: JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: 'Lead created and queued for distribution' 
      })
    };

  } catch (error) {
    console.error('Error in create-lead:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Process automation rules in the background
async function processAutomationRules(lead) {
  try {
    // Get active automation rules ordered by priority
    const { data: rules, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;

    for (const rule of rules) {
      try {
        const conditionsMet = await evaluateConditions(rule.conditions, lead);
        if (conditionsMet) {
          await executeActions(rule.actions, lead);
          // If rule specifies to stop processing further rules
          if (rule.stop_on_match) break;
        }
      } catch (ruleError) {
        console.error(`Error processing rule ${rule.id}:`, ruleError);
      }
    }
  } catch (error) {
    console.error('Error in processAutomationRules:', error);
  }
}

async function evaluateConditions(conditions, lead) {
  // Implement condition evaluation logic
  // This is a simplified example - you'll want to expand this
  return true; // Placeholder
}

async function executeActions(actions, lead) {
  // Implement action execution logic
  // This is a simplified example - you'll want to expand this
  console.log('Executing actions for lead:', lead.id);
}
