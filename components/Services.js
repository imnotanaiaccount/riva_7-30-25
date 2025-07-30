import React, { useState } from 'react';
import { FiTrendingUp, FiMonitor, FiSearch, FiStar, FiBarChart2, FiUsers, FiMail, FiPieChart, FiMapPin, FiRepeat, FiTarget } from 'react-icons/fi';

const services = [
  {
    id: 'leadgen',
    title: 'Lead Generation',
    icon: <FiTrendingUp className="text-blue-400 text-5xl mb-4" />,
    benefit: 'Get exclusive, pre-qualified leads delivered directly to your business.',
    cta: 'Get Leads',
  },
  {
    id: 'web',
    title: 'Website Design',
    icon: <FiMonitor className="text-purple-400 text-5xl mb-4" />,
    benefit: 'Modern, mobile-first websites that convert visitors into customers.',
    cta: 'See Web Design',
  },
  {
    id: 'seo',
    title: 'SEO (Search Engine Optimization)',
    icon: <FiSearch className="text-green-400 text-5xl mb-4" />,
    benefit: 'Rank higher on Google and get found by local customers.',
    cta: 'Boost My SEO',
  },
  {
    id: 'reputation',
    title: 'Reputation Management',
    icon: <FiStar className="text-yellow-400 text-5xl mb-4" />,
    benefit: 'Automate reviews, monitor feedback, and build a 5-star reputation.',
    cta: 'Manage Reputation',
  },
  {
    id: 'ads',
    title: 'Digital Advertising',
    icon: <FiBarChart2 className="text-pink-400 text-5xl mb-4" />,
    benefit: 'Run high-ROI Google, Facebook, and local ads with expert management.',
    cta: 'Start Advertising',
  },
  {
    id: 'social',
    title: 'Social Media Management',
    icon: <FiUsers className="text-cyan-400 text-5xl mb-4" />,
    benefit: 'Grow your brand and engage customers on all major platforms.',
    cta: 'Grow Social',
  },
  {
    id: 'email',
    title: 'Email & SMS Marketing',
    icon: <FiMail className="text-indigo-400 text-5xl mb-4" />,
    benefit: 'Automated campaigns to nurture leads and drive repeat business.',
    cta: 'Automate Marketing',
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    icon: <FiPieChart className="text-orange-400 text-5xl mb-4" />,
    benefit: 'See exactly what’s working with beautiful, easy-to-read reports.',
    cta: 'View Analytics',
  },
  {
    id: 'listings',
    title: 'Business Listings',
    icon: <FiMapPin className="text-teal-400 text-5xl mb-4" />,
    benefit: 'Get found everywhere with consistent listings across 50+ directories.',
    cta: 'Fix My Listings',
  },
  {
    id: 'crm',
    title: 'CRM & Lead Nurturing',
    icon: <FiRepeat className="text-fuchsia-400 text-5xl mb-4" />,
    benefit: 'Track every lead and automate follow-ups for more sales.',
    cta: 'Try CRM',
  },
  {
    id: 'consulting',
    title: 'Consulting & Strategy',
    icon: <FiTarget className="text-red-400 text-5xl mb-4" />,
    benefit: 'Get expert guidance and a custom plan to grow your business.',
    cta: 'Book Strategy Call',
  },
];

const Services = () => {
  const [selected, setSelected] = useState(null);
  return (
    <section className="py-20 bg-gradient-to-b from-[#181c30] to-[#1a223f]" id="services">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-12 tracking-tight">
          All-in-One Digital Growth Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl bg-white/5 border border-white/10 shadow-xl p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={() => setSelected(service)}
            >
              {service.icon}
              <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-base text-gray-300 mb-6">{service.benefit}</p>
              <button
                className="btn-apple-primary px-6 py-3 text-base font-semibold rounded-full"
                onClick={e => { e.stopPropagation(); setSelected(service); }}
              >
                {service.cta}
              </button>
            </div>
          ))}
        </div>
        {/* Modal for service details */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setSelected(null)}>
            <div className="bg-[#181c30] rounded-3xl shadow-2xl p-8 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold" onClick={() => setSelected(null)}>&times;</button>
              <div className="mb-4 text-center">{selected.icon}</div>
              <h3 className="text-3xl font-bold text-white mb-2 text-center">{selected.title}</h3>
              <p className="text-base text-gray-300 mb-6 text-center">{selected.benefit}</p>
              <div className="flex justify-center">
                <button
                  className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full shadow-md"
                  onClick={() => {
                    setSelected(null);
                    if (typeof window !== 'undefined') {
                      // Map service id to plan id for pre-selection
                      const planMap = {
                        leadgen: 'starter',
                        web: 'webdesign',
                        seo: 'seo',
                        reputation: 'reputation',
                        ads: 'ppc',
                        social: 'social',
                        email: 'email',
                        analytics: 'analytics',
                        listings: 'growth_bundle', // or another appropriate plan
                        crm: 'growth_bundle', // or another appropriate plan
                        consulting: 'brand_bundle', // or another appropriate plan
                      };
                      const planId = planMap[selected.id] || 'starter';
                      localStorage.setItem('selectedPlan', planId);
                      window.dispatchEvent(new CustomEvent('planSelected', { detail: planId }));
                      const el = document.getElementById('signup');
                      if (el) {
                        setTimeout(() => {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }
                  }}
                >
                  Contact Riva
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services; 