import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getAllCategories,
  getFeaturedProducts,
  getProductsWithFilters,
  getProductById,
  getQuickPicks,
  getProductsBySubcategory,
  getProductsByGroup,
  updateProductDelivery,
  checkProductsDelivery,
  getProductsByDeliveryZone,
} from "../controller/productController.js";

const router = express.Router();

router.get("/allproducts", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/featured", getFeaturedProducts);
router.get("/filter", getProductsWithFilters);
router.get("/quick-picks", getQuickPicks);
router.get("/delivery-zone", getProductsByDeliveryZone);
router.get("/category/:category", getProductsByCategory);
router.get("/subcategory/:subcategoryId", getProductsBySubcategory);
router.get("/group/:groupId", getProductsByGroup);

// Delivery-related routes
router.post("/check-delivery", checkProductsDelivery);
router.put("/:id/delivery", updateProductDelivery);

router.get("/:id", getProductById);

export default router;
