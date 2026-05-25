export const EMAIL_PATTERN = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$';

const emailRegex = new RegExp(EMAIL_PATTERN);

export const isValidEmail = (email: string) => emailRegex.test(email.trim());
