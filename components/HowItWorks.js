import React from 'react';
import { FiSearch, FiCheckCircle, FiSend, FiShield, FiClock, FiTrendingUp } from 'react-icons/fi';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FiSearch className="w-6 h-6 text-blue-400" />,
      title: "1. AI-Powered Lead Discovery",
      description: "Our AI scans 50+ data sources including business directories, review sites, and industry platforms to identify businesses actively seeking your services.",
      details: [
        "Real-time monitoring of business activity",
        "Advanced intent signals detection",
        "Competitor analysis and market gaps"
      ]
    },
    {
      icon: <FiCheckCircle className="w-6 h-6 text-green-400" />,
      title: "2. Human Verification",
      description: "Each lead undergoes rigorous verification by our team to ensure accuracy and readiness to buy.",
      details: [
        "Direct contact verification",
        "Project requirements validation",
        "Budget and timeline confirmation"
      ]
    },
    {
      icon: <FiSend className="w-6 h-6 text-purple-400" />,
      title: "3. Priority Delivery",
      description: "Leads are delivered to your dashboard within 24 hours of verification, giving you first-mover advantage.",
      details: [
        "Instant email notifications",
        "Exclusive 48-hour window",
        "Complete lead profile and history"
      ]
    },
    {
      icon: <FiShield className="w-6 h-6 text-yellow-400" />,
      title: "4. Quality Assurance",
      description: "Our 7-day quality guarantee ensures you only pay for qualified, actionable leads.",
      details: [
        "No-question replacement policy",
        "Dedicated account manager",
        "Performance analytics"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-900/30 rounded-full mb-4">
            OUR PROCESS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Our Lead Generation Works
          </h2>
          <p className="text-lg text-gray-400">
            A proven 4-step system that delivers high-intent leads directly to your inbox
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 transition-all duration-300 hover:border-white/10 hover:shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300 mb-3">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start">
                        <FiCheckCircle className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-1 rounded-2xl max-w-4xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-white/5">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <h3 className="text-2xl font-bold text-white mb-3">Ready to Transform Your Lead Generation?</h3>
                <p className="text-gray-300 mb-6">
                  Join 150+ businesses that trust Riva for their lead generation needs. Start seeing qualified leads in your inbox within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 group"
                  >
                    Start Free Trial
                    <FiTrendingUp className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    Talk to Sales
                  </a>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-white/5 max-w-xs">
                  <div className="flex items-center mb-4">
                    <FiClock className="text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-white">Average Response Time</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <span className="text-blue-400">2.4</span> hours
                  </div>
                  <p className="text-xs text-gray-400">
                    Faster than industry average of 24+ hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
