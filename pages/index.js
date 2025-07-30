import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import LeadExamples from '../components/Examples';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import About from '../components/About';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import LeadMagnetSection from '../components/LeadMagnetSection';
import SignupForm from '../components/SignupForm';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <HowItWorks />
      
      {/* First lead magnet section */}
      <LeadMagnetSection position="inline" />
      
      <Services />
      <LeadExamples />
      <Testimonials />
      
      {/* Second lead magnet section */}
      <div className="py-16 bg-gradient-to-br from-gray-900 to-black">
        <LeadMagnetSection position="inline" />
      </div>
      
      <Pricing />
      <About />
      <FAQ />
      
      {/* Final CTA section */}
      <section id="signup" className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white text-center mb-8">
            Ready to Get Started?
          </h2>
          <div className="max-w-md mx-auto">
            <LeadMagnetSection position="inline" />
          </div>
        </div>
      </section>
      
      <Contact />
      
      {/* Floating lead magnet button */}
      <LeadMagnetSection position="floating" />
      
      <Footer />
    </Layout>
  );
}