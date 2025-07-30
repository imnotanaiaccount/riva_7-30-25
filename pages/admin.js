import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import LeadsDashboard from '../components/LeadsDashboard';

async function resendVerification(id) {
  try {
    setActionLoading(prev => ({ ...prev, [id]: 'resend' }));
    setActionStatus(prev => ({ ...prev, [id]: null }));
    const response = await fetch('/.netlify/functions/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to resend verification');
    setActionStatus(prev => ({ ...prev, [id]: { type: 'success', message: 'Verification email resent!' } }));
    await fetchSubmissions(); // Refresh the data
  } catch (error) {
    console.error('Error resending verification:', error);
    setActionStatus(prev => ({ ...prev, [id]: { type: 'error', message: error.message } }));
  } finally {
    setActionLoading(prev => ({ ...prev, [id]: false }));
  }
}

async function manualActivate(id) {
  try {
    setActionLoading(prev => ({ ...prev, [id]: 'activate' }));
    setActionStatus(prev => ({ ...prev, [id]: null }));
    const response = await fetch('/.netlify/functions/manual-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to manually activate');
    setActionStatus(prev => ({ ...prev, [id]: { type: 'success', message: 'Account activated successfully!' } }));
    await fetchSubmissions(); // Refresh the data
  } catch (error) {
    console.error('Error activating account:', error);
    setActionStatus(prev => ({ ...prev, [id]: { type: 'error', message: error.message } }));
  } finally {
    setActionLoading(prev => ({ ...prev, [id]: false }));
  }
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'users'
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [planFilter, setPlanFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [actionStatus, setActionStatus] = useState({});

  const fetchSubmissions = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      pageSize,
      status: statusFilter,
      plan: planFilter,
      verified: verifiedFilter
    });
    const res = await fetch('/.netlify/functions/admin-submissions?' + params.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || ''}`
      }
    });
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, pageSize, statusFilter, planFilter, verifiedFilter]);

  // Check admin status on component mount
  useEffect(() => {
    // You might want to implement a more secure admin check
    const checkAdmin = async () => {
      // This is a placeholder - implement your actual admin check
      setIsAdmin(true);
    };
    checkAdmin();
  }, []);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">You don't have permission to access this page.</p>
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold">Riva Admin</h1>
                </div>
                <nav className="ml-8 flex space-x-8">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === 'leads'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                    }`}
                  >
                    Leads Management
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                    }`}
                  >
                    User Management
                  </button>
                </nav>
              </div>
              <div className="flex items-center">
                <Link
                  href="/"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ← Back to Riva
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'leads' ? (
            <LeadsDashboard />
          ) : (
            <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6
                <h3 className="text-lg leading-6 font-medium text-white">
                  User Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-300">
                  Manage user accounts and permissions.
                </p>
              </div>
              <div className="border-t border-gray-700 px-4 py-5 sm:p-0">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-300">
                    User Management Features
                  </dt>
                  <dd className="mt-1 text-sm text-gray-300 sm:mt-0 sm:col-span-2">
                    User management features will be implemented here.
                  </dd>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
              <div className="flex space-x-4">
                <Link 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  ← Back to Riva
                </Link>
                <button
                  onClick={() => fetchSubmissions()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-100 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <label htmlFor="planFilter" className="text-sm font-medium text-gray-300 mr-2">Plan:</label>
              <select id="planFilter" value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                <option value="all">All</option>
                <option value="trial">Free Trial</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="payperlead">Pay-Per-Lead</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <label htmlFor="verifiedFilter" className="text-sm font-medium text-gray-300 ml-4 mr-2">Verified:</label>
              <select id="verifiedFilter" value={verifiedFilter} onChange={e => setVerifiedFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-700 rounded text-white disabled:opacity-50">Prev</button>
              <span className="text-gray-300">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-700 rounded text-white">Next</button>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Plan</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Message</th>
                    <th className="px-4 py-2">Submitted</th>
                    <th className="px-4 py-2">Metadata</th>
                    <th className="px-4 py-2">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-700">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.email}</td>
                      <td className="px-4 py-2">{s.plan}</td>
                      <td className="px-4 py-2">{s.status}</td>
                      <td className="px-4 py-2">{s.phone}</td>
                      <td className="px-4 py-2">{s.message}</td>
                      <td className="px-4 py-2">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2 text-xs whitespace-pre-wrap">
                        {s.metadata ? JSON.stringify(s.metadata, null, 2) : ''}
                      </td>
                      <td className="px-4 py-2">
                        {s.verified ? '✅' : 'No'}
                        {!s.verified && (
                          <div className="flex flex-col gap-1 mt-1">
                            <button 
                              onClick={() => resendVerification(s.id)} 
                              disabled={actionLoading[s.id] === 'resend'}
                              className="text-xs text-blue-400 underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[s.id] === 'resend' ? 'Sending...' : 'Resend Verification'}
                            </button>
                            <button 
                              onClick={() => manualActivate(s.id)}
                              disabled={actionLoading[s.id] === 'activate'}
                              className="text-xs text-green-400 underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[s.id] === 'activate' ? 'Activating...' : 'Manual Activate'}
                            </button>
                            {actionStatus[s.id] && (
                              <div className={`text-xs mt-1 ${actionStatus[s.id].type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {actionStatus[s.id].message}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}