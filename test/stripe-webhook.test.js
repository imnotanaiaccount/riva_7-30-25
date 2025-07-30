const { expect } = require('chai');
const sinon = require('sinon');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local first, then .env
const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });
dotenv.config(); // Load .env if .env.local doesn't exist

console.log('Using Stripe Key:', process.env.STRIPE_SECRET_KEY ? '***' + process.env.STRIPE_SECRET_KEY.slice(-4) : 'Not found');

// Initialize Stripe with the API key from environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test configuration
const TEST_CONFIG = {
  customer: {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'testpassword123',
  },
  product: {
    name: 'Test Product',
    type: 'service',
  },
  price: {
    unit_amount: 1999, // $19.99
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
  },
};

// Test data
let testCustomer;
let testProduct;
let testPrice;
let testSubscription;
let testCheckoutSession;

// Helper functions
async function createTestCustomer() {
  testCustomer = await stripe.customers.create({
    email: TEST_CONFIG.customer.email,
    name: TEST_CONFIG.customer.name,
    metadata: {
      test: 'true',
    },
  });
  
  console.log('Created test customer:', testCustomer.id);
  return testCustomer;
}

async function createTestProduct() {
  testProduct = await stripe.products.create({
    name: TEST_CONFIG.product.name,
    type: TEST_CONFIG.product.type,
  });
  
  console.log('Created test product:', testProduct.id);
  return testProduct;
}

async function createTestPrice() {
  if (!testProduct) {
    await createTestProduct();
  }
  
  testPrice = await stripe.prices.create({
    unit_amount: TEST_CONFIG.price.unit_amount,
    currency: TEST_CONFIG.price.currency,
    recurring: TEST_CONFIG.price.recurring,
    product: testProduct.id,
  });
  
  console.log('Created test price:', testPrice.id);
  return testPrice;
}

async function createTestCheckoutSession() {
  if (!testPrice) {
    await createTestPrice();
  }
  
  testCheckoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: testPrice.id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://example.com/canceled',
    metadata: {
      test: 'true',
    },
  });
  
  console.log('Created test checkout session:', testCheckoutSession.id);
  return testCheckoutSession;
}

// Test suite
describe('Stripe Webhook Handler', () => {
  before(async () => {
    // Create test resources
    await createTestCustomer();
    await createTestProduct();
    await createTestPrice();
    await createTestCheckoutSession();
  });

  after(async () => {
    // Clean up test resources
    if (testSubscription) {
      await stripe.subscriptions.del(testSubscription.id);
    }
    
    if (testPrice) {
      await stripe.prices.update(testPrice.id, { active: false });
    }
    
    if (testProduct) {
      await stripe.products.del(testProduct.id);
    }
    
    if (testCustomer) {
      await stripe.customers.del(testCustomer.id);
    }
    
    // Clean up test data from Supabase
    if (testCustomer) {
      const { error } = await supabase
        .from('submissions2')
        .delete()
        .eq('email', testCustomer.email);
      
      if (error) {
        console.error('Error cleaning up test data from Supabase:', error);
      }
    }
  });

  describe('Webhook Event Processing', () => {
    it('should process checkout.session.completed event', async () => {
      // Simulate checkout.session.completed event
      const event = {
        id: `evt_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: testCheckoutSession.id,
            customer: testCustomer.id,
            customer_email: testCustomer.email,
            subscription: 'sub_test123',
            metadata: {
              plan_id: 'premium',
            },
          },
        },
      };

      // Call the webhook handler directly
      const response = await fetch('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test-signature',
        },
        body: JSON.stringify(event),
      });

      expect(response.status).to.equal(200);
      
      // Verify the database was updated
      const { data: submission, error } = await supabase
        .from('submissions2')
        .select('*')
        .eq('email', testCustomer.email)
        .single();
      
      expect(error).to.be.null;
      expect(submission).to.exist;
      expect(submission.stripe_customer_id).to.equal(testCustomer.id);
      expect(submission.plan).to.equal('premium');
    });

    it('should process customer.subscription.created event', async () => {
      // Create a test subscription
      testSubscription = await stripe.subscriptions.create({
        customer: testCustomer.id,
        items: [{ price: testPrice.id }],
        metadata: {
          test: 'true',
        },
      });

      // Simulate customer.subscription.created event
      const event = {
        id: `evt_${Date.now()}`,
        type: 'customer.subscription.created',
        data: {
          object: testSubscription,
        },
      };

      // Call the webhook handler directly
      const response = await fetch('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test-signature',
        },
        body: JSON.stringify(event),
      });

      expect(response.status).to.equal(200);
      
      // Verify the database was updated
      const { data: submission, error } = await supabase
        .from('submissions2')
        .select('*')
        .eq('stripe_customer_id', testCustomer.id)
        .single();
      
      expect(error).to.be.null;
      expect(submission).to.exist;
      expect(submission.subscription_id).to.equal(testSubscription.id);
      expect(submission.subscription_status).to.equal('active');
    });

    // Add more test cases for other event types...
  });
});

// Run the tests
if (require.main === module) {
  const Mocha = require('mocha');
  const mocha = new Mocha({
    timeout: 10000, // 10 second timeout
    reporter: 'spec',
  });
  
  mocha.addFile(__filename);
  mocha.run(failures => {
    process.exitCode = failures ? 1 : 0;
  });
}
