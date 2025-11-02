import { supabase } from "../config/supabaseClient.js";

// Create COD Order
export const createCodOrder = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      user_name,
      product_name,
      product_total_price,
      user_address,
      user_location,
      quantity = 1
    } = req.body;

    // Validate required fields
    if (!user_id || !product_id || !user_name || !product_name || !product_total_price || !user_address) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // Check if total price is >= 1000
    if (product_total_price < 1000) {
      return res.status(400).json({
        success: false,
        error: "COD is only available for orders above ₹1000"
      });
    }

    const { data, error } = await supabase
      .from("cod_orders")
      .insert([{
        user_id,
        product_id,
        user_name,
        product_name,
        product_total_price,
        user_address,
        user_location,
        quantity
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      cod_order: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all COD orders (Admin)
export const getAllCodOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("cod_orders")
      .select(`
        *,
        users(name, email, phone),
        products(name, image)
      `, { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      cod_orders: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update COD order status
export const updateCodOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from("cod_orders")
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      message: "COD order status updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's COD orders
export const getUserCodOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("cod_orders")
      .select(`
        *,
        products(name, image)
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      cod_orders: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};