import React from 'react';

export default function DemoRealEstate() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c30] to-[#1a223f] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">Jackson Investment Solutions</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          <span className="font-bold text-blue-400">Real Estate Investor/Wholesaler</span> <br />
          We help motivated sellers and buyers close deals fast. $120k+ in new deals closed in 30 days. Custom site built for conversion.
        </p>
        <div className="bg-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>17 motivated seller leads in 30 days</li>
            <li>AI-powered lead scoring</li>
            <li>Full property details & instant contact</li>
            <li>Fast, secure, and transparent process</li>
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