import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getAllCategories,
  getFeaturedProducts,
  getProductsWithFilters,
  getProductById,
} from "../controller/productController.js";

const router = express.Router();

router.get("/allproducts", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/featured", getFeaturedProducts);
router.get("/filter", getProductsWithFilters);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

export default router;
