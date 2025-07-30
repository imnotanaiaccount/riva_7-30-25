import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { validateEmail, validatePhone, validateUrl, formatPhoneNumber, formatUrl } from '../utils/validation';
import { STRIPE_PLANS, calculateTotals } from '../utils/stripe';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Stripe card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#9ca3af',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

// Add US states for dropdown
const US_STATES = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

// Payment form component
const PaymentForm = ({ formData, setFormData, errors, setErrors, handleSubmit, isSubmitting, selectedPlan, totals, showPayment }) => {
  const stripe = useStripe();
  const elements = useElements();

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

    // Show payment fields for paid plans
    if (name === 'selectedPlan') {
      setFormData(prev => ({ ...prev, showPayment: value !== 'trial' }));
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
      case 'agreeToTerms':
        return value ? { isValid: true, message: '' } : { isValid: false, message: 'You must agree to the terms' };
      default:
        return { isValid: true, message: '' };
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate required fields
    ['name', 'email'].forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        newErrors[field] = validation.message;
        isValid = false;
      }
    });

    // Validate payment fields if required
    if (showPayment) {
      // Validate Stripe card element
      if (elements) {
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          const { error } = cardElement;
          if (error) {
            newErrors.card = error.message;
            isValid = false;
          }
        }
      }
      
      // Validate terms agreement
      const termsValidation = validateField('agreeToTerms', formData.agreeToTerms);
      if (!termsValidation.isValid) {
        newErrors.agreeToTerms = termsValidation.message;
        isValid = false;
      }
    } else {
      // For trial, only need to agree to terms
      const termsValidation = validateField('agreeToTerms', formData.agreeToTerms);
      if (!termsValidation.isValid) {
        newErrors.agreeToTerms = termsValidation.message;
        isValid = false;
      }
    }

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (showPayment && stripe && elements) {
      // Create payment method for paid plans
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
          },
        });

        if (error) {
          setErrors(prev => ({
            ...prev,
            card: error.message
          }));
          return;
        }

        // Submit with payment method
        await handleSubmit(paymentMethod.id);
      }
    } else {
      // Submit trial without payment
      await handleSubmit(null);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="mb-4">
        <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">State <span className="text-red-500">*</span></label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white mb-2"
        >
          {US_STATES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mb-0">We only collect sales tax for Michigan customers.</p>
      </div>
      {/* Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        
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
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          id="business"
          name="business"
          value={formData.business}
          onChange={handleChange}
          className="w-full peer min-h-[44px]"
          placeholder="Business Name (optional)"
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
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full peer min-h-[44px] ${errors.website ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="Website (optional)"
          />
          {errors.website && (
            <p className="text-red-400 text-sm mt-1">{errors.website}</p>
          )}
        </div>
        
        <select
          id="serviceType"
          name="serviceType"
          value={formData.serviceType || ''}
          onChange={handleChange}
          className="w-full peer min-h-[44px] text-gray-400"
        >
          <option value="" disabled>Primary Service Interest</option>
          <option value="seo">SEO Services</option>
          <option value="ppc">Pay-Per-Click (PPC)</option>
          <option value="social">Social Media Marketing</option>
          <option value="email">Email Marketing</option>
          <option value="content">Content Creation</option>
          <option value="consultation">Marketing Consultation</option>
        </select>
      </div>

      <textarea
        id="idealClient"
        name="idealClient"
        value={formData.idealClient}
        onChange={handleChange}
        rows={3}
        className="w-full peer min-h-[48px]"
        placeholder="Describe your ideal client (optional)"
      />

      {/* Payment Information - Only show for paid plans */}
      {showPayment && (
        <div className="border-t border-white/10 pt-6 mt-6">
          <h4 className="text-lg font-semibold text-white mb-4">Payment Information</h4>
          
          <div className="relative">
            <div className={`w-full peer min-h-[48px] p-3 border rounded-lg ${errors.card ? 'border-red-500' : 'border-white/20'}`}>
              <CardElement options={cardElementOptions} />
            </div>
            {errors.card && (
              <p className="text-red-400 text-sm mt-1">{errors.card}</p>
            )}
          </div>
        </div>
      )}

      {/* Terms Agreement */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="mt-1"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
          I agree to the{' '}
          <a href="/terms-of-use" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy-policy" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
            Privacy Policy
          </a>
          *
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-red-400 text-sm mt-1">{errors.agreeToTerms}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || (showPayment && !stripe)}
        className="btn-apple-primary w-full text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing...
          </span>
        ) : (
          `${selectedPlan.buttonText} ${showPayment ? `- $${totals.total}` : ''}`
        )}
      </button>
    </form>
  );
};

// Main SignupForm component
const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    website: '',
    idealClient: '',
    serviceType: '', // Changed from leadGoal to serviceType
    selectedPlan: 'trial',
    agreeToTerms: false,
    state: '', // No default, require user to select
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [stripePrices, setStripePrices] = useState({});
  const [step, setStep] = useState(1); // 1 = core plan, 2 = add-ons/payment

  useEffect(() => {
    async function fetchPrices() {
      const res = await fetch('/.netlify/functions/get-stripe-prices');
      const data = await res.json();
      setStripePrices(data);
    }
    fetchPrices();
  }, []);

  // Multi-select: one core/standalone plan (radio), multiple add-ons (checkboxes)
  const corePlans = [
    STRIPE_PLANS.trial, // Allow trial as a core plan
    STRIPE_PLANS.starter,
    STRIPE_PLANS.pro,
    STRIPE_PLANS.payperlead,
    // Keep only the main marketing services as core plans
    STRIPE_PLANS.seo,
    STRIPE_PLANS.ppc,
    STRIPE_PLANS.social,
    STRIPE_PLANS.email
  ];

  // Group add-ons by category for better organization
  const addonPlans = [
    // Marketing Services
    {
      category: 'Marketing Services',
      plans: [
        STRIPE_PLANS.seo_addon,
        STRIPE_PLANS.ppc_addon,
        STRIPE_PLANS.social_addon,
        STRIPE_PLANS.email_addon
      ]
    },
    // Business Tools
    {
      category: 'Business Tools',
      plans: [
        STRIPE_PLANS.reputation_addon,
        STRIPE_PLANS.analytics_addon,
        STRIPE_PLANS.content_addon
      ]
    },
    // Bundles
    {
      category: 'Bundles',
      plans: [
        STRIPE_PLANS.growth_bundle,
        STRIPE_PLANS.brand_bundle,
        STRIPE_PLANS.ultimate_bundle
      ]
    }
  ];

  // Store selected core plan and add-ons
  const [selectedCore, setSelectedCore] = useState('starter');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Update formData.selectedPlan for compatibility
  useEffect(() => {
    setFormData(prev => ({ ...prev, selectedPlan: selectedCore, selectedAddons }));
  }, [selectedCore, selectedAddons]);

  // Calculate totals for all selected plans
  const selectedCorePlan = STRIPE_PLANS[selectedCore];
  const selectedAddonPlans = selectedAddons.map(id => STRIPE_PLANS[id]);
  const subtotal = selectedCorePlan.price + selectedAddonPlans.reduce((sum, p) => sum + p.price, 0);
  const effectiveTaxRate = formData.state === 'MI' ? 0.06 : selectedCorePlan.taxRate;
  const taxAmount = subtotal * effectiveTaxRate;
  const total = subtotal + taxAmount;

  const showPayment = selectedCorePlan.price > 0 || selectedAddonPlans.length > 0;

  // On mount, handle plan selection from hero/CTA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Pre-fill email from lead magnet if present
      const leadMagnetEmail = localStorage.getItem('leadMagnetEmail');
      if (leadMagnetEmail) {
        setFormData(prev => ({ ...prev, email: leadMagnetEmail }));
        localStorage.removeItem('leadMagnetEmail');
      }
      const storedPlan = localStorage.getItem('selectedPlan');
      let plan = 'trial';
      if (storedPlan && STRIPE_PLANS[storedPlan]) {
        plan = storedPlan;
        localStorage.removeItem('selectedPlan');
        setStep(2); // Jump to Step 2 if coming from hero/CTA
      }
      setSelectedCore(plan);
      setFormData(prev => ({ ...prev, selectedPlan: plan }));
      const handlePlanSelected = (e) => {
        const planId = e.detail;
        if (STRIPE_PLANS[planId]) {
          setSelectedCore(planId);
          setFormData(prev => ({ ...prev, selectedPlan: planId }));
          setStep(2); // Jump to Step 2 if plan selected from hero/CTA
        }
      };
      window.addEventListener('planSelected', handlePlanSelected);
      return () => window.removeEventListener('planSelected', handlePlanSelected);
    }
  }, []);

  const handleSubmit = async (paymentMethodId) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setOrderConfirmation(null);

    // Process form data for submission
    const submissionData = {
      ...formData,
      email: formData.email.trim(),
      website: formData.website ? validateUrl(formData.website).url : '',
      phone: formData.phone ? formData.phone.trim() : '',
      paymentMethodId,
      isTrial: selectedCorePlan.id === 'trial',
      selectedCore: selectedCore,
      selectedAddons: selectedAddons,
    };

    try {
      const response = await fetch('/.netlify/functions/stripe-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: result.message });
        setOrderConfirmation(result.orderConfirmation);
        setFormData({
          name: '',
          business: '',
          email: '',
          phone: '',
          website: '',
          idealClient: '',
          serviceType: '', // Reset serviceType instead of leadGoal
          selectedPlan: 'trial',
          agreeToTerms: false,
          state: '',
        });
        setErrors({});
      } else {
        setSubmitStatus({ type: 'error', message: result.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order confirmation component
  const OrderConfirmation = ({ confirmation }) => (
    <div className="glass-strong p-8 rounded-2xl border border-green-500/30">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
        <p className="text-gray-300">Thank you for choosing Riva</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Order ID:</span>
          <span className="text-white font-mono">{confirmation.orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Confirmation #:</span>
          <span className="text-white font-mono">{confirmation.confirmationNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Plan:</span>
          <span className="text-white">{confirmation.plan}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Leads:</span>
          <span className="text-white">{confirmation.leads} per month</span>
        </div>
        {confirmation.subtotal > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-white">${confirmation.subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tax:</span>
              <span className="text-white">${confirmation.taxAmount}</span>
            </div>
            <div className="border-t border-white/20 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Total:</span>
                <span className="text-white font-bold text-lg">${confirmation.total}</span>
              </div>
            </div>
          </>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Date:</span>
          <span className="text-white">{new Date(confirmation.date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-sm">
          A confirmation email has been sent to <strong>{confirmation.customerEmail}</strong> with your login details and next steps.
        </p>
      </div>
      {['Starter Plan', 'Pro Plan'].includes(confirmation.plan) && confirmation.stripeCustomerId && (
        <div className="mt-8 text-center">
          <button
            className="btn-apple-primary px-8 py-4 text-lg font-bold rounded-full"
            onClick={async () => {
              try {
                const res = await fetch('/.netlify/functions/stripe-customer-portal', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ customerId: confirmation.stripeCustomerId, returnUrl: window.location.origin })
                });
                const data = await res.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  alert('Could not open customer portal. Please contact support.');
                }
              } catch (err) {
                alert('Could not open customer portal. Please contact support.');
              }
            }}
          >
            Manage Subscription
          </button>
          <p className="text-xs text-gray-400 mt-2">Update payment, cancel, or view invoices anytime.</p>
        </div>
      )}
    </div>
  );

  // If order confirmation is shown, display it instead of the form
  if (orderConfirmation) {
    return (
      <section id="signup" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black space-bg">
        <div className="max-w-2xl mx-auto">
          <OrderConfirmation confirmation={orderConfirmation} />
        </div>
      </section>
    );
  }

  // Define which plans are core/standalone and which are add-ons
  const isAddon = plan => plan.id.endsWith('_addon');
  const isStandaloneOrCore = plan => !plan.id.endsWith('_addon') && plan.id !== 'trial';

  // Only allow add-ons to be selected if a core/standalone plan is also selected
  // For simplicity, in this UI, we will disable add-ons unless a core/standalone plan is selected in another dropdown (future: multi-select)
  // For now, hide add-ons from the dropdown unless a core/standalone plan is selected

  // If only one plan can be selected, only show add-ons if a core/standalone plan is already selected
  const planOptions = [
    STRIPE_PLANS.trial,
    STRIPE_PLANS.starter,
    STRIPE_PLANS.pro,
    STRIPE_PLANS.payperlead,
    // Keep only the main marketing services as core plans
    STRIPE_PLANS.seo,
    STRIPE_PLANS.ppc,
    STRIPE_PLANS.social,
    STRIPE_PLANS.email
  ];

  return (
    <section id="signup" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black space-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
            Sign Up <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">for Your Plan</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Complete the form below to get started. All plans include pre-qualified leads and full support.
          </p>
        </div>
        {/* Step 1: Core Plan Selection */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
            <label className="block text-xl font-bold text-white mb-8 text-center">
              Choose Your Plan
              <p className="text-sm font-normal text-gray-400 mt-2">Select the plan that best fits your business needs</p>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {corePlans.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedCore(plan.id)}
                  className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedCore === plan.id 
                      ? 'bg-gradient-to-br from-blue-900/30 to-blue-950/50 border-2 border-blue-400 ring-2 ring-blue-400/30' 
                      : 'bg-white/5 border border-white/10 hover:border-blue-400/40'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      {plan.id === 'trial' && (
                        <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {plan.price === 0 ? 'Free' : `$${plan.price}${plan.duration === 'per month' ? '/mo' : plan.duration === 'per lead' ? '/lead' : plan.duration === 'one-time' ? '' : ''}`}
                      </span>
                      {plan.duration && plan.price > 0 && (
                        <span className="text-sm text-gray-400 ml-1">
                          {plan.duration === 'per month' ? '' : plan.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-4">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features && plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <svg className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features && plan.features.length > 4 && (
                      <li className="text-xs text-blue-400">+ {plan.features.length - 4} more features</li>
                    )}
                  </ul>
                  
                  <div className={`w-full py-2.5 px-4 rounded-lg font-medium text-center transition-all ${
                    selectedCore === plan.id
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-blue-600/90 hover:bg-blue-700 text-white'
                  }`}>
                    {selectedCore === plan.id ? 'Selected' : 'Select Plan'}
                  </div>
                  
                  {selectedCore === plan.id && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-blue-400 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <button
                className="btn-apple-primary px-10 py-3 text-lg font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                disabled={!selectedCore}
                onClick={() => setStep(2)}
              >
                Continue to Add-ons
                <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* Step 2: Add-Ons, Order Summary, Payment */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Plans
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-400">Selected Plan</div>
                <div className="text-lg font-bold text-white">{STRIPE_PLANS[selectedCore]?.name}</div>
              </div>
            </div>
            
            {/* Add-ons Section */}
            {(selectedCore && selectedCore !== 'trial') && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6">Enhance Your Plan</h3>
                <p className="text-gray-400 mb-6">Select any add-ons to complement your plan</p>
                <div className="space-y-8">
                  {addonPlans.map((category) => (
                    <div key={category.category} className="space-y-4">
                      <h4 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                        {category.category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.plans.map((plan) => (
                          <div 
                            key={plan.id}
                            onClick={() => {
                              setSelectedAddons(prev => 
                                prev.includes(plan.id) 
                                  ? prev.filter(id => id !== plan.id)
                                  : [...prev, plan.id]
                              );
                            }}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${
                              selectedAddons.includes(plan.id)
                                ? 'bg-gradient-to-br from-blue-900/20 to-blue-950/30 border-blue-400 ring-2 ring-blue-400/30'
                                : 'bg-white/5 border-white/10 hover:border-blue-400/40'
                            }`}
                          >
                            <div className="flex items-start">
                              <div 
                                className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center ${
                                  selectedAddons.includes(plan.id) 
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white/5 border-white/20'
                                }`}
                              >
                                {selectedAddons.includes(plan.id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-white">{plan.name.replace(' (Add-On)', '')}</h4>
                                  <span className="text-blue-400 font-semibold">+${plan.price}/mo</span>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">{plan.description}</p>
                                {plan.features && plan.features.length > 0 && (
                                  <ul className="mt-2 space-y-1 text-xs text-gray-400">
                                    {plan.features.slice(0, 3).map((feature, i) => (
                                      <li key={i} className="flex items-center">
                                        <svg className="w-3 h-3 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                      </li>
                                    ))}
                                    {plan.features.length > 3 && (
                                      <li className="text-blue-400 text-xs mt-1">+{plan.features.length - 3} more features</li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Order Summary for all selected plans */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Plan:</span>
                  <span className="text-white">{selectedCorePlan.name}</span>
                </div>
                {selectedAddonPlans.map(plan => (
                  <div className="flex justify-between" key={plan.id}>
                    <span className="text-gray-300">Add-On:</span>
                    <span className="text-white">{plan.name.replace(' (Add-On)', '')} +${plan.price}/mo</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal:</span>
                  <span className="text-white">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax ({(effectiveTaxRate * 100)}%):</span>
                  <span className="text-white">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-white text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            {['starter', 'pro'].includes(selectedCorePlan.id) && (
              <div className="text-xs text-blue-300 bg-blue-900/30 rounded-lg px-3 py-2 mb-2 mt-2 text-center font-medium">
                Billed automatically every month. Cancel anytime.
              </div>
            )}
            {/* Payment and Terms */}
            <div className="min-h-[350px] transition-all duration-300">
              {selectedCorePlan.id === 'enterprise' ? (
                <div className="glass-strong p-8 rounded-2xl text-center">
                  <h3 className="text-2xl font-bold text-white mb-6">Custom Enterprise Plan</h3>
                  <p className="text-gray-300 mb-6">Contact us for a custom quote and unlimited leads, integrations, and dedicated support.</p>
                  <a href="#contact" className="btn-apple-primary w-full py-4 text-lg font-bold rounded-full">Contact Us</a>
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    selectedPlan={selectedCorePlan}
                    totals={{ subtotal, taxAmount, total }}
                    showPayment={showPayment}
                  />
                </Elements>
              )}
            </div>
            {/* Status Message */}
            {submitStatus && (
              <div className={`p-4 rounded-lg mt-4 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                {submitStatus.message}
              </div>
            )}
          </div>
        )}
        {/* Legal Disclaimer */}
        <div className="max-w-2xl mx-auto text-xs text-gray-400 text-center mt-8">
          <p className="mb-2">* All references to lead quantities (e.g., "up to 15 leads per month") are estimates. Actual lead volume may vary based on market demand, client criteria, and other factors. Riva will make best efforts to deliver as many qualified leads as possible, but does not guarantee a minimum number of leads for any plan. No refunds or credits will be issued solely for lower-than-expected lead volume unless otherwise stated in a separate written agreement.</p>
          <p className="mb-2">* Results from SEO, PPC, Social Media, and other marketing services are not guaranteed. Performance may vary based on industry, competition, and other factors outside our control.</p>
          <p className="mb-2">* By purchasing, you agree to our <a href="/terms-of-use" className="text-blue-400 underline hover:text-blue-300">Terms of Service</a> and <a href="/privacy-policy" className="text-blue-400 underline hover:text-blue-300">Privacy Policy</a>.</p>
        </div>
      </div>
    </section>
  );
};

export default SignupForm; 