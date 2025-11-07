import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - try multiple paths for Vercel
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import routes - adjust paths to go up one directory
import authRoutes from "../routes/authRoute.js";
import geoAddressRoute from "../routes/geoAddressRoute.js";
import warehouseRoute from "../routes/warehouseRoute.js";
import productWarehouseRoute from "../routes/productWarehouseRoutes.js";
import productsRoute from "../routes/productRoutes.js";
import locationRoute from "../routes/locationRoutes.js";
import locationSearchRoute from "../routes/locationRoute.js";
import stockRoutes from "../routes/stockRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import orderItemsRoutes from "../routes/orderItemsRoutes.js";
import checkCartAvailabilityRoute from "../routes/checkCartAvailabilityRoute.js";
import paymentRoutes from "../routes/paymentRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import bnbRoutes from "../routes/b&bRoutes.js";
import bnbGroupRoutes from "../routes/b&bGroupRoutes.js";
import bnbGroupProductRoutes from "../routes/b&bGroupProductRoutes.js";
import bbmDostRoutes from "../routes/bbmDostRoutes.js";
import brandRoutes from "../routes/brandRoutes.js";
import brandProductsRoutes from "../routes/brandProducts.js";
import recommendedStoreRoutes from "../routes/recommendedStoreRoutes.js";
import productRecommendedStoreRoutes from "../routes/productRecommendedStoreRoutes.js";
import quickPickRoutes from "../routes/quickPickRoutes.js";
import quickPickGroupRoutes from "../routes/quickPickGroupRoutes.js";
import quickPickGroupProductRoutes from "../routes/quickPickGroupProductRoutes.js";
import savingZoneRoutes from "../routes/savingZoneRoutes.js";
import savingZoneGroupRoutes from "../routes/savingZoneGroupRoutes.js";
import savingZoneGroupProductRoutes from "../routes/savingZoneGroupProductRoutes.js";
import storeRoutes from "../routes/storeRoute.js";
import subStoreRoutes from "../routes/subStoreRoute.js";
import YouMayLikeProductRoutes from "../routes/youMayLikeRoutes.js";
import addBannerRoutes from "../routes/addBannerRoutes.js";
import addBannerGroupRoutes from "../routes/addBannerGroupRoutes.js";
import addBannerGroupProductRoutes from "../routes/addBannerGroupProductRoutes.js";
import uniqueSectionRoutes from "../routes/uniqueSectionRoutes.js";
import uniqueSectionProductRoutes from "../routes/uniqueSectionProductRoutes.js";
import profileRoutes from "../routes/profileRoutes.js";
import returnOrderRoutes from "../routes/returnOrderRoutes.js";
import walletRoutes from "../routes/walletRoutes.js";
import refundRoutes from "../routes/refundRoutes.js";
import debugRoutes from "../routes/debugRoutes.js";
import dailyDealsRoutes from "../routes/dailyDealsRoutes.js";
import dailyDealsProductRoutes from "../routes/dailyDealsProductRoutes.js";
import quickFixRoutes from "../routes/quickFixRoutes.js";
import trackingRoutes from "../routes/trackingRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import bulkOrderRoutes from "../routes/bulkOrderRoutes.js";
import bulkProductRoutes from "../routes/bulkProductRoutes.js";
import productVariantsRoutes from "../routes/productVariantsRoutes.js";
import variantRoutes from "../routes/variantRoutes.js";
import inventoryRoutes from "../routes/inventoryRoutes.js";
import shopByStoreRoutes from "../routes/shopByStoreRoutes.js";
import videoCardRoutes from "../routes/videoCardRoutes.js";
import productSectionRoutes from "../routes/productSectionRoutes.js";
import promoBannerRoutes from "../routes/promoBannerRoutes.js";
import storeSectionMappingRoutes from "../routes/storeSectionMappingRoutes.js";
import bulkWholesaleRoutes from "../routes/bulkWholesaleRoutes.js";
import codOrderRoutes from "../routes/codOrderRoutes.js";
import zoneRoutes from "../routes/zoneRoutes.js";

const app = express();

// Add debugging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || "no-origin";
  console.log(`${timestamp} - ${req.method} ${req.path} from ${origin}`);
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://big-best-admin.vercel.app",
  "https://ecommerce-umber-five-95.vercel.app",
  "https://admin-eight-flax.vercel.app",
  "https://ecommerce-six-brown-12.vercel.app",
  "https://www.bigbestmart.com",
  "https://admin-eight-ruddy.vercel.app",
  "https://big-best-frontend.vercel.app",
];

// Enhanced CORS configuration for testing - Allow all origins temporarily
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(
    `CORS Check: Origin = ${origin}, Method = ${req.method}, Path = ${req.path}`
  );

  // Check if origin is in allowed list
  const isAllowed = !origin || allowedOrigins.includes(origin);

  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
  } else {
    // For testing, allow all
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "false");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name"
  );
  res.header("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return res.status(200).end();
  }

  next();
});

// Backup CORS middleware with permissive settings
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    credentials: false, // Set to false when allowing all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);
app.use(express.json());
app.use(cookieParser());

// Mount all routes
app.use("/api/business", authRoutes);
app.use("/api/geo-address", geoAddressRoute);
app.use("/api/warehouse", warehouseRoute);
app.use("/api/warehouses", warehouseRoute); // Add alias for plural form
app.use("/api/productwarehouse", productWarehouseRoute);
app.use("/api/productsroute", productsRoute);
app.use("/api/locationsroute", locationRoute);
app.use("/api/location-search", locationSearchRoute);
app.use("/api/stock", stockRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderItems", orderItemsRoutes);
app.use("/api/check", checkCartAvailabilityRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bnb", bnbRoutes);
app.use("/api/b&b-group", bnbGroupRoutes);
app.use("/api/b&b-group-product", bnbGroupProductRoutes);
app.use("/api/bbm-dost", bbmDostRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product-brand", brandProductsRoutes);
app.use("/api/recommended-stores", recommendedStoreRoutes);
app.use("/api/product-recommended-stores", productRecommendedStoreRoutes);
app.use("/api/quick-pick", quickPickRoutes);
app.use("/api/quick-pick-group", quickPickGroupRoutes);
app.use("/api/quick-pick-group-product", quickPickGroupProductRoutes);
app.use("/api/saving-zone", savingZoneRoutes);
app.use("/api/saving-zone-group", savingZoneGroupRoutes);
app.use("/api/saving-zone-group-product", savingZoneGroupProductRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/sub-stores", subStoreRoutes);
app.use("/api/you-may-like-products", YouMayLikeProductRoutes);
app.use("/api/banner", addBannerRoutes);
app.use("/api/banner-groups", addBannerGroupRoutes);
app.use("/api/banner-group-products", addBannerGroupProductRoutes);
app.use("/api/unique-sections", uniqueSectionRoutes);
app.use("/api/unique-sections-products", uniqueSectionProductRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/return-orders", returnOrderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/daily-deals", dailyDealsRoutes);
app.use("/api/daily-deals-product", dailyDealsProductRoutes);
app.use("/api/quick", quickFixRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bulk-orders", bulkOrderRoutes);
app.use("/api/bulk-products", bulkProductRoutes);
app.use("/api/product-variants", productVariantsRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/shop-by-stores", shopByStoreRoutes);
app.use("/api/video-cards", videoCardRoutes);
app.use("/api/product-sections", productSectionRoutes);
app.use("/api/promo-banner", promoBannerRoutes);
app.use("/api/store-section-mappings", storeSectionMappingRoutes);
app.use("/api/bulk-wholesale", bulkWholesaleRoutes);
app.use("/api/cod-orders", codOrderRoutes);
// Zone routes with enhanced error handling
try {
  app.use("/api/zones", zoneRoutes);
  console.log("✅ Zone routes mounted successfully");
} catch (error) {
  console.error("❌ Error mounting zone routes:", error);
}

// Enhanced fallback route for zones with better error handling
app.get("/api/zones", async (req, res) => {
  console.log("Zones endpoint called - fallback route");
  try {
    // Set CORS headers explicitly
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    const { getAllZones } = await import("../controller/zoneController.js");
    console.log("Zone controller imported successfully");
    await getAllZones(req, res);
  } catch (error) {
    console.error("Zone route fallback error:", error);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(500).json({
      success: false,
      error: "Zone route fallback failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Warehouse routes with enhanced error handling
try {
  console.log("✅ Warehouse routes mounted successfully");
} catch (error) {
  console.error("❌ Error mounting warehouse routes:", error);
}

// Enhanced fallback route for warehouses with better error handling
app.get("/api/warehouses", async (req, res) => {
  console.log("Warehouses endpoint called - fallback route");
  try {
    // Set CORS headers explicitly
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    const { getAllWarehouses } = await import(
      "../controller/warehouseController.js"
    );
    console.log("Warehouse controller imported successfully");
    await getAllWarehouses(req, res);
  } catch (error) {
    console.error("Warehouse route fallback error:", error);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(500).json({
      success: false,
      error: "Warehouse route fallback failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Direct zone routes as backup
app.get("/api/zones-direct", async (req, res) => {
  try {
    console.log("Direct zones route called");
    const { getAllZones } = await import("../controller/zoneController.js");
    await getAllZones(req, res);
  } catch (error) {
    console.error("Direct zones route error:", error);
    res.status(500).json({
      error: "Direct zones route failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Direct warehouse routes as backup
app.get("/api/warehouses-direct", async (req, res) => {
  try {
    console.log("Direct warehouses route called");
    const { getAllWarehouses } = await import(
      "../controller/warehouseController.js"
    );
    await getAllWarehouses(req, res);
  } catch (error) {
    console.error("Direct warehouses route error:", error);
    res.status(500).json({
      error: "Direct warehouses route failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Test route for zones
app.get("/api/test-zones", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    message: "Zones endpoint is working",
    timestamp: new Date().toISOString(),
  });
});

// Test route for warehouses
app.get("/api/test-warehouses", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    message: "Warehouses endpoint is working",
    timestamp: new Date().toISOString(),
  });
});

// Simple zones test without database
app.get("/api/zones-simple", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    success: true,
    data: [
      { id: 1, name: "Test Zone 1", state: "Test State 1", is_active: true },
      { id: 2, name: "Test Zone 2", state: "Test State 2", is_active: true },
    ],
    message: "Simple test zones without database access",
    timestamp: new Date().toISOString(),
  });
});

// Simple warehouses test without database
app.get("/api/warehouses-simple", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    success: true,
    data: [
      { id: 1, name: "Test Warehouse 1", type: "main", is_active: true },
      { id: 2, name: "Test Warehouse 2", type: "secondary", is_active: true },
    ],
    message: "Simple test warehouses without database access",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    environment: {
      node_version: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
      env_loaded: !!process.env.SUPABASE_URL,
    },
  });
});

// API documentation route
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "BBM Backend API",
    version: "1.0.0",
    cors_enabled: true,
    deployed_on: "Vercel",
    endpoints: {
      warehouses: "/api/warehouse or /api/warehouses",
      warehouses_direct: "/api/warehouses-direct (fallback)",
      zones: "/api/zones",
      zones_direct: "/api/zones-direct (fallback)",
      cart: "/api/cart",
      products: "/api/productsroute",
      health: "/api/health",
      test_zones: "/api/test-zones",
      test_warehouses: "/api/test-warehouses",
    },
    debugging: {
      cors_origins_allowed: "localhost, vercel.app domains, specific origins",
      request_logging: "enabled",
      error_handling: "enhanced",
    },
  });
});

// Debug route for warehouse testing
app.get("/api/test-warehouse", async (req, res) => {
  try {
    // Import warehouse controller function
    const { getAllWarehouses } = await import(
      "../controller/warehouseController.js"
    );

    res.status(200).json({
      status: "OK",
      message: "Warehouse controller imported successfully",
      controller_available: typeof getAllWarehouses === "function",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Failed to import warehouse controller",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Import validation route - tests all critical imports
app.get("/api/test-imports", async (req, res) => {
  const importTests = [];

  try {
    // Test all critical controller imports
    const controllers = [
      "../controller/warehouseController.js",
      "../controller/productController.js",
      "../controller/cartController.js",
      "../controller/stockController.js",
      "../controller/deliveryValidationService.js",
    ];

    for (const controller of controllers) {
      try {
        await import(controller);
        importTests.push({ controller, status: "OK" });
      } catch (error) {
        importTests.push({
          controller,
          status: "ERROR",
          error: error.message,
        });
      }
    }

    const allPassed = importTests.every((test) => test.status === "OK");

    res.status(allPassed ? 200 : 500).json({
      status: allPassed ? "OK" : "ERRORS_FOUND",
      message: `${importTests.filter((t) => t.status === "OK").length}/${
        importTests.length
      } imports successful`,
      tests: importTests,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "CRITICAL_ERROR",
      error: error.message,
      stack: error.stack,
    });
  }
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    requested_path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      "/api/warehouse",
      "/api/warehouses",
      "/api/warehouses-direct",
      "/api/zones",
      "/api/zones-direct",
      "/api/stock",
      "/api/cart",
      "/api/productsroute",
      "/api/location-search",
      "/api/health",
      "/api/test-zones",
      "/api/test-warehouses",
      "/api/test-imports",
      "/api/test-warehouse",
    ],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

// Export for Vercel serverless
export default app;
