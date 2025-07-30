import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Riva delivered an entire website & growth strategy for my business within 2 weeks. My business is growing faster than I imagined!",
      author: "Jimmie J.",
      role: "Jackson Investment Solutions",
      rating: 5,
      highlight: true
    }
  ];

  const renderStars = (count) => {
    if (!count || count < 1) return null;
    
    return Array(5).fill(0).map((_, i) => (
      <FiStar 
        key={i} 
        className={`w-5 h-5 ${i < count ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
      />
    ));
  };

  if (!testimonials?.length) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className={`relative p-8 rounded-2xl transition-all duration-300 ${testimonial.highlight ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 shadow-xl' : 'bg-white/5 border border-white/5'}`}
            >
              <div className="absolute top-6 left-6 text-blue-300/20">
                <FaQuoteLeft className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <p className="text-lg text-gray-200 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="flex items-center">
                      {renderStars(testimonial.rating)}
                    </div>
                    <h4 className="text-white font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;