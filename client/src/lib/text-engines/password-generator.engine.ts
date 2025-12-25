import { PasswordOptions, PasswordStrength, PasswordEntropy, PasswordGenerationResult } from '@/types/text-tool.types';

/**
 * Password generation result with all security metrics
 */
export interface PasswordGeneratorResult extends PasswordGenerationResult {
  strength: PasswordStrength;
  entropy: PasswordEntropy;
}

/**
 * Password generator function type with proper generic typing
 */
export type PasswordGeneratorFunction = (options: PasswordOptions) => string;

/**
 * Character sets for password generation
 */
const CHARSET_DEFINITIONS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similarChars: '0O1lI',
  ambiguousChars: '{}[]()/\\\'"`~,;.<>',
} as const;

/**
 * Builds character set based on password options
 * 
 * @param options - Password generation options
 * @returns Character set string for generation
 */
export const buildCharacterSet = (options: PasswordOptions): string => {
  let charset = '';

  if (options.includeUppercase) charset += CHARSET_DEFINITIONS.uppercase;
  if (options.includeLowercase) charset += CHARSET_DEFINITIONS.lowercase;
  if (options.includeNumbers) charset += CHARSET_DEFINITIONS.numbers;
  if (options.includeSymbols) charset += CHARSET_DEFINITIONS.symbols;

  if (options.customCharacters) {
    charset += options.customCharacters;
  }

  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => !CHARSET_DEFINITIONS.similarChars.includes(char)).join('');
  }
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(char => !CHARSET_DEFINITIONS.ambiguousChars.includes(char)).join('');
  }

  return charset;
};

/**
 * Validates that generated password contains required character types
 * 
 * @param password - Generated password to validate
 * @param options - Password generation options
 * @returns True if password meets all requirements
 */
export const validatePasswordRequirements = (password: string, options: PasswordOptions): boolean => {
  if (options.includeUppercase && !/[A-Z]/.test(password)) return false;
  if (options.includeLowercase && !/[a-z]/.test(password)) return false;
  if (options.includeNumbers && !/[0-9]/.test(password)) return false;
  if (options.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return false;
  return true;
};

/**
 * Generates a cryptographically secure password
 * 
 * @param options - Password generation options
 * @returns Strongly-typed generated password string
 */
export const generatePassword: PasswordGeneratorFunction = (options: PasswordOptions): string => {
  const charset = buildCharacterSet(options);

  if (charset.length === 0) {
    throw new Error('Error: No character set selected');
  }

  let generatedPassword = '';
  const array = new Uint8Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    generatedPassword += charset[array[i] % charset.length];
  }

  // Ensure password meets all requirements
  let attempts = 0;
  while (!validatePasswordRequirements(generatedPassword, options) && attempts < 10) {
    const newArray = new Uint8Array(options.length);
    crypto.getRandomValues(newArray);
    generatedPassword = '';

    for (let i = 0; i < options.length; i++) {
      generatedPassword += charset[newArray[i] % charset.length];
    }

    attempts++;
  }

  return generatedPassword;
};

/**
 * Calculates password strength score and feedback
 * 
 * @param password - Password to evaluate
 * @returns PasswordStrength object with score, label, and description
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 2;
  else feedback.push('Add symbols');

  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Determine strength label and color
  if (score <= 2) {
    return {
      score,
      label: 'Weak',
      color: 'bg-red-500',
      description: `This password is easily guessable. ${feedback.slice(0, 2).join(', ')}`
    };
  } else if (score <= 4) {
    return {
      score,
      label: 'Fair',
      color: 'bg-orange-500',
      description: `This password is okay but could be stronger. ${feedback.slice(0, 1).join('')}`
    };
  } else if (score <= 6) {
    return {
      score,
      label: 'Good',
      color: 'bg-yellow-500',
      description: 'This password is fairly secure for most uses.'
    };
  } else if (score <= 7) {
    return {
      score,
      label: 'Strong',
      color: 'bg-blue-500',
      description: 'This password is strong and secure.'
    };
  } else {
    return {
      score,
      label: 'Very Strong',
      color: 'bg-green-500',
      description: 'This password is very secure and hard to crack.'
    };
  }
};

/**
 * Calculates password entropy and estimated crack time
 * 
 * @param password - Password to analyze
 * @param options - Password generation options
 * @returns PasswordEntropy object with entropy bits and crack time estimate
 */
export const calculateEntropy = (password: string, options: PasswordOptions): PasswordEntropy => {
  let charsetSize = 0;
  if (options.includeUppercase) charsetSize += 26;
  if (options.includeLowercase) charsetSize += 26;
  if (options.includeNumbers) charsetSize += 10;
  if (options.includeSymbols) charsetSize += 25;
  if (options.customCharacters) charsetSize += options.customCharacters.length;

  const entropyValue = password.length * Math.log2(charsetSize);
  
  const guessesPerSecond = 1_000_000_000; // 1 billion guesses per second
  const totalCombinations = Math.pow(charsetSize, password.length);
  const secondsToCrack = totalCombinations / (2 * guessesPerSecond); // divide by 2 for average case

  let crackTimeReadable = '';
  if (secondsToCrack < 1) crackTimeReadable = 'Instant';
  else if (secondsToCrack < 60) crackTimeReadable = `${Math.round(secondsToCrack)} seconds`;
  else if (secondsToCrack < 3600) crackTimeReadable = `${Math.round(secondsToCrack / 60)} minutes`;
  else if (secondsToCrack < 86400) crackTimeReadable = `${Math.round(secondsToCrack / 3600)} hours`;
  else if (secondsToCrack < 31536000) crackTimeReadable = `${Math.round(secondsToCrack / 86400)} days`;
  else if (secondsToCrack < 31536000000) crackTimeReadable = `${Math.round(secondsToCrack / 31536000)} years`;
  else if (secondsToCrack < 31536000000000) crackTimeReadable = `${Math.round(secondsToCrack / 31536000000)} thousand years`;
  else if (secondsToCrack < 31536000000000000) crackTimeReadable = `${Math.round(secondsToCrack / 31536000000000)} million years`;
  else crackTimeReadable = 'Billions of years';

  return {
    entropy: Math.round(entropyValue),
    charsetSize,
    crackTimeSeconds: secondsToCrack,
    crackTimeReadable,
    estimatedCrackTime: crackTimeReadable
  };
};

/**
 * Validates password generation options
 * 
 * @param options - Options to validate
 * @returns True if options are valid
 */
export const isValidPasswordOptions = (options: PasswordOptions): boolean => {
  if (options.length < 4 || options.length > 128) return false;
  
  const hasAtLeastOneCharType: boolean =
    options.includeUppercase === true ||
    options.includeLowercase === true ||
    options.includeNumbers === true ||
    options.includeSymbols === true ||
    (typeof options.customCharacters === 'string' && options.customCharacters.length > 0);
  
  return hasAtLeastOneCharType;
};
