const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to render HTML response
function renderResponse(title, message, isError = false) {
  return {
    statusCode: isError ? 400 : 200,
    headers: { 'Content-Type': 'text/html' },
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - Riva</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          .container { background: #f9f9f9; border-radius: 8px; padding: 30px; margin-top: 20px; }
          h1 { color: #333; }
          .btn { 
            display: inline-block; 
            background: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin-top: 15px;
          }
          .error { color: #d32f2f; }
          .success { color: #388e3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title}</h1>
          <p class="${isError ? 'error' : 'success'}">${message}</p>
          <a href="/" class="btn">Return to Home</a>
        </div>
      </body>
      </html>
    `
  };
}

async function processPaidSignup(data) {
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { 
    apiVersion: '2024-06-20' 
  });
  
  // Create customer if not exists
  let customerId = data.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone || undefined,
    });
    customerId = customer.id;
  }

  // Attach payment method and update customer
  await stripe.paymentMethods.attach(data.paymentMethodId, { 
    customer: customerId 
  });
  
  await stripe.customers.update(customerId, {
    invoice_settings: { 
      default_payment_method: data.paymentMethodId 
    },
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: data.stripePriceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  return { customerId, subscription };
}

async function sendEmail(to, subject, htmlContent) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    
    const payload = {
      sender: { 
        email: senderEmail, 
        name: 'Riva' 
      },
      to: [{ email: to.email, name: to.name }],
      subject,
      htmlContent
    };
    
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Error sending email:', error);
    // Fail silently - email sending shouldn't block verification
  }
}

exports.handler = async function(event, context) {
  // Extract token from query parameters
  const params = new URLSearchParams(event.rawQuery || event.queryStringParameters);
  const token = params.get('token') || (event.queryStringParameters && event.queryStringParameters.token);

  // Validate token
  if (!token) {
    return renderResponse(
      'Invalid Link', 
      'No verification token provided. Please check your email for the correct link.', 
      true
    );
  }

  try {
    // Find the submission with this token
    const { data, error } = await supabase
      .from('submissions2')
      .select('*')
      .eq('verification_token', token)
      .single();

    // Handle invalid or missing submission
    if (error || !data) {
      return renderResponse(
        'Invalid Link', 
        'This verification link is invalid or has expired. Please request a new verification email.', 
        true
      );
    }

    // Check if token has expired
    const now = new Date();
    const tokenExpires = data.verification_token_expires 
      ? new Date(data.verification_token_expires) 
      : null;
    
    if (tokenExpires && now > tokenExpires) {
      return renderResponse(
        'Link Expired', 
        'This verification link has expired. Please request a new verification email.', 
        true
      );
    }

    // Check if already verified
    if (data.verified) {
      return renderResponse(
        'Already Verified', 
        'Your email has already been verified. You can now log in to your account.'
      );
    }

    // Process based on plan type
    if (data.plan === 'trial') {
      // For trial, just mark as verified and active
      await supabase
        .from('submissions2')
        .update({ 
          verified: true, 
          status: 'trial_active',
          verified_at: new Date().toISOString()
        })
        .eq('id', data.id);

      return renderResponse(
        'Trial Activated',
        'Your free trial has been activated! You can now log in to your account.'
      );
    } else {
      // For paid plans, process payment
      try {
        const { customerId, subscription } = await processPaidSignup(data);
        
        // Update submission with subscription details
        await supabase
          .from('submissions2')
          .update({
            verified: true,
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            verified_at: new Date().toISOString()
          })
          .eq('id', data.id);

        // Send confirmation email for pay-per-lead
        if (data.plan === 'payperlead') {
          const emailContent = `
            <h1>Thank you for your order!</h1>
            <p>Your pay-per-lead order is confirmed. 
            <b>You will receive your qualified lead within 3 business days of purchase. 
            If we cannot deliver, you'll receive a full refund.</b></p>
            <p>If you have any questions, reply to this email or contact support.</p>
          `;
          
          await sendEmail(
            { email: data.email, name: data.name },
            'Your Pay-Per-Lead Order is Confirmed',
            emailContent
          );
        }

        return renderResponse(
          'Payment Successful',
          'Your payment was processed successfully! Your account is now active.'
        );
      } catch (error) {
        console.error('Payment processing error:', error);
        
        // Update submission with error
        await supabase
          .from('submissions2')
          .update({
            verified: false,
            status: 'payment_failed',
            payment_error: error.message || 'Payment processing failed'
          })
          .eq('id', data.id);

        // Send payment failure email
        const siteUrl = process.env.SITE_URL || 'https://rivaofficial.netlify.app';
        const retryUrl = `${siteUrl}/signup`;
        
        await sendEmail(
          { email: data.email, name: data.name },
          'Payment Failed',
          `
            <h1>Payment Failed</h1>
            <p>We were unable to process your payment. 
            Please <a href="${retryUrl}">try again</a> or contact support for help.</p>
            <p>Error: ${error.message || 'Unknown error'}</p>
          `
        );

        return renderResponse(
          'Payment Failed',
          `We were unable to process your payment: ${error.message}. Please try again or contact support.`,
          true
        );
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
    return renderResponse(
      'Verification Error',
      'An unexpected error occurred during verification. Please try again or contact support if the problem persists.',
      true
    );
  }
};
