import React from 'react';
import { validatePassword, getPasswordStrengthLabel } from '../utils/passwordUtils';

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;
  
  const { requirements, strength } = validatePassword(password);
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthPercent = Math.min(100, Math.max(0, strength));
  
  // Color based on strength
  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Password Strength: {strengthLabel}</span>
        <span className="text-sm font-medium">{strengthPercent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getStrengthColor()}`}
          style={{ width: `${strengthPercent}%` }}
        ></div>
      </div>
      
      <div className="mt-3 text-sm">
        <p className="font-medium mb-1">Requirements:</p>
        <ul className="space-y-1">
          <li className={requirements.hasUpperCase ? 'text-green-500' : 'text-gray-400'}>
            {requirements.hasUpperCase ? '✓' : '•'} At least one uppercase letter
          </li>
          <li className={requirements.hasLowerCase ? 'text-green-500' : 'text-gray-400'}>
            {requirements.hasLowerCase ? '✓' : '•'} At least one lowercase letter
          </li>
          <li className={requirements.hasNumbers ? 'text-green-500' : 'text-gray-400'}>
            {requirements.hasNumbers ? '✓' : '•'} At least one number
          </li>
          <li className={requirements.hasSpecialChar ? 'text-green-500' : 'text-gray-400'}>
            {requirements.hasSpecialChar ? '✓' : '•'} At least one special character (!@#$%^&*)
          </li>
          <li className={requirements.isLongEnough ? 'text-green-500' : 'text-gray-400'}>
            {requirements.isLongEnough ? '✓' : '•'} At least 8 characters long
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
