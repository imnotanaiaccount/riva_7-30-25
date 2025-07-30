import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function LeadMagnet({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [downloadUrl] = useState('/2025-Lead-Gen-Audit.pdf');
  const [attempts, setAttempts] = useState(0);
  
  // Check if user has already downloaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasDownloaded = localStorage.getItem('hasDownloadedLeadMagnet');
      if (hasDownloaded) {
        setSuccess(true);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Honeypot check
    if (honeypot) {
      console.log('Bot detected');
      return;
    }
    
    // Rate limiting
    if (attempts >= 3) {
      setError('Too many attempts. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError('');
    setAttempts(prev => prev + 1);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasDownloadedLeadMagnet', 'true');
        localStorage.setItem('leadMagnetEmail', email);
      }
      
      setSuccess(true);
      if (onSuccess) onSuccess();
      
      // Auto-download after a short delay
      setTimeout(() => {
        window.open(downloadUrl, '_blank');
      }, 500);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  if (success) {
    return (
      <div className="text-center p-6 bg-gray-800 rounded-xl">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Check Your Inbox!</h3>
        <p className="text-gray-300 mb-6">
          Your <span className="font-semibold text-white">2025 Lead Gen Audit</span> is ready to download.
        </p>
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <FiDownload />
          Download Now
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex="-1"
          autoComplete="off"
        />
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <FiDownload />
              Get Free Audit
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-400 text-center">
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </p>
      </form>
    </div>
  );
}