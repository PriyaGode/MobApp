// Common email domains for validation
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com'
];

// Disposable email domains to block
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'temp-mail.org', 'getnada.com'
];

/**
 * Validates an email address using comprehensive checks
 * @param email - The email address to validate
 * @returns Error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'Invalid email format';
  }

  // Length validation
  if (trimmedEmail.length > 254) {
    return 'Email is too long (max 254 characters)';
  }

  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return 'Email must contain exactly one @ symbol';
  }

  const [localPart, domainPart] = parts;

  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return 'Invalid email username length';
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Email username cannot start or end with a dot';
  }

  if (localPart.includes('..')) {
    return 'Email username cannot have consecutive dots';
  }

  // Domain part validation
  if (domainPart.length === 0 || domainPart.length > 253) {
    return 'Invalid domain length';
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return 'Domain cannot start or end with a dot';
  }

  if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return 'Domain cannot start or end with a hyphen';
  }

  // Check for valid TLD
  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return 'Invalid top-level domain';
  }

  // Check against disposable email domains
  if (DISPOSABLE_DOMAINS.includes(domainPart)) {
    return 'Disposable email addresses are not allowed';
  }

  // Additional security checks
  if (localPart.includes('+') && localPart.split('+').length > 2) {
    return 'Invalid email format with multiple + symbols';
  }

  return null;
}

/**
 * Suggests corrections for common email typos
 * @param email - The email address to check
 * @returns Suggested correction or null
 */
export function suggestEmailCorrection(email: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  const parts = trimmedEmail.split('@');
  
  if (parts.length !== 2) return null;
  
  const [localPart, domainPart] = parts;
  
  // Common typos mapping
  const typoCorrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
  };
  
  const correctedDomain = typoCorrections[domainPart];
  if (correctedDomain) {
    return `${localPart}@${correctedDomain}`;
  }
  
  return null;
}

/**
 * Formats an email address to lowercase and trims whitespace
 * @param email - The email address to format
 * @returns Formatted email address
 */
export function formatEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Checks if an email domain is from a common provider
 * @param email - The email address to check
 * @returns True if from a common provider
 */
export function isCommonEmailProvider(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return COMMON_DOMAINS.includes(domain);
}

/**
 * Gets the email provider name from an email address
 * @param email - The email address
 * @returns Provider name or 'Other'
 */
export function getEmailProvider(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase();
  
  const providers: Record<string, string> = {
    'gmail.com': 'Gmail',
    'yahoo.com': 'Yahoo',
    'hotmail.com': 'Hotmail',
    'outlook.com': 'Outlook',
    'icloud.com': 'iCloud',
    'aol.com': 'AOL',
    'protonmail.com': 'ProtonMail',
    'zoho.com': 'Zoho',
  };
  
  return providers[domain] || 'Other';
}

/**
 * Validates a full name
 * @param fullName - The full name to validate
 * @returns Error message or null if valid
 */
export function validateFullName(fullName: string): string | null {
  if (!fullName || !fullName.trim()) {
    return 'Full name is required';
  }
  
  const trimmed = fullName.trim();
  
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters';
  }
  
  if (trimmed.length > 100) {
    return 'Full name must be less than 100 characters';
  }
  
  // Check for at least one space (first and last name)
  if (!trimmed.includes(' ')) {
    return 'Please enter both first and last name';
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
}

/**
 * Validates a password
 * @param password - The password to validate
 * @returns Error message or null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  
  return null;
}

/**
 * Validates password confirmation
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns Error message or null if valid
 */
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
}

/**
 * Validates terms acceptance
 * @param accepted - Whether terms were accepted
 * @returns Error message or null if valid
 */
export function validateTerms(accepted: boolean): string | null {
  if (!accepted) {
    return 'You must accept the terms and conditions';
  }
  
  return null;
}
