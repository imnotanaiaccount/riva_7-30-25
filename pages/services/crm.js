import React from 'react';

export default function CRMService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c30] to-[#1a223f] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">CRM & Lead Nurturing</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Track every lead and automate follow-ups for more sales. Our simple CRM helps you close more deals with less effort.
        </p>
        <div className="flex justify-center">
          <a href="/contact" className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full">Contact Us</a>
        </div>
      </div>
    </div>
  );
} 