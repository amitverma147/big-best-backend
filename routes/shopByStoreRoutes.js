import express from "express";
import multer from "multer";
import {
  getAllShopByStores,
  getShopByStoreById,
  createShopByStore,
  updateShopByStore,
  deleteShopByStore,
} from "../controller/shopByStoreController.js";

const router = express.Router();
const upload = multer();

// Routes
router.get("/", getAllShopByStores);
router.get("/:id", getShopByStoreById);
router.post("/", upload.single("image_url"), createShopByStore);
router.put("/:id", upload.single("image_url"), updateShopByStore);
router.delete("/:id", deleteShopByStore);

export default router;
