import React from 'react';

export default function ListingsService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c30] to-[#1a223f] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">Business Listings</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Get found everywhere with consistent listings across 50+ directories. We fix, update, and monitor your business info for maximum visibility.
        </p>
        <div className="flex justify-center">
          <a href="/contact" className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full">Contact Us</a>
        </div>
      </div>
    </div>
  );
} 