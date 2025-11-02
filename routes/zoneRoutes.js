import express from "express";
import multer from "multer";
import {
  uploadZonePincodes,
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  validatePincode,
  downloadSampleCSV,
  getZoneStatistics,
} from "../controller/zoneController.js";

const router = express.Router();

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV files
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

// CSV Operations
router.post("/upload", upload.single("csv_file"), uploadZonePincodes);
router.get("/sample-csv", downloadSampleCSV);

// Zone CRUD Operations
router.get("/statistics", getZoneStatistics);
router.get("/", getAllZones);
router.get("/:id", getZoneById);
router.post("/", createZone);
router.put("/:id", updateZone);
router.delete("/:id", deleteZone);

// Delivery Validation
router.post("/validate-pincode", validatePincode);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large",
        message: "File size should not exceed 10MB",
      });
    }
  }

  if (error.message === "Only CSV files are allowed") {
    return res.status(400).json({
      success: false,
      error: "Invalid file type",
      message: "Only CSV files are allowed",
    });
  }

  next(error);
});

export default router;
