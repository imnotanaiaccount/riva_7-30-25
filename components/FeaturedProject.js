import { motion } from 'framer-motion';
import React, { useState } from 'react';

export default function FeaturedProject() {
  return (
    <section className="py-32 bg-riva-bg dark:bg-dark-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-10 right-10 w-64 h-64 bg-riva/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-10 left-10 w-48 h-48 bg-riva-light/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-full mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="card p-16 perspective-3d"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-extrabold text-riva-blue mb-6 font-sans">
                    Featured Project
                  </h2>
                  <p className="text-xl text-riva-blue max-w-3xl mx-auto leading-relaxed">
                    See how Riva transforms businesses with <span className="font-bold text-riva-blue">strategic design</span> and <span className="font-bold text-riva-blue">proven results</span>
                  </p>
                  <div className="w-20 h-1 bg-riva-blue rounded-full"></div>
                </motion.div>

                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-riva-dark dark:text-dark-text"
                >
                  Jackson Investment Solutions
                </motion.h3>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-xl text-riva-light dark:text-dark-muted leading-relaxed"
                >
                  A modern, conversion-focused real estate platform built for maximum trust and lead generation. 
                  Designed and developed with seamless user experience, mobile-first performance, and business growth in mind.
                </motion.p>
              </div>

              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-wrap gap-3">
                  {['React.js', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'].map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-riva/10 dark:bg-riva-darkest/60 text-riva dark:text-white rounded-full text-sm font-semibold hover:bg-riva-lighter/40 dark:hover:bg-riva-dark hover:text-white transition-all duration-300"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.a 
                    href="https://jacksoninvestmentsolutions2.netlify.app/" 
                    target="_blank" 
                    rel="noopener"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-apple-primary inline-block px-7 py-3 text-white font-semibold text-base rounded-xl"
                  >
                    View Project
                  </motion.a>
                  <motion.a 
                    href="#contact" 
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-apple-secondary px-8 py-4 rounded-xl text-white font-semibold text-center"
                  >
                    Similar Project
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-dark-card border border-riva/10 dark:border-dark-border">
                <div className="bg-gradient-to-r from-riva/10 to-riva-light/10 dark:from-riva/20 dark:to-riva-light/20 px-6 py-4 border-b border-riva/10 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-riva-light dark:text-dark-muted font-medium ml-4">
                      jacksoninvestmentsolutions.com
                    </span>
                  </div>
                </div>
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-riva/10 dark:border-dark-border bg-white dark:bg-dark-card relative flex flex-col items-center justify-center">
                  <img src="/jackson-preview.png" alt="Preview Screenshot" className="w-full h-full object-cover rounded-3xl" />
                  <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center">
                    <a href="https://jacksoninvestmentsolutions2.netlify.app/" target="_blank" rel="noopener" className="btn-apple-primary px-6 py-3 text-white rounded-xl font-bold">Open Site</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 