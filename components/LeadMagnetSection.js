import { useState } from 'react';
import { validateEmail } from '../utils/validation';

export default function LeadMagnetSection() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleEmailBlur = (e) => {
    const validation = validateEmail(e.target.value);
    if (!validation.isValid) {
      setEmailError(validation.message);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }
    // Save email to localStorage for pre-filling signup
    if (typeof window !== 'undefined') {
      localStorage.setItem('leadMagnetEmail', emailValidation.email);
    }

    setLoading(true);
    setError('');
    setEmailError('');

    try {
      const response = await fetch('/.netlify/functions/lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValidation.email })
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
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black space-bg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass p-12 rounded-2xl max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Thank You!</h3>
              <p className="text-xl text-gray-300 mb-8">
                Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold">2025 Lead Gen Audit</span> is ready for download.
              </p>
            </div>
            
            <button
              onClick={handleDownload}
              className="btn-apple-primary w-full text-lg py-5 mb-6"
            >
              📥 Download Your Free Audit
            </button>
            
            <p className="text-sm text-gray-400 mb-6">
              The download link will expire in 1 hour for security.
            </p>
            
            <button
              onClick={() => {
                setSuccess(false);
                setDownloadUrl('');
                setError('');
                setEmailError('');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Request another download
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black space-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
            Get Your Free <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Lead Gen Audit</span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Unlock the secrets to scaling your business with our exclusive 2025 Lead Generation Audit. 
            Get instant access to proven strategies that drive real results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Left side - Benefits */}
          <div className="space-y-6">
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">
                What You'll Get:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-4 mt-1 text-xl">✓</span>
                  <span className="text-gray-300 text-lg">Comprehensive lead generation analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-4 mt-1 text-xl">✓</span>
                  <span className="text-gray-300 text-lg">Step-by-step implementation roadmap</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-4 mt-1 text-xl">✓</span>
                  <span className="text-gray-300 text-lg">Real case studies and proven tactics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-4 mt-1 text-xl">✓</span>
                  <span className="text-gray-300 text-lg">Actionable strategies for immediate results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-4 mt-1 text-xl">✓</span>
                  <span className="text-gray-300 text-lg">Exclusive insights from industry experts</span>
                </li>
              </ul>
            </div>

            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Why This Works:
              </h3>
              <p className="text-gray-300 leading-relaxed">
                This audit is based on real-world experience and proven methodologies. 
                We've helped hundreds of businesses scale their lead generation and increase their revenue. 
                Now it's your turn to benefit from these strategies.
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            <div className="glass p-8 rounded-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Get Instant Access</h3>
                <p className="text-gray-300">
                  Enter your email to download your free lead generation audit instantly.
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
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`w-full px-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                      emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                  {emailError && (
                    <p className="text-red-400 text-sm mt-1">{emailError}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full btn-apple-primary py-4 text-lg font-semibold"
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
                
                <p className="text-xs text-gray-400 text-center">
                  We respect your privacy. No spam, ever.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="glass p-8 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-8">
              Trusted by Business Owners Worldwide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
                <div className="text-gray-300">Downloads This Month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
                <div className="text-gray-300">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                <div className="text-gray-300">Instant Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 