import React from 'react';

export default function LeadGenService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c30] to-[#1a223f] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">Lead Generation</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Get exclusive, pre-qualified leads delivered directly to your business. Our AI-powered and human-verified system ensures you only get the best prospects, ready to close.
        </p>
        <div className="flex justify-center">
          <a href="/contact" className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full">Contact Us</a>
        </div>
      </div>
    </div>
  );
} 