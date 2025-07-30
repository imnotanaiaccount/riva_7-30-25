const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fetch = require('node-fetch');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendVerificationEmail(email, name, token) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const siteUrl = process.env.SITE_URL || 'https://rivaofficial.netlify.app';
  const verifyUrl = `${siteUrl}/.netlify/functions/verify?token=${token}`;

  const payload = {
    sender: { email: senderEmail, name: 'Riva' },
    to: [{ email, name }],
    subject: 'Verify your email for Riva',
    htmlContent: `<h1>Verify your email</h1><p>Click the link below to verify your email and activate your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error('Failed to send verification email');
  }
}

exports.handler = async function(event, context) {
  const { id } = JSON.parse(event.body || '{}');
  if (!id) {
    return { statusCode: 400, body: 'Missing id' };
  }
  // Fetch submission
  const { data, error } = await supabase.from('submissions').select('*').eq('id', id).single();
  if (error || !data) {
    return { statusCode: 404, body: 'Submission not found' };
  }
  // Generate new token
  const token = generateVerificationToken();
  await supabase.from('submissions').update({ verification_token: token }).eq('id', id);
  // Resend email
  await sendVerificationEmail(data.email, data.name, token);
  return { statusCode: 200, body: 'Verification email resent' };
}; 