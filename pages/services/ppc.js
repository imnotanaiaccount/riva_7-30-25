import React from 'react';
import Layout from '../../components/Layout';

export default function PPCService() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#181c30] to-[#1a223f] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            className="mb-8 text-blue-400 hover:text-blue-200 text-lg font-semibold flex items-center gap-2"
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
            aria-label="Back"
          >
            <span className="text-2xl">←</span> Back
          </button>
          <h1 className="text-5xl font-extrabold text-white mb-6 text-center">PPC (Pay-Per-Click Advertising)</h1>
          <p className="text-lg text-gray-300 mb-8 text-center">
            Get instant visibility and qualified leads with targeted Google Ads campaigns. We manage your budget for maximum ROI.
          </p>
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">What We Do</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Google Ads campaign setup and management</li>
              <li>Facebook and Instagram advertising</li>
              <li>Local targeting for Grand Rapids area</li>
              <li>Monthly performance optimization</li>
              <li>Conversion tracking and reporting</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <a href="/contact" className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full">Contact Us</a>
          </div>
          <div className="mt-12 text-center text-xs text-gray-500">Demo by Riva</div>
        </div>
      </div>
    </Layout>
  );
} 