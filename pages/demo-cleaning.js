import React from 'react';

export default function DemoCleaning() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-blue-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">CleanPro Solutions</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          <span className="font-bold text-cyan-400">Commercial Cleaning</span> <br />
          Closed $24k contract from first 3 leads. 3 locations, verified business, urgent request.
        </p>
        <div className="bg-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Office, retail, and industrial cleaning</li>
            <li>Eco-friendly, hospital-grade products</li>
            <li>Flexible scheduling, 24/7 support</li>
            <li>Licensed, bonded, and insured</li>
          </ul>
        </div>
        <div className="flex justify-center">
          <a href="/contact" className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full">Contact Us</a>
        </div>
        <div className="mt-12 text-center text-xs text-gray-500">Demo by Riva</div>
      </div>
    </div>
  );
} 