const nodemailer = require('nodemailer');

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 587;

const createTransport = ({ user, pass }) => {
  if (!user || !pass) {
    throw new Error('Gmail address and app password are required');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user, pass },
  });
};

const getConfiguredSmtp = (business) => ({
  user: business.smtpUser || process.env.EMAIL_SMTP_USER,
  pass: business.smtpPass || process.env.EMAIL_SMTP_PASS,
  from: business.emailFromAddress || process.env.EMAIL_FROM_ADDRESS || business.smtpUser || process.env.EMAIL_SMTP_USER,
});

const renderReviewEmail = ({ businessName, message, reviewLink }) => {
  const escapedMessage = String(message || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a">${businessName}</h2>
      <p style="margin:0 0 20px;font-size:15px">${escapedMessage}</p>
      <a href="${reviewLink}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">
        Leave a review
      </a>
    </div>
  `;
};

const sendReviewRequestEmail = async ({ business, customer, message, reviewLink }) => {
  const smtp = getConfiguredSmtp(business);
  const transporter = createTransport(smtp);

  await transporter.sendMail({
    from: `"${business.businessName}" <${smtp.from}>`,
    to: customer.email,
    subject: `How was your experience with ${business.businessName}?`,
    text: `${message}\n\n${reviewLink}`,
    html: renderReviewEmail({ businessName: business.businessName, message, reviewLink }),
  });
};

const sendTestEmail = async ({ business, to }) => {
  const smtp = getConfiguredSmtp(business);
  const transporter = createTransport(smtp);

  await transporter.sendMail({
    from: `"${business.businessName}" <${smtp.from}>`,
    to,
    subject: 'ReviewNest test email',
    text: 'Your Gmail SMTP settings are working.',
    html: '<p>Your Gmail SMTP settings are working.</p>',
  });
};

module.exports = { sendReviewRequestEmail, sendTestEmail };
