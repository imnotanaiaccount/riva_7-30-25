import React, { useState, useEffect } from 'react';
import LeadMagnet from './LeadMagnet';

export default function LeadMagnetSection({ position = 'inline' }) {
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Show floating button after user scrolls
  useEffect(() => {
    if (position !== 'floating') return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [position]);
  
  // Floating version
  if (position === 'floating') {
    return (
      <>
        {!showLeadMagnet && isScrolled && (
          <button
            onClick={() => setShowLeadMagnet(true)}
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Get Free Audit
          </button>
        )}
        
        {showLeadMagnet && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
              <button
                onClick={() => setShowLeadMagnet(false)}
                className="absolute -top-12 right-0 text-gray-300 hover:text-white"
                aria-label="Close"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <LeadMagnet onSuccess={() => setShowLeadMagnet(false)} />
            </div>
          </div>
        )}
      </>
    );
  }
  
  // Inline version
  return (
    <div className="my-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white text-center mb-8">
          Get Your Free 2025 Lead Generation Audit
        </h2>
        <p className="text-xl text-gray-300 text-center mb-8 max-w-3xl mx-auto">
          Download our exclusive guide to discover the 7 critical lead generation strategies that will transform your business in 2025.
        </p>
        <div className="max-w-md mx-auto">
          <LeadMagnet />
        </div>
      </div>
    </div>
  );
}