import fetch from 'node-fetch';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@riva-agency.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Riva Agency';

/**
 * Sends an email with optional PDF attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} options.text - Plain text content of the email
 * @param {Object} [options.attachment] - Optional attachment
 * @param {string} options.attachment.name - Attachment filename
 * @param {string} options.attachment.url - URL to the attachment
 * @returns {Promise<Object>} - Response from Brevo API
 */
const sendEmail = async ({ to, subject, html, text, attachment }) => {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    // Fetch the PDF if attachment is provided
    let attachmentContent = null;
    if (attachment?.url) {
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch attachment: ${response.statusText}`);
      }
      const buffer = await response.buffer();
      attachmentContent = buffer.toString('base64');
    }

    const emailData = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: to,
          name: to.split('@')[0],
        },
      ],
      subject,
      htmlContent: html,
      textContent: text,
      ...(attachmentContent && {
        attachment: [
          {
            name: attachment.name,
            content: attachmentContent,
          },
        ],
      }),
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Sends a lead magnet email with PDF attachment
 * @param {string} email - Recipient email address
 * @param {Object} leadMagnet - Lead magnet details
 * @param {string} leadMagnet.name - Lead magnet name
 * @param {string} leadMagnet.url - Lead magnet URL
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendLeadMagnet = async (email, leadMagnet) => {
  const { name, url } = leadMagnet;
  
  const subject = `Your ${name} is ready to download!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Thank you for your interest!</h2>
      <p>As promised, here's your copy of <strong>${name}</strong>.</p>
      <p>You can find the PDF attached to this email. If you don't see the attachment, please check your spam folder.</p>
      <p>Best regards,<br>The Riva Agency Team</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="font-size: 12px; color: #6b7280;">
        If you didn't request this, please ignore this email or contact us if you have any questions.
      </p>
    </div>
  `;
  
  const text = `
    Thank you for your interest!
    
    As promised, here's your copy of ${name}.
    
    You can find the PDF attached to this email. If you don't see the attachment, please check your spam folder.
    
    Best regards,
    The Riva Agency Team
    
    ---
    If you didn't request this, please ignore this email or contact us if you have any questions.
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    attachment: {
      name: `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      url,
    },
  });
};

export { sendEmail, sendLeadMagnet };
