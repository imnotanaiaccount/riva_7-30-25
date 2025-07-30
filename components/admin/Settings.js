import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/outline';

export default function Settings() {
  const [settings, setSettings] = useState({
    allowNewSignups: true,
    requireEmailVerification: true,
    defaultUserRole: 'user',
    maxLeadsPerUser: 100,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1) // Assuming we have a single settings row with ID 1
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings(prev => ({
            ...prev,
            ...data.config // Assuming settings are stored in a JSONB column called 'config'
          }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Using default values.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Only allow positive numbers
    if (value === '' || /^\d+$/.test(value)) {
      setSettings(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseInt(value, 10)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('settings')
        .upsert(
          { 
            id: 1, 
            config: settings,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

      if (error) throw error;
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your application settings and preferences.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how users interact with your application.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="allowNewSignups"
                      name="allowNewSignups"
                      type="checkbox"
                      checked={settings.allowNewSignups}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="allowNewSignups" className="font-medium text-gray-700">
                      Allow new user signups
                    </label>
                    <p className="text-gray-500">
                      When disabled, only administrators can create new user accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireEmailVerification"
                      name="requireEmailVerification"
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireEmailVerification" className="font-medium text-gray-700">
                      Require email verification
                    </label>
                    <p className="text-gray-500">
                      Users must verify their email address before they can sign in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="defaultUserRole" className="block text-sm font-medium text-gray-700">
                  Default user role
                </label>
                <select
                  id="defaultUserRole"
                  name="defaultUserRole"
                  value={settings.defaultUserRole}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  The default role assigned to new users.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Lead Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how leads are managed in the system.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="maxLeadsPerUser" className="block text-sm font-medium text-gray-700">
                  Maximum leads per user
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="maxLeadsPerUser"
                    id="maxLeadsPerUser"
                    value={settings.maxLeadsPerUser}
                    onChange={handleNumberChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="100"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Set to 0 for unlimited leads per user.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>

      <div className="pt-8 border-t border-gray-200">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Advanced Settings</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  For additional configuration options, please contact your system administrator or 
                  refer to the application documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
