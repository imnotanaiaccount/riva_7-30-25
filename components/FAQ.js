import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do you validate leads before sending them?",
      answer: "We use a multi-step validation process that includes: 1) Automated verification of business details and contact information, 2) Direct outreach to confirm project intent, 3) Manual review by our team to ensure lead quality, and 4) Verification of budget and timeline. Only leads that pass all validation steps are forwarded to you."
    },
    {
      question: "What information do I get with each lead?",
      answer: "Each lead includes: Complete contact information (name, email, phone), detailed project description, budget range, timeline, business information, and our quality score. For service area businesses, we also provide the exact location and service requirements."
    },
    {
      question: "How quickly will I receive leads?",
      answer: "After signing up, you'll typically receive your first leads within 24-48 hours. We maintain a steady flow of leads based on your subscription plan. During onboarding, we'll discuss your ideal lead profile to ensure the best match for your business."
    },
    {
      question: "What if a lead doesn't convert?",
      answer: "We stand by our lead quality. If you receive a lead that doesn't meet our quality standards (e.g., incorrect contact information, not actually in market), let us know within 7 days and we'll replace it at no extra cost. Our goal is your success."
    },
    {
      question: "Can I pause my subscription?",
      answer: "Yes, you can pause your subscription at any time. Just let us know at least 3 business days before your next billing cycle. You can pause for up to 2 months per year. During the pause, you won't receive new leads but will maintain access to your lead history and dashboard."
    },
    {
      question: "What industries do you serve?",
      answer: "We specialize in B2B and high-ticket service industries including but not limited to: Commercial Cleaning, IT Services, Landscaping, Construction, Marketing Agencies, Business Consulting, and Professional Services. If you're unsure if your industry is a good fit, just ask!"
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-900/30 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need to know about Riva's lead generation service.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10"
            >
              <button
                className={`w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none transition-colors ${activeIndex === index ? 'bg-gray-800/50' : ''}`}
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-content-${index}`}
              >
                <span className="text-lg font-medium text-white">
                  {faq.question}
                </span>
                {activeIndex === index ? (
                  <FiChevronUp className="w-5 h-5 text-blue-400" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div
                id={`faq-content-${index}`}
                className={`px-6 overflow-hidden transition-all duration-300 ${activeIndex === index ? 'max-h-96 pb-6' : 'max-h-0'}`}
                aria-hidden={activeIndex !== index}
              >
                <div className="text-gray-300">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-1 rounded-xl inline-block max-w-2xl">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-white/5">
              <h3 className="text-xl font-semibold text-white mb-3">Still have questions?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Our team is here to help. Contact us and we'll get back to you within 24 hours.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 group"
              >
                Contact Support
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;