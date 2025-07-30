import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
      } else {
        setUser(session.user);
        // Fetch user profile with subscription info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
      setAuthChecked(true);
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        window.location.href = '/login';
      } else {
        setUser(session.user);
        // Refresh profile on auth state change
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
    });
    
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch leads for this user
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        setLeads(leadsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Real-time subscription for leads
    const leadsSubscription = supabase
      .channel('public:leads')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads(leads => [payload.new, ...leads]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads(leads => 
              leads.map(lead => 
                lead.id === payload.new.id ? payload.new : lead
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLeads(leads => leads.filter(lead => lead.id !== payload.old.id));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(leadsSubscription);
    };
  }, [user]);

  const handleUpgrade = async () => {
    // Redirect to pricing/upgrade page
    window.location.href = '/pricing';
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#181c30] to-[#1a223f]">
        <div className="text-white text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  const isTrial = profile?.subscription_status === 'trial';
  const isPaid = profile?.subscription_status === 'active';
  const trialDaysLeft = profile?.trial_ends_at 
    ? Math.ceil((new Date(profile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c30] to-[#1a223f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-300 mt-1">
              {isTrial && `Trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''}`}
              {isPaid && `Active until ${new Date(profile.current_period_end).toLocaleDateString()}`}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link 
              href="/" 
              className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              ← Back to Riva
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {isTrial && (
          <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-300">
                  {trialDaysLeft > 0 
                    ? `Your trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''}` 
                    : 'Your trial has ended'}
                </h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p>
                    {trialDaysLeft > 0 
                      ? 'Upgrade now to continue accessing all features after your trial ends.'
                      : 'Your trial has ended. Upgrade now to continue using Riva.'}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  >
                    {trialDaysLeft > 0 ? 'Upgrade Now' : 'Upgrade Your Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
              <div className="px-6 py-5 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">Your Leads</h2>
                  <span className="px-3 py-1 text-xs font-semibold text-green-300 bg-green-900/30 rounded-full">
                    {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-900/30 px-6 py-5">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : leads.length > 0 ? (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-white">{lead.name || 'New Lead'}</h3>
                            <p className="text-sm text-gray-400">{lead.email || lead.phone || 'No contact info'}</p>
                          </div>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-900/50 text-blue-300">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {lead.message && (
                          <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                            {lead.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-300">No leads yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your leads will appear here when you receive them.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
              <div className="px-6 py-5 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Account Information</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {user?.email}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isTrial ? 'Trial Account' : isPaid ? 'Paid Account' : 'Free Account'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plan
                    </h4>
                    <p className="mt-1 text-sm text-white">
                      {profile?.plan_name || 'Free Trial'}
                    </p>
                  </div>
                  
                  {isPaid && profile?.current_period_end && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Next Billing Date
                      </h4>
                      <p className="mt-1 text-sm text-white">
                        {new Date(profile.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Link
                      href="/account/billing"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Manage Subscription
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
              <div className="px-6 py-5 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                <a
                  href="#"
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Lead
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Billing & Invoices
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}