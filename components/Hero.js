import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const Hero = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleHeroPlanClick = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const planId = 'trial';
      localStorage.setItem('selectedPlan', planId);
      window.dispatchEvent(new CustomEvent('planSelected', { detail: planId }));
      
      const el = document.getElementById('signup');
      
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, null, '#signup');
      } else {
        if (window.location.pathname !== '/') {
          window.location.href = '/#signup';
        } else {
          setTimeout(() => {
            const retryEl = document.getElementById('signup');
            if (retryEl) {
              retryEl.scrollIntoView({ behavior: 'smooth' });
              window.history.pushState(null, null, '#signup');
            }
          }, 300);
        }
      }
    }
  };

  const handleSeeHowItWorks = (e) => {
    e.preventDefault();
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-8 md:pt-12 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Generate <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">High-Quality Leads</span> 
            <br className="hidden md:block" />
            That Actually Convert
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get exclusive, pre-qualified leads delivered directly to your inbox. No more cold calling or wasted ad spend.
          </p>

          {/* Trial CTA */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-1 rounded-xl mb-8 max-w-2xl mx-auto">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-2">Start Your Free Trial</h3>
              <p className="text-gray-300 text-sm mb-4">
                Limited to new clients. Up to 5 leads in your first month. No credit card required to start.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#signup"
                  onClick={handleHeroPlanClick}
                  className="group relative flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </a>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-gray-900"></div>
                ))}
              </div>
              <span>Trusted by 150+ businesses</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-700"></div>
            <div className="flex items-center">
              <FiCheckCircle className="text-green-400 mr-2" />
              <span>40% average increase in qualified opportunities</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      </div>
    </section>
  );
};

export default Hero;