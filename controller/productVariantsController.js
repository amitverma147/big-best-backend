import { supabase } from "../config/supabaseClient.js";

// Get all variants for a product
export const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("active", true)
      .order("variant_price", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      variants: data || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add variant to product
// CRITICAL: This function manages ONLY variant-specific pricing
// It must NEVER update main product prices (price, old_price, discount)
// PRICE ISOLATION: Variant prices are completely independent from main product prices
export const addProductVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      variant_name,
      variant_price,
      variant_old_price,
      variant_discount,
      variant_stock,
      variant_weight,
      variant_unit,
      shipping_amount,
      is_default,
    } = req.body;

    // IMPORTANT: Only insert into product_variants table
    // DO NOT touch the main products table pricing fields
    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        variant_name,
        variant_price: parseFloat(variant_price), // Ensure proper type
        variant_old_price: variant_old_price ? parseFloat(variant_old_price) : null,
        variant_discount: variant_discount ? parseInt(variant_discount) : 0,
        variant_stock: variant_stock ? parseInt(variant_stock) : 0,
        variant_weight,
        variant_unit,
        shipping_amount: shipping_amount ? parseFloat(shipping_amount) : 0,
        is_default: Boolean(is_default),
        active: true
      })
      .select();

    if (error) {
      console.error('Error adding variant:', error);
      return res.status(500).json({ error: error.message });
    }

    // SUCCESS: Variant added without affecting main product pricing
    res.status(201).json({
      success: true,
      variant: data[0],
      message: "Variant added successfully. Main product pricing remains unchanged."
    });
  } catch (error) {
    console.error('Server error in addProductVariant:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update product variant
// CRITICAL: This function updates ONLY variant-specific pricing  
// It must NEVER modify main product prices (price, old_price, discount)
// PRICE ISOLATION: Variant updates are completely independent from main product prices
export const updateProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updateData = req.body;

    // SECURITY: Remove any main product pricing fields if accidentally included
    const sanitizedData = { ...updateData };
    delete sanitizedData.price; // Remove main product price
    delete sanitizedData.old_price; // Remove main product old_price
    delete sanitizedData.discount; // Remove main product discount
    delete sanitizedData.product_id; // Prevent product_id changes
    
    // Ensure proper data types for variant pricing
    if (sanitizedData.variant_price) {
      sanitizedData.variant_price = parseFloat(sanitizedData.variant_price);
    }
    if (sanitizedData.variant_old_price) {
      sanitizedData.variant_old_price = parseFloat(sanitizedData.variant_old_price);
    }
    if (sanitizedData.variant_discount) {
      sanitizedData.variant_discount = parseInt(sanitizedData.variant_discount);
    }
    if (sanitizedData.variant_stock) {
      sanitizedData.variant_stock = parseInt(sanitizedData.variant_stock);
    }

    // IMPORTANT: Only update product_variants table
    const { data, error } = await supabase
      .from("product_variants")
      .update({ 
        ...sanitizedData, 
        updated_at: new Date().toISOString()
      })
      .eq("id", variantId)
      .select();

    if (error) {
      console.error('Error updating variant:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // SUCCESS: Variant updated without affecting main product pricing
    res.status(200).json({
      success: true,
      variant: data[0],
      message: "Variant updated successfully. Main product pricing remains unchanged."
    });
  } catch (error) {
    console.error('Server error in updateProductVariant:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete product variant
export const deleteProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get products with their variants
export const getProductsWithVariants = async (req, res) => {
  try {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          id,
          variant_name,
          variant_price,
          variant_old_price,
          variant_discount,
          variant_stock,
          variant_weight,
          variant_unit,
          shipping_amount,
          is_default,
          active
        )
      `)
      .eq("active", true);

    if (productsError) {
      return res.status(500).json({ error: productsError.message });
    }

    res.status(200).json({
      success: true,
      products: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
