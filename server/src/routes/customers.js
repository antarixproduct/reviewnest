const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCustomers,
  addCustomer,
  addBulkCustomers,
  updateCustomer,
  deleteCustomer,
  toggleOptOut,
} = require('../controllers/customerController');

// All routes protected
router.use(protect);

router.get('/', getCustomers);
router.post('/', addCustomer);
router.post('/bulk', addBulkCustomers);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.patch('/:id/optout', toggleOptOut);

module.exports = router;
