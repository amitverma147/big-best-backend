import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPincodeDetails } from "./controller/locationController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route for pincode validation
app.get("/api/location/pincode/:pincode", getPincodeDetails);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Delivery validation API is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Delivery validation API server is running on port ${PORT}`);
  console.log(
    `📍 Test endpoint: http://localhost:${PORT}/api/location/pincode/201016`
  );
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Server shutting down gracefully...");
  process.exit(0);
});

export default app;
