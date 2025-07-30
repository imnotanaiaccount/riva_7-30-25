import { useState } from 'react';

export default function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setDownloadUrl(data.downloadUrl);
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Lead magnet error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  if (success) {
    return (
      <div className="glass p-8 rounded-lg max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
          <p className="text-gray-300 mb-6">
            Your lead magnet is ready for download. Click the button below to get your free resource.
          </p>
        </div>
        
        <button
          onClick={handleDownload}
          className="btn-apple-primary w-full py-3 mb-4"
        >
          📥 Download Lead Magnet
        </button>
        
        <p className="text-sm text-gray-400">
          The download link will expire in 1 hour for security.
        </p>
        
        <button
          onClick={() => {
            setSuccess(false);
            setDownloadUrl('');
            setError('');
          }}
          className="text-blue-400 hover:text-blue-300 text-sm mt-4"
        >
          Request another download
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Get Your Free Lead Magnet</h3>
        <p className="text-gray-300">
          Enter your email to instantly download our exclusive resource and start growing your business.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="lead-email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="lead-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          className="w-full btn-apple-primary py-3"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Get Free Download'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          🔒 Your email is secure. We'll never spam you or share your information.
        </p>
      </div>
    </div>
  );
} 