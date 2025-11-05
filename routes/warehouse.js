const express = require("express");
const router = express.Router();
const {
  getWarehouses,
  createWarehouse,
  updateProductStock,
} = require("../controller/warehouseController");

const {
  assignProductToWarehouses,
  checkProductDeliveryWithWarehouse,
} = require("../controller/productController");

const {
  validateCartDelivery,
  reserveCartStock,
  confirmCartStockDeduction,
} = require("../controller/cartController");

// Warehouse management routes
router.get("/", getWarehouses);
router.post("/", createWarehouse);
router.put("/stock", updateProductStock);

// Product-warehouse assignment routes
router.post("/products/:product_id/assign", assignProductToWarehouses);
router.post("/products/check-delivery", checkProductDeliveryWithWarehouse);

// Cart and checkout warehouse validation routes
router.post("/cart/validate-delivery", validateCartDelivery);
router.post("/cart/reserve-stock", reserveCartStock);
router.post("/cart/confirm-deduction", confirmCartStockDeduction);

module.exports = router;
