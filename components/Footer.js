import React from 'react';
import { useEffect } from 'react';

const calendlyUrl = 'https://calendly.com/joshhawleyofficial/30min';

const FinalCTA = () => {
  useEffect(() => {
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openCalendly = () => {
    window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFooterPlanClick = (planId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPlan', planId);
      window.dispatchEvent(new CustomEvent('planSelected', { detail: planId }));
      const el = document.getElementById('signup');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const openLiveChat = (e) => {
    e.preventDefault();
    if (window.chatbase) {
      window.chatbase('open');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center mb-12">
      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
        Ready to See Real Results? Start Your 1-Month Trial
      </h3>
      <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto px-4">
        Get up to 5 exclusive, pre-qualified leads in your first month—no credit card, no risk, no obligation. Experience the Riva difference for yourself.
      </p>
      <button
        className="btn-apple-primary inline-flex items-center px-8 py-4 text-white font-bold text-lg rounded-full hover:scale-105"
        onClick={() => handleFooterPlanClick('trial')}
        type="button"
      >
        Start My 1-Month Trial
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <div className="flex flex-wrap gap-4 justify-center items-center mt-6 mb-2">
        <button
          className="btn-apple-paid text-lg px-8 py-4"
          onClick={() => handleFooterPlanClick('starter')}
          type="button"
        >
          Get Started Now
        </button>
        <button
          onClick={openCalendly}
          className="btn-apple-leadmagnet-solid text-lg px-8 py-4"
          type="button"
        >
          Book a Call
        </button>
      </div>
      <span className="block text-xs text-gray-400 mt-3">Limited to new clients. Up to 5 leads in your first month. No credit card required to start.</span>
    </div>
  );
};

const Footer = () => {
  return (
    <>
      <FinalCTA />
      <footer className="py-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Riva. All rights reserved.
      </footer>
    </>
  );
};

export default Footer; 