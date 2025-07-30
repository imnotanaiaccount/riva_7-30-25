import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { subscribeToLeadsWithFetch } from '../../utils/realtime';
import Layout from '../../components/Layout';
import LeadCard from '../../components/LeadCard';
import UserManagement from '../../components/admin/UserManagement';
import StatsOverview from '../../components/admin/StatsOverview';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, leads, and system settings</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to My Dashboard
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['leads', 'users', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {activeTab === 'leads' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">All Leads</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/leads/import')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Import Leads
                  </button>
                  <button
                    onClick={() => router.push('/leads/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add New Lead
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {leads.length > 0 ? (
                    leads.map((lead) => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        isAdmin={true}
                        onUpdate={() => {
                          // Trigger a re-fetch on update
                          setLeads(prevLeads => [...prevLeads]);
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No leads found. Add your first lead to get started.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}
          
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">System Settings</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Settings are coming soon. Check back later for more configuration options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
