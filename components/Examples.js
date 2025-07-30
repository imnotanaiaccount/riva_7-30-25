import React from 'react';
import { FiExternalLink, FiDollarSign, FiMapPin, FiClock, FiCheckCircle, FiUser } from 'react-icons/fi';

const LeadCard = ({ lead }) => (
  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-xl">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{lead.businessType}</h3>
          <p className="text-gray-400 text-sm">{lead.description}</p>
        </div>
        <div className="flex items-center">
          <div className="bg-green-900/30 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-800/50">
            {lead.leadScore}/100
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center text-gray-300">
          <FiDollarSign className="mr-2 text-blue-400" />
          <span className="text-sm">{lead.projectValue}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <FiMapPin className="mr-2 text-blue-400" />
          <span className="text-sm">{lead.location}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <FiClock className="mr-2 text-blue-400" />
          <span className="text-sm">{lead.timeline}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <FiUser className="mr-2 text-blue-400" />
          <span className="text-sm">{lead.decisionMaker}</span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Lead Details</span>
          <a 
            href={lead.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
          >
            View Website
            <FiExternalLink className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

const LeadExamples = () => {
  const leads = [
    {
      id: 1,
      businessType: 'Jackson Investment Solutions',
      description: 'Real estate investor looking to create a website & establish an online presense to grow their business',
      projectValue: '$30,000 - $200,000',
      location: 'Grand Rapids, MI',
      leadScore: 95,
      timeline: '2-3 weeks',
      decisionMaker: 'Jimmie J., Owner',
      website: 'https://jacksoninvestmentsolutions2.netlify.app/',
    },
  ];

  return (
    <section id="lead-examples" className="py-16 md:py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-900/30 rounded-full mb-4">
            CLIENT SHOWCASE
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real Client Success Story
          </h2>
          <p className="text-lg text-gray-400">
            See how we helped Jackson Investment Solutions transform their online presence.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <LeadCard lead={leads[0]} />
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-gray-800/50 border border-white/10 rounded-full px-6 py-3">
            <FiCheckCircle className="text-green-400 mr-2" />
            <span className="text-gray-300 text-sm font-medium">
              Project completed successfully in May 2024
            </span>
          </div>
          
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            <span className="text-white font-medium">Note:</span> This is a real client project with permission to showcase.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LeadExamples;