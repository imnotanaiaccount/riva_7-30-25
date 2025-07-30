# Stripe Webhook Handler Tests

This directory contains tests for the Stripe webhook handler in the Riva application. These tests verify that the webhook handler correctly processes Stripe events and updates the database accordingly.

## Prerequisites

1. Node.js 14 or later
2. A Stripe test API key
3. A Supabase project with the `submissions2` table

## Setup

1. Install dependencies:
   ```bash
   cd test
   npm install
   ```

2. Create a `.env` file in the test directory with the following variables:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## Running Tests

To run all tests:
```bash
npm test
```

To run tests in watch mode (automatically re-runs on file changes):
```bash
npm run test:watch
```

## Test Coverage

The test suite covers the following scenarios:

1. **Checkout Session Completed**
   - Verifies that a new checkout session creates/updates a user in the database
   - Validates that the subscription status is set correctly

2. **Subscription Created**
   - Tests the creation of a new subscription
   - Verifies that the subscription details are stored in the database

3. **Subscription Updated**
   - Tests updating an existing subscription (e.g., plan changes)
   - Verifies that the database is updated with the new subscription details

4. **Subscription Deleted**
   - Tests the cancellation of a subscription
   - Verifies that the subscription status is updated in the database

5. **Invoice Paid**
   - Tests successful payment processing
   - Verifies that the payment date is recorded

6. **Payment Failed**
   - Tests handling of failed payments
   - Verifies that the subscription status is updated to 'past_due'

## Adding New Tests

To add a new test:

1. Create a new test case in `stripe-webhook.test.js`
2. Use the helper functions to set up test data
3. Simulate the Stripe webhook event
4. Verify that the database was updated correctly

## Best Practices

- Always clean up test data after tests complete
- Use descriptive test names
- Test both success and error cases
- Mock external services when appropriate
- Keep tests independent of each other

## Debugging

To debug tests, you can add `console.log` statements or use the Node.js debugger:

```bash
node --inspect-brk node_modules/.bin/_mocha stripe-webhook.test.js
```

Then open Chrome and navigate to `chrome://inspect` to attach the debugger.
