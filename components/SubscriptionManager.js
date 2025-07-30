import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { STRIPE_PLANS } from '../utils/stripe';
import { createCheckoutSession, createBillingPortalSession, cancelSubscription, reactivateSubscription, updateSubscription } from '../utils/stripe-utils';

export default function SubscriptionManager({ user, subscription }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'free');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.plan) {
      setSelectedPlan(user.plan);
    }
  }, [user]);

  const handleUpgrade = async (planId, isTrial = false) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const { id: sessionId } = await createCheckoutSession(user.id, planId, isTrial);
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user?.stripe_customer_id) {
      toast.error('No billing information found');
      return;
    }

    setIsLoading(true);
    try {
      const { url } = await createBillingPortalSession(user.stripe_customer_id);
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id || !window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelSubscription(subscription.id);
      toast.success('Your subscription has been scheduled for cancellation');
      router.replace(router.asPath); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.id) return;

    setIsReactivating(true);
    try {
      await reactivateSubscription(subscription.id);
      toast.success('Your subscription has been reactivated');
      router.replace(router.asPath); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setIsReactivating(false);
    }
  };

  const handlePlanChange = async (newPlanId) => {
    if (!subscription?.id || !window.confirm(`Are you sure you want to change to the ${STRIPE_PLANS[newPlanId]?.name} plan?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateSubscription(subscription.id, newPlanId);
      toast.success('Your subscription has been updated');
      router.replace(router.asPath); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentPlan = STRIPE_PLANS[user?.plan || 'free'];
  const isTrial = user?.subscription_status === 'trialing';
  const isCancelled = subscription?.cancel_at_period_end;
  const isActive = subscription?.status === 'active' && !isCancelled;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{currentPlan?.name || 'Free'}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {isTrial && 'Trial ends '}
              {isCancelled && 'Expires '}
              {subscription?.current_period_end && (
                new Date(subscription.current_period_end * 1000).toLocaleDateString()
              )}
            </p>
            {isTrial && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                Your trial will end soon. Upgrade to keep your access.
              </p>
            )}
            {isCancelled && (
              <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                Your subscription will be cancelled at the end of the billing period.
              </p>
            )}
          </div>
          <div className="space-x-3">
            {isActive && (
              <>
                <button
                  onClick={handleManageBilling}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Manage Billing'}
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isLoading || isCancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </>
            )}
            {isCancelled && (
              <button
                onClick={handleReactivateSubscription}
                disabled={isLoading || isReactivating}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(STRIPE_PLANS).map(([planId, plan]) => {
          const isCurrentPlan = planId === user?.plan;
          const isUpgrade = plan.price > (currentPlan?.price || 0);
          
          return (
            <div 
              key={planId}
              className={`border rounded-lg p-6 ${isCurrentPlan ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  ${plan.price}
                </span>
                {plan.interval && (
                  <span className="text-gray-600 dark:text-gray-300">/{plan.interval}</span>
                )}
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{plan.description}</p>
              
              <ul className="mt-4 space-y-2">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-md cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => isUpgrade ? handleUpgrade(planId) : handlePlanChange(planId)}
                    disabled={isLoading || isUpdating}
                    className={`w-full px-4 py-2 rounded-md text-white ${
                      isUpgrade 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {isLoading || isUpdating 
                      ? 'Processing...' 
                      : isUpgrade 
                        ? 'Upgrade Now' 
                        : 'Switch to this plan'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
