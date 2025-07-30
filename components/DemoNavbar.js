import React from 'react';
import Link from 'next/link';

const DemoNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-3 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-white font-bold text-xl hover:opacity-80 transition-opacity">
            ← Back to Riva
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/lead-magnet" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-4 py-2 rounded-full text-sm transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default DemoNavbar;
