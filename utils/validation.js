// Email validation - comprehensive but user-friendly
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Check for common typos and issues
  if (trimmedEmail.includes('..')) {
    return { isValid: false, message: 'Email cannot contain consecutive dots' };
  }

  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return { isValid: false, message: 'Email cannot start or end with a dot' };
  }

  // Check for reasonable length
  if (trimmedEmail.length > 254) {
    return { isValid: false, message: 'Email is too long' };
  }

  const [localPart, domain] = trimmedEmail.split('@');
  if (localPart.length > 64) {
    return { isValid: false, message: 'Email username is too long' };
  }

  return { isValid: true, message: '', email: trimmedEmail };
};

// Phone validation - flexible and user-friendly
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: true, message: '', phone: '' }; // Optional field
  }

  const trimmedPhone = phone.trim();
  
  // Remove all non-digit characters for validation
  const digitsOnly = trimmedPhone.replace(/\D/g, '');
  
  // Check if we have enough digits (7-15 is reasonable for international)
  if (digitsOnly.length < 7) {
    return { isValid: false, message: 'Phone number is too short' };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Phone number is too long' };
  }

  // Check for repeated digits (likely invalid)
  if (/(\d)\1{5,}/.test(digitsOnly)) {
    return { isValid: false, message: 'Phone number appears invalid' };
  }

  return { isValid: true, message: '', phone: trimmedPhone };
};

// URL validation - relaxed and user-friendly
export const validateUrl = (url) => {
  if (!url || !url.trim()) {
    return { isValid: true, message: '', url: '' }; // Optional field
  }

  let processedUrl = url.trim();
  
  // Add protocol if missing
  if (!processedUrl.match(/^https?:\/\//)) {
    processedUrl = 'https://' + processedUrl;
  }

  try {
    const urlObj = new URL(processedUrl);
    
    // Check for valid domain
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return { isValid: false, message: 'Please enter a valid website address' };
    }

    // Check for reasonable length
    if (processedUrl.length > 2048) {
      return { isValid: false, message: 'Website address is too long' };
    }

    // Allow common TLDs and custom domains
    const validTLDs = ['.com', '.org', '.net', '.edu', '.gov', '.mil', '.io', '.co', '.ai', '.app', '.dev', '.me', '.tv', '.cc', '.biz', '.info'];
    const hasValidTLD = validTLDs.some(tld => urlObj.hostname.toLowerCase().endsWith(tld)) || 
                       urlObj.hostname.includes('.') && urlObj.hostname.split('.').pop().length >= 2;

    if (!hasValidTLD) {
      return { isValid: false, message: 'Please enter a valid website address' };
    }

    return { isValid: true, message: '', url: processedUrl };
  } catch (error) {
    return { isValid: false, message: 'Please enter a valid website address' };
  }
};

// Real-time validation helpers
export const formatPhoneNumber = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

export const formatUrl = (value) => {
  if (!value) return value;
  
  // Don't add protocol if user is typing
  if (value.includes('://') || value.startsWith('www.')) {
    return value;
  }
  
  return value;
}; 