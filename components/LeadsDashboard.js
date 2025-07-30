import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    dateRange: '7days',
    search: ''
  });
  const [view, setView] = useState('leads'); // 'leads' or 'distribution'

  // Fetch leads and clients
  useEffect(() => {
    fetchLeads();
    fetchClients();
  }, [filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          distributions:lead_distribution(
            id,
            status,
            client:clients(id, name, email)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.dateRange !== 'all') {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(filters.dateRange));
        query = query.gte('created_at', date.toISOString());
      }
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleLeadSelect = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (selectedLeads.size === 0) return;
    
    try {
      setLoading(true);
      const leadIds = Array.from(selectedLeads);
      
      switch (action) {
        case 'delete':
          await supabase
            .from('leads')
            .delete()
            .in('id', leadIds);
          break;
          
        case 'status:contacted':
          await supabase
            .from('leads')
            .update({ status: 'contacted' })
            .in('id', leadIds);
          break;
          
        case 'distribute:all':
          // Distribute selected leads to all clients
          const distributions = [];
          clients.forEach(client => {
            leadIds.forEach(leadId => {
              distributions.push({
                lead_id: leadId,
                client_id: client.id,
                status: 'pending'
              });
            });
          });
          await supabase
            .from('lead_distribution')
            .upsert(distributions, { onConflict: 'lead_id,client_id' });
          break;
      }
      
      // Refresh data
      await fetchLeads();
      setSelectedLeads(new Set());
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Leads Management</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setView('leads')}
              className={`px-4 py-2 rounded-md ${
                view === 'leads' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              All Leads
            </button>
            <button
              onClick={() => setView('distribution')}
              className={`px-4 py-2 rounded-md ${
                view === 'distribution' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Distribution
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full bg-gray-700 rounded p-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              className="w-full bg-gray-700 rounded p-2 text-sm"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Email or phone"
              className="w-full bg-gray-700 rounded p-2 text-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                status: 'all',
                client: 'all',
                dateRange: '7',
                search: ''
              })}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="text-blue-300">
              {selectedLeads.size} {selectedLeads.size === 1 ? 'lead' : 'leads'} selected
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('status:contacted')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
              >
                Mark as Contacted
              </button>
              <button
                onClick={() => handleBulkAction('distribute:all')}
                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
              >
                Distribute to All Clients
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded bg-gray-600 border-gray-500 text-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(new Set(leads.map(lead => lead.id)));
                        } else {
                          setSelectedLeads(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                      No leads found matching your criteria
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded bg-gray-600 border-gray-500 text-blue-500"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => handleLeadSelect(lead.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-sm text-gray-400">{lead.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{lead.email}</div>
                        <div className="text-sm text-gray-400">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">View</button>
                        <button className="text-green-400 hover:text-green-300">Distribute</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
