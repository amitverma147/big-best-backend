import express from "express";
const router = express.Router();
import {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  getSingleWarehouse,
  getWarehouseProducts,
  addProductToWarehouse,
  updateWarehouseProduct,
  removeProductFromWarehouse,
  getWarehouseHierarchy,
  getChildWarehouses,
} from "../controller/warehouseController.js";

// RESTful warehouse routes
router.get("/", getAllWarehouses);
router.post("/", createWarehouse);
router.get("/hierarchy", getWarehouseHierarchy);
router.get("/:id", getSingleWarehouse);
router.get("/:id/children", getChildWarehouses);
router.get("/:id/products", getWarehouseProducts);
router.post("/:id/products", addProductToWarehouse);
router.put("/:id/products/:productId", updateWarehouseProduct);
router.delete("/:id/products/:productId", removeProductFromWarehouse);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;
