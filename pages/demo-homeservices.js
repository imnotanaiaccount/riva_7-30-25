import React from 'react';

export default function DemoHomeServices() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-6 text-center">HomeFix Masters</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          <span className="font-bold text-purple-400">Home Services</span> <br />
          Secured 2 new jobs in 10 days. $2,000 est. project, ready-to-hire, verified address.
        </p>
        <div className="bg-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Services</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Handyman & repairs</li>
            <li>Painting & drywall</li>
            <li>Plumbing & electrical</li>
            <li>Remodeling & upgrades</li>
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