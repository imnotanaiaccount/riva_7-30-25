exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { to, subject, text, html } = data;

    // Validate required fields
    if (!to || !subject || !text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Prepare Brevo API request
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Riva Agency Form',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@riva-agency.com',
        },
        to: [
          {
            email: to,
            name: to.split('@')[0],
          },
        ],
        subject,
        textContent: text,
        htmlContent: html || text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Failed to send email via Brevo',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};
