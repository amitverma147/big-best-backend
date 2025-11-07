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

// Handle preflight requests explicitly
router.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(200).send();
});

export default router;
