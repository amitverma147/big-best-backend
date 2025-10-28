const express = require('express');
const router = express.Router();
const {
  getProductsByPincode,
  checkProductAvailability,
  updateWarehouseInventory,
  getWarehouseInventory
} = require('../controller/inventoryController');

// Get products available in specific pincode
router.get('/pincode/:pincode/products', getProductsByPincode);

// Check specific product availability in pincode
router.get('/pincode/:pincode/product/:productId/availability', checkProductAvailability);

// Update warehouse inventory (Admin)
router.post('/warehouse/inventory/update', updateWarehouseInventory);

// Get warehouse inventory (Admin)
router.get('/warehouse/:warehouseId/inventory', getWarehouseInventory);

module.exports = router;