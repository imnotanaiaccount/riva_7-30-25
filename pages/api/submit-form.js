import { formSecurityMiddleware } from '../../utils/formSecurity';
import { v4 as uuidv4 } from 'uuid';

// This is the actual handler for form submissions
async function handleFormSubmission(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, message, formType = 'contact' } = req.body;
    
    // Here you would typically:
    // 1. Save to a database
    // 2. Send confirmation email to user
    // 3. Process the submission as needed
    
    // For now, we'll just return a success response
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: uuidv4(),
      formType
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your submission.'
    });
  }
}

// Wrap the handler with our security middleware
export default formSecurityMiddleware(handleFormSubmission);
