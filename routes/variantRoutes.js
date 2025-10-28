const express = require('express');
const router = express.Router();
const {
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant
} = require('../controller/variantController');

// Get product variants
router.get('/product/:productId', getProductVariants);

// Add product variant (Admin)
router.post('/add', addProductVariant);

// Update product variant (Admin)
router.put('/update/:id', updateProductVariant);

// Delete product variant (Admin)
router.delete('/delete/:id', deleteProductVariant);

module.exports = router;