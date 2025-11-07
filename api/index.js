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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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

// Enhanced CORS configuration for Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any localhost for development
    if (origin.includes("localhost")) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  exposedHeaders: ["Authorization"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-File-Name",
  ],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));
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
app.use("/api/zones", zoneRoutes);

// Test route for zones
app.get("/api/test-zones", (req, res) => {
  res.status(200).json({
    message: "Zones endpoint is working",
    timestamp: new Date().toISOString(),
  });
});

// Test route for warehouses
app.get("/api/test-warehouses", (req, res) => {
  res.status(200).json({
    message: "Warehouses endpoint is working",
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
    endpoints: {
      warehouses: "/api/warehouse or /api/warehouses",
      zones: "/api/zones",
      cart: "/api/cart",
      products: "/api/productsroute",
      health: "/api/health",
      test_zones: "/api/test-zones",
      test_warehouses: "/api/test-warehouses",
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
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    requested_path: req.originalUrl,
    available_endpoints: [
      "/api/warehouse",
      "/api/warehouses",
      "/api/stock",
      "/api/cart",
      "/api/productsroute",
      "/api/location-search",
      "/api/health",
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
