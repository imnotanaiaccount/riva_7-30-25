// All pricing and plan data is sourced from STRIPE_PLANS in utils/stripe.js. This is the single source of truth for pricing.
import React from 'react';
import { STRIPE_PLANS } from '../utils/stripe';

const displayPlans = [
  STRIPE_PLANS.trial,
  STRIPE_PLANS.starter,
  STRIPE_PLANS.pro,
  STRIPE_PLANS.payperlead,
  STRIPE_PLANS.seo,
  STRIPE_PLANS.seo_addon,
  STRIPE_PLANS.ppc,
  STRIPE_PLANS.ppc_addon,
  STRIPE_PLANS.social,
  STRIPE_PLANS.social_addon,
  STRIPE_PLANS.content,
  STRIPE_PLANS.content_addon,
  STRIPE_PLANS.email,
  STRIPE_PLANS.email_addon,
  STRIPE_PLANS.reputation,
  STRIPE_PLANS.reputation_addon,
  STRIPE_PLANS.analytics,
  STRIPE_PLANS.analytics_addon,
  STRIPE_PLANS.webdesign,
  STRIPE_PLANS.growth_bundle,
  STRIPE_PLANS.brand_bundle,
  STRIPE_PLANS.ultimate_bundle
];

const isBundle = plan => plan.id.endsWith('bundle');
const isAddon = plan => plan.id.endsWith('addon');

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = React.useState(null);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    scrollToSignup(planId);
  };

  const scrollToSignup = (planId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPlan', planId);
      window.dispatchEvent(new CustomEvent('planSelected', { detail: planId }));
      
      const el = document.getElementById('signup');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, null, '#signup');
      } else if (window.location.pathname !== '/') {
        window.location.href = `/#signup`;
      } else {
        setTimeout(() => {
          const retryEl = document.getElementById('signup');
          if (retryEl) {
            retryEl.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, null, '#signup');
          }
        }, 300);
      }
    }
  };

  // Group plans by category for better organization
  const planCategories = {
    core: displayPlans.filter(plan => ['trial', 'starter', 'pro', 'payperlead'].includes(plan.id)),
    bundles: displayPlans.filter(plan => isBundle(plan)),
    addons: displayPlans.filter(plan => isAddon(plan) && !isBundle(plan)),
    other: displayPlans.filter(plan => !isAddon(plan) && !isBundle(plan) && !['trial', 'starter', 'pro', 'payperlead'].includes(plan.id))
  };

  const renderPlanCard = (plan) => (
    <div
      key={plan.id}
      onClick={() => handlePlanSelect(plan.id)}
      className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
        selectedPlan === plan.id 
          ? 'ring-2 ring-blue-400 bg-gradient-to-br from-blue-900/30 to-blue-950/50' 
          : plan.popular 
            ? 'bg-gradient-to-b from-blue-900/20 to-blue-950/40 border border-blue-400/20 hover:border-blue-400/40'
            : isBundle(plan)
              ? 'bg-gradient-to-b from-green-900/20 to-green-950/40 border border-green-400/20 hover:border-green-400/40'
              : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/70'
      }`}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
      }}
    >
      {/* Selection indicator */}
      {selectedPlan === plan.id && (
        <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-blue-400 rounded-full">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
          Most Popular
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            {isBundle(plan) && (
              <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                Bundle
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {plan.price === 0 
                ? plan.id === 'trial' 
                  ? 'Free' 
                  : 'Custom' 
                : `$${plan.price}${plan.duration === 'per month' ? '/mo' : ''}`}
            </span>
            {plan.price > 0 && plan.duration && (
              <span className="text-sm text-gray-400 ml-1">
                {plan.duration === 'per month' ? '' : plan.duration}
              </span>
            )}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6 flex-grow">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start text-sm text-gray-300">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto">
          {isBundle(plan) && (
            <div className="text-xs text-green-300 bg-green-900/30 rounded-lg px-3 py-2 mb-3 text-center font-medium">
              Save up to 30% vs. buying separately
            </div>
          )}
          
          <button
            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all ${
              selectedPlan === plan.id
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : plan.popular
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  : isBundle(plan)
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
            }`}
          >
            {plan.cta || (selectedPlan === plan.id ? 'Selected' : 'Select Plan')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
          Choose the perfect plan for your business needs. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Core Plans */}
      {planCategories.core.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Core Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planCategories.core.map(renderPlanCard)}
          </div>
        </div>
      )}

      {/* Bundles */}
      {planCategories.bundles.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Bundles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planCategories.bundles.map(renderPlanCard)}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {planCategories.addons.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planCategories.addons.map(renderPlanCard)}
          </div>
        </div>
      )}

      {/* Other Plans */}
      {planCategories.other.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Other Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planCategories.other.map(renderPlanCard)}
          </div>
        </div>
      )}
    </section>
  );
}