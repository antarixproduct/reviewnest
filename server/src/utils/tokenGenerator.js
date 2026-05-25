const { customAlphabet } = require('nanoid');

// Plane-ticket style: uppercase letters + numbers, 6 chars
const generateToken = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const createReviewToken = () => `R-${generateToken()}`;

// Generate clean subdomain from business name
const generateSubdomain = (businessName) => {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
};

// Reserved subdomains — block from business registration
const RESERVED = ['www', 'app', 'api', 'mail', 'support', 'dashboard', 'help', 'status'];
const isReserved = (subdomain) => RESERVED.includes(subdomain);

module.exports = { createReviewToken, generateSubdomain, isReserved };
