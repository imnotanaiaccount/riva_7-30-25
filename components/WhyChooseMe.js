import React from 'react';
import Image from 'next/image';

export default function WhyChooseMe() {
  return (
    <section id="why-choose-me" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 space-bg">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/10 shadow-xl flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-center leading-tight">
          Why Choose <span className="font-extrabold">Riva</span>?
        </h2>
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-blue-400/40 shadow-lg mb-4">
            <Image src="/joshHawleyPic.webp" alt="Joshua Hawley" width={160} height={160} className="object-cover w-full h-full" style={{objectPosition: 'center 80%'}} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Joshua Hawley</h3>
          <div className="text-blue-300 font-medium mb-3">Founder & Lead Designer</div>
          <p className="text-base sm:text-lg text-gray-300 text-center max-w-xl mb-4">
            I’m an entreprenur and programmer with 10+ years of experience helping service businesses grow. I combine automation and a hands-on approach to deliver results you can see—and leads you can close.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow glass">10+ Years Experience</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow glass">Conversion-Focused</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow glass">Apple-Inspired Design</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow glass">Personal, Hands-On</span>
          </div>
        </div>
      </div>
    </section>
  );
} 