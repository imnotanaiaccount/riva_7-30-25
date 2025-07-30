import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { subscribeToLeadsWithFetch } from '../../utils/realtime';
import Layout from '../../components/Layout';
import LeadCard from '../../components/LeadCard';
import UserManagement from '../../components/admin/UserManagement';
import StatsOverview from '../../components/admin/StatsOverview';
import LeadMagnets from '../../components/admin/LeadMagnets';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is admin
  const isAdmin = user?.user_metadata?.is_admin || false;

  // Set up real-time subscription for leads
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToLeadsWithFetch(
      { isAdmin: true },
      (updatedLeads) => {
        setLeads(updatedLeads);
        setLoading(false);
      },
      (error) => {
        console.error('Error in leads subscription:', error);
        setError('Failed to load leads. Please refresh the page.');
        setLoading(false);
      }
    );

    // Fetch lead magnets
    const fetchLeadMagnets = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_magnets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeadMagnets(data || []);
      } catch (err) {
        console.error('Error fetching lead magnets:', err);
        setError('Failed to load lead magnets');
      }
    };

    fetchLeadMagnets();

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router, isAdmin]);

  if (authLoading || (user && !isAdmin)) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab('lead-magnets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lead-magnets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lead Magnets
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'leads' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Leads Overview</h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} isAdmin={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lead-magnets' && (
            <LeadMagnets 
              leadMagnets={leadMagnets} 
              onLeadMagnetUpdate={(updated) => {
                setLeadMagnets(leadMagnets.map(lm => 
                  lm.id === updated.id ? updated : lm
                ));
              }}
            />
          )}

          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'analytics' && <StatsOverview />}
        </div>
      </div>
    </Layout>
  );
}
