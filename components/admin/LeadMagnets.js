import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { format } from 'date-fns';
import { FaDownload, FaTrash, FaEdit, FaPlus, FaSearch } from 'react-icons/fa';

export default function LeadMagnets({ leadMagnets, onLeadMagnetUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDownloads: 0,
    last30Days: 0,
    conversionRate: 0,
  });

  // Calculate stats when component mounts or leadMagnets change
  useEffect(() => {
    if (leadMagnets.length > 0) {
      const totalDownloads = leadMagnets.reduce((sum, lm) => sum + (lm.download_count || 0), 0);
      const last30Days = leadMagnets.reduce((sum, lm) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDownloads = lm.downloads?.filter(d => new Date(d.downloaded_at) > thirtyDaysAgo).length || 0;
        return sum + recentDownloads;
      }, 0);
      
      // Simple conversion rate calculation (adjust based on your metrics)
      const conversionRate = leadMagnets.length > 0 
        ? Math.round((totalDownloads / leadMagnets[0].total_visits || 1) * 100) 
        : 0;

      setStats({
        totalDownloads,
        last30Days,
        conversionRate,
      });
    }
  }, [leadMagnets]);

  const filteredLeadMagnets = leadMagnets.filter(lm => 
    lm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lm.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead magnet? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('lead_magnets')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Update parent component
        onLeadMagnetUpdate(leadMagnets.filter(lm => lm.id !== id));
      } catch (error) {
        console.error('Error deleting lead magnet:', error);
        alert('Failed to delete lead magnet');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Lead Magnets</h2>
          <p className="text-gray-600">Manage your lead magnets and track their performance</p>
        </div>
        <button
          onClick={() => window.alert('Add new lead magnet functionality coming soon')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2" />
          Add New Lead Magnet
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Downloads</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalDownloads}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Last 30 Days</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.last30Days}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.conversionRate}%</dd>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Search lead magnets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lead Magnets Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeadMagnets.length > 0 ? (
                    filteredLeadMagnets.map((leadMagnet) => (
                      <tr key={leadMagnet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{leadMagnet.title}</div>
                          <div className="text-sm text-gray-500">{leadMagnet.description?.substring(0, 60)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {leadMagnet.type || 'PDF'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {leadMagnet.download_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(leadMagnet.updated_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => window.open(leadMagnet.file_url, '_blank')}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Download"
                          >
                            <FaDownload className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => window.alert('Edit functionality coming soon')}
                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                            title="Edit"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(leadMagnet.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isLoading}
                            title="Delete"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No matching lead magnets found' : 'No lead magnets available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
