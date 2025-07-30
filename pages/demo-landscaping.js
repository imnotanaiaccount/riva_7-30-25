import React from 'react';

export default function DemoLandscaping() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-blue-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">Greenscape Pros</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          <span className="font-bold text-green-400">Landscaping</span> <br />
          Booked 6 new clients in 2 weeks. $3,500 avg. project value. Ready to hire, verified address.
        </p>
        <div className="bg-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Services</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Full-service landscaping & design</li>
            <li>Weekly lawn care & maintenance</li>
            <li>Hardscaping, patios, and walkways</li>
            <li>Eco-friendly solutions</li>
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