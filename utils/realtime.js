import { supabase } from './supabase';

/**
 * Subscribe to real-time updates for leads
 * @param {Object} options - Subscription options
 * @param {string} [options.userId] - Optional user ID to filter leads by assigned_to
 * @param {boolean} [options.isAdmin=false] - Whether the current user is an admin
 * @param {Function} onUpdate - Callback function when leads are updated
 * @returns {Function} Unsubscribe function
 */
export function subscribeToLeads({ userId, isAdmin = false }, onUpdate) {
  // Create a channel for real-time updates
  const channel = supabase
    .channel('leads_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: !isAdmin && userId ? `assigned_to=eq.${userId}` : undefined,
      },
      (payload) => {
        // Call the provided callback with the payload
        onUpdate(payload);
      }
    )
    .subscribe();

  // Return the unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch leads with optional filtering
 * @param {Object} options - Fetch options
 * @param {string} [options.userId] - Optional user ID to filter leads by assigned_to
 * @param {boolean} [options.isAdmin=false] - Whether the current user is an admin
 * @returns {Promise<Array>} Array of leads
 */
export async function fetchLeads({ userId, isAdmin = false } = {}) {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    // If not admin, only fetch assigned leads
    if (!isAdmin && userId) {
      query = query.eq('assigned_to', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

/**
 * Subscribe to lead updates with automatic fetching
 * @param {Object} options - Subscription options
 * @param {string} [options.userId] - Optional user ID to filter leads by assigned_to
 * @param {boolean} [options.isAdmin=false] - Whether the current user is an admin
 * @param {Function} setLeads - State setter function for leads
 * @param {Function} [onError] - Optional error handler
 * @returns {Function} Unsubscribe function
 */
export function subscribeToLeadsWithFetch({ userId, isAdmin = false }, setLeads, onError) {
  // Initial fetch
  fetchLeads({ userId, isAdmin })
    .then(leads => setLeads(leads))
    .catch(error => {
      console.error('Error in initial leads fetch:', error);
      if (onError) onError(error);
    });

  // Set up real-time subscription
  return subscribeToLeads(
    { userId, isAdmin },
    async () => {
      try {
        const updatedLeads = await fetchLeads({ userId, isAdmin });
        setLeads(updatedLeads);
      } catch (error) {
        console.error('Error in real-time update:', error);
        if (onError) onError(error);
      }
    }
  );
}
