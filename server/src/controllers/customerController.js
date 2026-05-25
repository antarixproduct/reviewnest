const Customer = require('../models/Customer');
const Business = require('../models/Business');
const ReviewRequest = require('../models/ReviewRequest');
const { createReviewToken } = require('../utils/tokenGenerator');
const { sendReviewRequestEmail } = require('../utils/email');

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

const getReviewPageBaseUrl = (req) => (
  process.env.PUBLIC_REVIEW_URL ||
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173') ||
  `${req.protocol}://${req.get('host')}`
).replace(/\/$/, '');

const buildMessage = ({ business, customer, trackingUrl }) => (
  business.msgTemplate
    .replaceAll('{{name}}', customer.name)
    .replaceAll('{{business_name}}', business.businessName)
    .replaceAll('{{link}}', trackingUrl)
);

const createEmailReviewRequest = async ({ req, business, customer }) => {
  if (!business.emailAutomationEnabled || !customer.email) return null;

  const token = createReviewToken();
  const trackingUrl = `${getReviewPageBaseUrl(req)}/r/${token}`;
  const message = buildMessage({ business, customer, trackingUrl });

  const reviewRequest = await ReviewRequest.create({
    token,
    businessId: business._id,
    customerId: customer._id,
    whatsappMessage: message,
    emailMessage: message,
    sentAt: new Date(),
  });

  await sendReviewRequestEmail({ business, customer, message, reviewLink: trackingUrl });
  reviewRequest.emailSentAt = new Date();
  await reviewRequest.save();
  await Customer.findByIdAndUpdate(customer._id, { $inc: { totalRequests: 1 } });
  return reviewRequest;
};

const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = { businessId: req.business.id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
};

const addCustomer = async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit WhatsApp number' });
    }

    const existing = await Customer.findOne({ businessId: req.business.id, phone: normalizedPhone });
    if (existing) {
      return res.status(400).json({ message: 'A customer with this phone number already exists' });
    }

    const customer = await Customer.create({
      businessId: req.business.id,
      name: name.trim(),
      phone: normalizedPhone,
      email: email?.trim().toLowerCase() || '',
      notes: notes || '',
    });

    const business = await Business.findById(req.business.id).select('+smtpPass');
    let emailStatus = 'not_sent';
    if (business?.emailAutomationEnabled && customer.email) {
      try {
        await createEmailReviewRequest({ req, business, customer });
        emailStatus = 'sent';
      } catch (emailError) {
        emailStatus = 'failed';
        console.error('Automatic review email failed:', emailError.message);
      }
    }

    res.status(201).json({ message: 'Customer added successfully', customer, emailStatus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add customer', error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.business.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (name) customer.name = name.trim();
    if (phone) customer.phone = normalizePhone(phone);
    if (email !== undefined) customer.email = email.trim().toLowerCase();
    if (notes !== undefined) customer.notes = notes;

    await customer.save();

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer', error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, businessId: req.business.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete customer', error: error.message });
  }
};

const toggleOptOut = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.business.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.isOptedOut = !customer.isOptedOut;
    await customer.save();

    res.json({
      message: `Customer ${customer.isOptedOut ? 'opted out' : 'opted back in'} successfully`,
      isOptedOut: customer.isOptedOut,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update opt-out status', error: error.message });
  }
};

const addBulkCustomers = async (req, res) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: 'An array of customers is required' });
    }

    const businessId = req.business.id;
    const business = await Business.findById(businessId).select('+smtpPass');
    const addedCustomers = [];
    const errors = [];
    let emailSentCount = 0;

    for (const [index, cust] of customers.entries()) {
      try {
        const name = cust.name?.toString().trim();
        const phone = normalizePhone(cust.phone);
        const email = cust.email?.toString().trim().toLowerCase() || '';
        const notes = cust.notes?.toString().trim() || '';

        if (!name || !phone) {
          errors.push({ row: index + 2, message: 'Name and phone are required' });
          continue;
        }

        const existing = await Customer.findOne({ businessId, phone });
        if (existing) {
          errors.push({ row: index + 2, message: `Phone ${phone} already exists` });
          continue;
        }

        const newCustomer = await Customer.create({ businessId, name, phone, email, notes });
        addedCustomers.push(newCustomer);

        if (business?.emailAutomationEnabled && newCustomer.email) {
          try {
            await createEmailReviewRequest({ req, business, customer: newCustomer });
            emailSentCount += 1;
          } catch (emailError) {
            errors.push({ row: index + 2, message: `Customer added, but email failed: ${emailError.message}` });
          }
        }
      } catch (err) {
        errors.push({ row: index + 2, message: err.message });
      }
    }

    res.status(201).json({
      message: `Successfully added ${addedCustomers.length} customers.`,
      addedCount: addedCustomers.length,
      emailSentCount,
      errors,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bulk add customers', error: error.message });
  }
};

module.exports = { getCustomers, addCustomer, addBulkCustomers, updateCustomer, deleteCustomer, toggleOptOut };
