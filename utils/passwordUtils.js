/**
 * Password strength requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= minLength;

  return {
    isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough,
    requirements: {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough,
    },
    strength: calculatePasswordStrength(password)
  };
};

export const calculatePasswordStrength = (password) => {
  let strength = 0;
  const requirements = [
    /[A-Z]/,      // Uppercase letters
    /[a-z]/,      // Lowercase letters
    /[0-9]/,      // Numbers
    /[^A-Za-z0-9]/, // Special characters
  ];

  // Calculate strength based on requirements met
  strength += requirements.filter(regex => regex.test(password)).length * 20;
  
  // Add points for length (max 20 points for 20+ characters)
  strength += Math.min(Math.floor(password.length / 2), 20);
  
  return Math.min(Math.max(strength, 0), 100); // Clamp between 0-100
};

export const getPasswordStrengthLabel = (strength) => {
  if (strength < 40) return 'Weak';
  if (strength < 70) return 'Moderate';
  if (strength < 90) return 'Strong';
  return 'Very Strong';
};
