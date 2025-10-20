import { supabase } from "./config/supabaseClient.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Test Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  console.log("Testing upload functionality...");
  
  // Test environment variables
  console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing");
  console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing");
  console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing");
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);
    console.log("Supabase connection:", error ? "❌ Failed" : "✅ Working");
    if (error) console.error("Supabase error:", error);
  } catch (err) {
    console.error("Supabase test failed:", err);
  }
  
  // Test Cloudinary connection
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connection:", "✅ Working");
  } catch (err) {
    console.error("Cloudinary test failed:", err);
  }
}

testUpload();