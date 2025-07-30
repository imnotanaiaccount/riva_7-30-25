import React, { useState, useEffect } from 'react';
import { validateEmail, validatePhone, validateUrl, formatPhoneNumber, formatUrl } from '../utils/validation';

const initialForm = {
  name: '',
  business: '',
  email: '',
  phone: '',
  website: '',
  serviceInterest: '',
  budget: '',
  hearAbout: '',
  leadGoal: '',
  preferredContact: 'email',
  message: '',
  agreeToPrivacy: false
};

const initialErrors = {
  name: '',
  email: '',
  phone: '',
  website: '',
  serviceInterest: '',
  message: '',
  agreeToPrivacy: ''
};

const calendlyUrl = 'https://calendly.com/joshhawleyofficial/30min';

const Contact = () => {
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

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'website':
        return validateUrl(value);
      case 'name':
        return value.trim() ? { isValid: true, message: '' } : { isValid: false, message: 'Name is required' };
      case 'serviceInterest':
        return value ? { isValid: true, message: '' } : { isValid: false, message: 'Please select a service' };
      case 'message':
        return value.trim() ? { isValid: true, message: '' } : { isValid: false, message: 'Please tell us about your needs' };
      case 'agreeToPrivacy':
        return value ? { isValid: true, message: '' } : { isValid: false, message: 'Please agree to the Privacy Policy' };
      default:
        return { isValid: true, message: '' };
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;

    // Apply formatting for specific fields
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    } else if (name === 'website') {
      processedValue = formatUrl(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for email, phone, and website
    if (['email', 'phone', 'website', 'agreeToPrivacy'].includes(name)) {
      const validation = validateField(name, processedValue);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          [name]: validation.message
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value);
    
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        [name]: validation.message
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...initialErrors };
    let isValid = true;

    // Validate required fields
    ['name', 'email', 'serviceInterest', 'message', 'agreeToPrivacy'].forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        newErrors[field] = validation.message;
        isValid = false;
      }
    });

    // Validate optional fields if they have content
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
        isValid = false;
      }
    }

    if (formData.website) {
      const urlValidation = validateUrl(formData.website);
      if (!urlValidation.isValid) {
        newErrors.website = urlValidation.message;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const submissionData = {
      ...formData,
      email: formData.email.trim(),
      website: formData.website ? validateUrl(formData.website).url : '',
      phone: formData.phone ? formData.phone.trim() : ''
    };

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: result.message || 'Thank you for your inquiry! We\'ll be in touch soon.' });
        setFormData(initialForm);
        setErrors(initialErrors);
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Something went wrong. Please try again or contact us directly.' 
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again, or contact us directly.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black space-bg">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
            Contact <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Riva</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed px-4 mb-6">
            Ready to get started or have a question? Reach out below.
          </p>
          <button
            onClick={openCalendly}
            className="btn-apple-leadmagnet-solid text-lg px-8 py-4 mb-4"
            type="button"
          >
            Book a Call Instantly
          </button>
        </div>
        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (required) */}
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full peer min-h-[48px] ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Your Name *"
                aria-label="Your Name"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            {/* Email (required) */}
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full peer min-h-[48px] ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Email Address *"
                aria-label="Email Address"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            {/* Service Interest (required) */}
            <div className="relative">
              <select
                id="serviceInterest"
                name="serviceInterest"
                value={formData.serviceInterest}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full peer min-h-[48px] text-gray-400 ${errors.serviceInterest ? 'border-red-500 focus:border-red-500' : ''}`}
                aria-label="Service Interest"
              >
                <option value="" disabled>What service are you interested in? *</option>
                <option value="lead_generation">Lead Generation</option>
                <option value="seo">SEO Services</option>
                <option value="ppc">Pay-Per-Click (PPC) Management</option>
                <option value="social_media">Social Media Management</option>
                <option value="content_marketing">Content Marketing</option>
                <option value="email_marketing">Email Marketing</option>
                <option value="reputation_management">Reputation Management</option>
                <option value="analytics">Analytics & Reporting</option>
                <option value="web_design">Web Design & Development</option>
                <option value="bundle">Marketing Bundle</option>
                <option value="other">Other (please specify in message)</option>
              </select>
              {errors.serviceInterest && (
                <p className="text-red-400 text-sm mt-1">{errors.serviceInterest}</p>
              )}
            </div>
            {/* Message (required) */}
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                rows={4}
                className={`w-full peer min-h-[48px] ${errors.message ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Tell us about your needs *"
                aria-label="Project Details"
              />
              {errors.message && (
                <p className="text-red-400 text-sm mt-1">{errors.message}</p>
              )}
            </div>
            {/* Budget Field */}
            <div className="relative">
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full min-h-[48px] bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Monthly Marketing Budget"
              >
                <option value="">What's your monthly marketing budget? (optional)</option>
                <option value="<$500">Less than $500</option>
                <option value="$500-$1,000">$500 - $1,000</option>
                <option value="$1,000-$2,500">$1,000 - $2,500</option>
                <option value="$2,500-$5,000">$2,500 - $5,000</option>
                <option value="$5,000+">$5,000+</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </div>
            {/* Lead Goal */}
            <div className="relative">
              <select
                id="leadGoal"
                name="leadGoal"
                value={formData.leadGoal}
                onChange={handleChange}
                className="w-full peer min-h-[48px] text-gray-400"
                aria-label="Monthly Lead Goal"
              >
                <option value="">How many leads do you need monthly? (optional)</option>
                <option value="1-5">1-5 Leads (Pay-Per-Lead)</option>
                <option value="5-15">5-15 Leads (Starter Plan - $99/mo)</option>
                <option value="15-35">15-35 Leads (Pro Plan - $179/mo)</option>
                <option value="35-50">35-50 Leads (Enterprise)</option>
                <option value="50+">50+ Leads (Custom Quote)</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </div>
            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                id="business"
                name="business"
                value={formData.business}
                onChange={handleChange}
                className="w-full peer min-h-[44px]"
                placeholder="Business Name (optional)"
                aria-label="Business Name"
              />
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full peer min-h-[44px] ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Phone (optional)"
                  aria-label="Phone"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full peer min-h-[44px] ${errors.website ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Website (optional) - e.g., riva.com"
                  aria-label="Website"
                />
                {errors.website && (
                  <p className="text-red-400 text-sm mt-1">{errors.website}</p>
                )}
              </div>
              <input
                type="text"
                id="idealClient"
                name="idealClient"
                value={formData.idealClient}
                onChange={handleChange}
                className="w-full peer min-h-[44px]"
                placeholder="Describe Your Ideal Client (optional)"
                aria-label="Ideal Client"
              />
              <select
                id="hearAbout"
                name="hearAbout"
                value={formData.hearAbout}
                onChange={handleChange}
                className="w-full peer min-h-[44px] text-gray-400"
                aria-label="How did you hear about us?"
              >
                <option value="" disabled>How did you hear about us? (optional)</option>
                <option value="Referral">Referral</option>
                <option value="Google Search">Google Search</option>
                <option value="Social Media">Social Media</option>
                <option value="Ad">Ad</option>
                <option value="Other">Other</option>
              </select>
              <div className="relative">
                <p className="text-sm text-gray-400 mb-2">Preferred Contact Method *</p>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={handleChange}
                      className="form-radio text-blue-500"
                    />
                    <span className="ml-2 text-white">Email</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={handleChange}
                      className="form-radio text-blue-500"
                    />
                    <span className="ml-2 text-white">Phone</span>
                  </label>
                </div>
              </div>
            </div>
            {/* Privacy Policy Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToPrivacy"
                  name="agreeToPrivacy"
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToPrivacy" className="font-medium text-gray-300">
                  I agree to the <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a> and <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a> *
                </label>
                {errors.agreeToPrivacy && (
                  <p className="text-red-400 text-sm mt-1">{errors.agreeToPrivacy}</p>
                )}
              </div>
            </div>
            {/* Trust Messaging */}
            <div className="text-center text-xs text-gray-400 mt-2 mb-4">
              We never share your info. Response within 1 business hour.
            </div>
            {/* CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors duration-200 ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {/* Satisfaction Guarantee Badge */}
            <div className="flex items-center justify-center mt-4 mb-2">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 font-semibold text-sm shadow-sm">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                100% Satisfaction Guarantee
              </span>
            </div>
            {/* Status Message */}
            {submitStatus && (
              <div className={`p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                {submitStatus.message}
              </div>
            )}
          </form>
        </div>
        {/* Contact Info */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="glass p-6 rounded-2xl">
              <div className="text-2xl font-bold text-white mb-2">24 Hours</div>
              <div className="text-gray-300 text-sm">Response Time</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-2xl font-bold text-white mb-2">Free Quote</div>
              <div className="text-gray-300 text-sm">No Obligation</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-2xl font-bold text-white mb-2">100% Secure</div>
              <div className="text-gray-300 text-sm">Data Protected</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
// Add to styles/globals.css:
// .floating-label { position: absolute; left: 20px; top: 20px; color: #aaa; pointer-events: none; transition: 0.2s; font-size: 16px; }
// .peer:focus ~ .floating-label, .peer:not(:placeholder-shown) ~ .floating-label { top: 2px; left: 16px; font-size: 13px; color: #7dd3fc; } 