import express from "express";
import {
  createCodOrder,
  getAllCodOrders,
  updateCodOrderStatus,
  getUserCodOrders
} from "../controller/codOrderController.js";

const router = express.Router();

// Create COD order
router.post("/create", createCodOrder);

// Get all COD orders (Admin)
router.get("/all", getAllCodOrders);

// Update COD order status
router.put("/status/:id", updateCodOrderStatus);

// Get user's COD orders
router.get("/user/:user_id", getUserCodOrders);

export default router;