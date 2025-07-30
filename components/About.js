import React from 'react';
import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="relative py-24 overflow-hidden space-bg">
      <div className="container-premium relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
              <span className="text-sm font-medium text-blue-200 font-bold tracking-wide uppercase">Meet the Founder</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Why Riva?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed px-4">
              I’m Joshua Hawley, founder of Riva. I help service businesses grow with premium, pre-qualified leads and Apple-level design. Here’s why you can trust me with your digital growth:
            </p>
          </div>
          {/* Founder Profile Card */}
          <div className="glass p-8 rounded-3xl text-center animate-fade-in max-w-xl mx-auto">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-400/40 shadow-lg">
              <Image src="/joshHawleyPic.webp" alt="Joshua Hawley" width={160} height={160} className="object-cover w-full h-full" style={{objectPosition: 'center 80%'}} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Joshua Hawley</h3>
            <p className="text-blue-400 font-medium mb-4">Founder & Lead Designer</p>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">10+ years helping service businesses scale with high-quality leads. Conversion-obsessed, hands-on, and passionate about design and automation.</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">Lead Gen</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">AI Validation</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">Sales Funnels</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">Client Success</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">Apple-Inspired Design</span>
            </div>
            <div className="text-xs text-blue-200 bg-blue-900/40 rounded-lg px-4 py-2 mt-2 animate-fade-in">
              <span className="font-semibold">Fun Fact:</span>I love the Detroit Lions, and I'm a big fan of every Adam Sandler movie!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 