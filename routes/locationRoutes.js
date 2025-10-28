const express = require('express');
const router = express.Router();
const {
  getPincodeDetails,
  calculateShipping,
  calculateTax
} = require('../controller/locationController');

// Get pincode details
router.get('/pincode/:pincode', getPincodeDetails);

// Calculate shipping charges
router.post('/shipping/calculate', calculateShipping);

// Calculate tax
router.post('/tax/calculate', calculateTax);

module.exports = router;