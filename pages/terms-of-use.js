import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function TermsOfUse() {
  return (
    <Layout>
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <div className="mb-6 sm:mb-8">
              <Link href="/" className="inline-flex items-center text-blue-400 hover:text-white transition-colors duration-200 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Terms of Use</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg prose-invert max-w-none"
          >
            <div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 space-y-8">
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using the Riva website and services ("Services"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  These Terms of Use ("Terms") govern your use of our website and services provided by Riva ("we," "our," or "us"). By using our Services, you agree to these Terms in full.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">2. Description of Services</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Riva provides web development, mobile app development, UI/UX design, digital marketing, cloud solutions, and technology consulting services. Our Services include:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Custom website and web application development</li>
                  <li>Mobile application development for iOS and Android</li>
                  <li>User interface and user experience design</li>
                  <li>Digital marketing and SEO services</li>
                  <li>Cloud infrastructure and DevOps solutions</li>
                  <li>Technology consulting and strategy</li>
                  <li>Project management and support services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">3. User Responsibilities</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When using our Services, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use our Services only for lawful purposes</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not interfere with or disrupt our Services</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">4. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold text-blue-400 mb-3">4.1 Our Intellectual Property</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, are owned by Riva or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">4.2 Your Intellectual Property</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You retain ownership of any intellectual property you provide to us. By providing content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute such content solely for the purpose of providing our Services to you.
                </p>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">4.3 Project Deliverables</h3>
                <p className="text-gray-300 leading-relaxed">
                  Upon full payment, you will own the final deliverables created specifically for your project. We retain the right to use project work for portfolio and marketing purposes, unless otherwise agreed in writing.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">5. Payment Terms</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Payment terms for our Services are as follows:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Payment schedules will be outlined in individual project agreements</li>
                  <li>All payments are due within the specified timeframe</li>
                  <li>Late payments may result in project delays or suspension</li>
                  <li>All fees are non-refundable unless otherwise specified</li>
                  <li>Additional work outside the original scope may incur additional charges</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">6. Project Terms and Conditions</h2>
                
                <h3 className="text-xl font-semibold text-blue-400 mb-3">6.1 Project Scope</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Project scope, deliverables, timelines, and pricing will be defined in individual project agreements. Any changes to the scope must be agreed upon in writing and may affect project timeline and pricing.
                </p>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">6.2 Client Responsibilities</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Clients are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Providing timely feedback and approvals</li>
                  <li>Supplying necessary content and materials</li>
                  <li>Making decisions within agreed timeframes</li>
                  <li>Providing access to required systems and accounts</li>
                  <li>Ensuring compliance with applicable laws and regulations</li>
                </ul>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">6.3 Project Delays</h3>
                <p className="text-gray-300 leading-relaxed">
                  Project delays caused by client inaction or changes may result in additional charges or timeline adjustments. We will communicate any potential delays promptly.
                </p>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">6.4 Force Majeure</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Riva shall not be liable for any failure or delay in performing its obligations under these Terms if such failure or delay is due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor disputes, government actions, pandemics, or interruptions in internet or hosting services. In such cases, timelines may be extended or projects may be canceled with a pro-rated refund for any undelivered work at Riva's discretion.
                </p>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">7. Refunds and Cancellations</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Refunds or credits may be issued at Riva's sole discretion if we are unable to deliver the agreed-upon services or if a project is canceled before completion. For subscription services, you may cancel at any time, and your subscription will remain active until the end of the current billing period. No refunds will be issued for unused portions of a subscription period unless otherwise specified in a separate written agreement. For one-time or project-based services, refunds will be pro-rated based on the amount of work completed and delivered at the time of cancellation.
                </p>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">8. Services Covered</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These Terms apply to all services offered by Riva, including but not limited to: lead generation, SEO, PPC (Google Ads), social media management, content marketing, email marketing, reputation management, analytics & reporting, web design & development, and all add-ons, bundles, and future digital marketing services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  To the maximum extent permitted by law, Riva shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Third-party actions or content</li>
                  <li>Security breaches or data loss</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">8. Warranty and Support</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We warrant that our Services will be performed in a professional manner consistent with industry standards. However, we do not guarantee:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Uninterrupted or error-free service</li>
                  <li>Compatibility with all third-party systems</li>
                  <li>Specific business outcomes or results</li>
                  <li>Performance beyond what is reasonable for the service provided</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Support and maintenance terms will be specified in individual project agreements.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">9. Confidentiality</h2>
                <p className="text-gray-300 leading-relaxed">
                  We respect the confidentiality of your business information and will not disclose confidential information to third parties without your consent, except as required by law or as necessary to provide our Services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">10. Termination</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Either party may terminate these Terms or any project agreement with written notice. Upon termination:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>You will pay for all work completed up to the termination date</li>
                  <li>We will deliver any completed work</li>
                  <li>Each party will return or destroy confidential information</li>
                  <li>Surviving provisions of these Terms will remain in effect</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">11. Governing Law and Dispute Resolution</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes arising from these Terms or our Services shall be resolved through:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Good faith negotiations between the parties</li>
                  <li>Mediation, if negotiations fail</li>
                  <li>Arbitration or court proceedings as a last resort</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">12. Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on our website and updating the "Last updated" date. Your continued use of our Services after such changes constitutes acceptance of the new Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">13. Severability</h2>
                <p className="text-gray-300 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">14. Contact Information</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about these Terms of Use, please contact us:
                </p>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Email:</strong> legal@riva.com<br />
                    <strong>Address:</strong> [Your Business Address]<br />
                    <strong>Phone:</strong> [Your Phone Number]
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Lead Volume Disclaimer</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Lead Volume Disclaimer:</strong> All references to lead quantities (e.g., "up to 15 leads per month") are estimates. Actual lead volume may vary based on market demand, client criteria, and other factors. Riva will make best efforts to deliver as many qualified leads as possible, but does not guarantee a minimum number of leads for any plan. No refunds or credits will be issued solely for lower-than-expected lead volume unless otherwise stated in a separate written agreement.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
} 