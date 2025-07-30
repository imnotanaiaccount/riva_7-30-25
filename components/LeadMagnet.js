import { useState, useEffect } from 'react';
import { FiDownload, FiCheck, FiAlertCircle, FiMail } from 'react-icons/fi';

export default function LeadMagnet({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Check if user has already downloaded
    const hasDownloaded = localStorage.getItem('hasDownloadedLeadMagnet');
    if (hasDownloaded) {
      setSuccess(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Honeypot check (should be empty for real users)
    if (honeypot) {
      console.log('Bot detected via honeypot');
      setSuccess(true); // Fake success for bots
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/submit-lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, honeypot }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }
      
      // Mark as downloaded in localStorage
      if (isClient) {
        localStorage.setItem('hasDownloadedLeadMagnet', 'true');
      }
      
      setSuccess(true);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <FiCheck className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-green-800 mb-2">Check Your Email!</h3>
        <p className="text-green-700 mb-4">
          We've sent the <strong>2025 Lead Gen Audit</strong> to {email}.
          Please check your inbox (and spam folder) for the download link.
        </p>
        <p className="text-sm text-green-600">
          Can't find it? <button 
            onClick={handleSubmit} 
            className="text-green-700 underline hover:text-green-800"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Resend'}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-3">
          <FiDownload className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Get Your Free Audit</h3>
        <p className="text-sm text-gray-500">
          Enter your email to receive the 2025 Lead Gen Audit PDF
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="sr-only">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 border"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 border"
            />
          </div>
        </div>
        
        {/* Honeypot field - hidden from users but visible to bots */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label htmlFor="website">Leave this field empty</label>
          <input 
            type="text" 
            id="website" 
            name="website" 
            tabIndex="-1"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FiDownload className="mr-2 h-5 w-5" />
                Get My Free Audit
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}