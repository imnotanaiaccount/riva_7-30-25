import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Privacy Policy</span>
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
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="text-gray-300 leading-relaxed">
                  Riva ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us in any way.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-blue-400 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may collect personal information that you voluntarily provide to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Company name and job title</li>
                  <li>Project requirements and specifications</li>
                  <li>Communication preferences</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">2.2 Automatically Collected Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When you visit our website, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website</li>
                  <li>Device information</li>
                </ul>

                <h3 className="text-xl font-semibold text-blue-400 mb-3 mt-6">2.3 Cookies and Tracking Technologies</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, analyze website usage, and provide personalized content. You can control cookie settings through your browser preferences.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use the collected information for various purposes:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Providing and maintaining our services</li>
                  <li>Communicating with you about projects and services</li>
                  <li>Processing payments and transactions</li>
                  <li>Improving our website and services</li>
                  <li>Analyzing usage patterns and trends</li>
                  <li>Marketing and promotional purposes (with your consent)</li>
                  <li>Legal compliance and dispute resolution</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our business</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">5. Data Security</h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">7. Data Retention</h2>
                <p className="text-gray-300 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">8. International Data Transfers</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">9. Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed">
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">11. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Email:</strong> privacy@riva.com<br />
                    <strong>Address:</strong> [Your Business Address]<br />
                    <strong>Phone:</strong> [Your Phone Number]
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
} 