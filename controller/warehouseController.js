import { supabase } from "../config/supabaseClient.js";

// Get all warehouses
const getWarehouses = async (req, res) => {
  try {
    const { type, is_active, include_stock_summary } = req.query;

    let query = supabase.from("warehouses").select("*");

    if (type) {
      query = query.eq("type", type);
    }

    if (is_active !== undefined) {
      query = query.eq("is_active", is_active === "true");
    }

    query = query.order("name", { ascending: true });

    const { data: warehouses, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch warehouses",
        details: error.message,
      });
    }

    // Fetch zone information for each warehouse
    const warehousesWithZones = await Promise.all(
      warehouses?.map(async (warehouse) => {
        const { data: warehouseZones, error: zonesError } = await supabase
          .from("warehouse_zones")
          .select(
            `
            zone_id,
            delivery_zones (
              id,
              name,
              zone_pincodes (
                pincode,
                city,
                state
              )
            )
          `
          )
          .eq("warehouse_id", warehouse.id)
          .eq("is_active", true);

        if (zonesError) {
          console.error(
            "Error fetching zones for warehouse",
            warehouse.id,
            zonesError
          );
        }

        const zones =
          warehouseZones
            ?.map((wz) => ({
              ...wz.delivery_zones,
              pincodes: wz.delivery_zones?.zone_pincodes || [],
            }))
            .filter(Boolean) || [];

        return {
          ...warehouse,
          pincode: warehouse.location, // Map location to pincode for frontend compatibility
          zones: zones,
        };
      }) || []
    );

    res.status(200).json({
      success: true,
      data: warehousesWithZones,
      count: warehousesWithZones.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Create new warehouse
const createWarehouse = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      address,
      contact_person,
      contact_phone,
      contact_email,
      zone_ids,
      parent_warehouse_id,
    } = req.body;

    if (!name || !type || !["central", "zonal"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Name and valid type (central/zonal) are required",
      });
    }

    // For zonal warehouses, zone_ids are required
    if (
      type === "zonal" &&
      (!zone_ids || !Array.isArray(zone_ids) || zone_ids.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Zonal warehouses must be mapped to at least one zone",
      });
    }

    // Validate parent warehouse if specified
    if (parent_warehouse_id) {
      const { data: parentWarehouse, error: parentError } = await supabase
        .from("warehouses")
        .select("id, type")
        .eq("id", parent_warehouse_id)
        .single();

      if (parentError || !parentWarehouse) {
        return res.status(400).json({
          success: false,
          error: "Parent warehouse not found",
        });
      }

      // Ensure hierarchy rules: zonal can only be child of central
      if (type === "zonal" && parentWarehouse.type !== "central") {
        return res.status(400).json({
          success: false,
          error: "Zonal warehouses can only be children of central warehouses",
        });
      }
    }

    // Start a transaction-like approach (Supabase doesn't support transactions directly)
    // First, create the warehouse
    const { data: warehouse, error: warehouseError } = await supabase
      .from("warehouses")
      .insert({
        name,
        type,
        location,
        address,
        contact_person,
        contact_phone,
        contact_email,
        parent_warehouse_id,
        hierarchy_level: type === "central" ? 0 : 1,
      })
      .select()
      .single();

    if (warehouseError) {
      return res.status(500).json({
        success: false,
        error: "Failed to create warehouse",
      });
    }

    // If zonal warehouse, create zone mappings
    if (type === "zonal" && zone_ids && zone_ids.length > 0) {
      const zoneMappings = zone_ids.map((zone_id) => ({
        warehouse_id: warehouse.id,
        zone_id: zone_id,
        priority: 1, // Default priority
        is_active: true,
      }));

      const { error: zoneError } = await supabase
        .from("warehouse_zones")
        .insert(zoneMappings);

      if (zoneError) {
        // If zone mapping fails, we should ideally rollback the warehouse creation
        // For now, we'll log the error and continue
        console.error("Failed to create zone mappings:", zoneError);
        return res.status(500).json({
          success: false,
          error: "Warehouse created but failed to map zones",
        });
      }
    }

    res.status(201).json({
      success: true,
      data: warehouse,
      message: "Warehouse created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get products for a specific warehouse
const getWarehouseProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if warehouse exists
    const { data: warehouse, error: warehouseError } = await supabase
      .from("warehouses")
      .select("id, name, type")
      .eq("id", id)
      .single();

    if (warehouseError || !warehouse) {
      return res.status(404).json({
        success: false,
        error: "Warehouse not found",
      });
    }

    // Get products with stock levels for this warehouse
    const { data: warehouseProducts, error } = await supabase
      .from("product_warehouse_stock")
      .select(
        `
        product_id,
        stock_quantity,
        reserved_quantity,
        minimum_threshold,
        cost_per_unit,
        last_restocked_at,
        products (
          id,
          name,
          delivery_type,
          price,
          image
        )
      `
      )
      .eq("warehouse_id", id)
      .eq("is_active", true);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch warehouse products",
        details: error.message,
      });
    }

    // Transform the data to include calculated fields
    const transformedProducts =
      warehouseProducts?.map((item) => ({
        product_id: item.product_id,
        product_name: item.products?.name || "Unknown Product",
        product_price: item.products?.price,
        stock_quantity: item.stock_quantity,
        reserved_quantity: item.reserved_quantity || 0,
        available_quantity: item.stock_quantity - (item.reserved_quantity || 0),
        minimum_threshold: item.minimum_threshold || 0,
        cost_per_unit: item.cost_per_unit,
        last_restocked_at: item.last_restocked_at,
        delivery_type: item.products?.delivery_type,
        image_url: item.products?.image, // Fixed: use 'image' field from products table
        is_low_stock: item.stock_quantity <= (item.minimum_threshold || 0),
      })) || [];

    res.status(200).json({
      success: true,
      data: transformedProducts,
      warehouse: warehouse,
      count: transformedProducts.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update product stock
const updateProductStock = async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity } = req.body;

    if (!product_id || !warehouse_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Product ID, warehouse ID, and quantity are required",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get single warehouse by ID
const getSingleWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: warehouse, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: "Warehouse not found",
      });
    }

    // Fetch zone information for this warehouse
    const { data: warehouseZones, error: zonesError } = await supabase
      .from("warehouse_zones")
      .select(
        `
        zone_id,
        delivery_zones (
          id,
          name,
          zone_pincodes (
            pincode,
            city,
            state
          )
        )
      `
      )
      .eq("warehouse_id", id)
      .eq("is_active", true);

    if (zonesError) {
      console.error("Error fetching zones for warehouse", id, zonesError);
    }

    const zones =
      warehouseZones
        ?.map((wz) => ({
          ...wz.delivery_zones,
          pincodes: wz.delivery_zones?.zone_pincodes || [],
        }))
        .filter(Boolean) || [];

    const warehouseWithZones = {
      ...warehouse,
      pincode: warehouse.location, // Map location to pincode for frontend compatibility
      zones: zones,
    };

    res.status(200).json({
      success: true,
      data: warehouseWithZones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all warehouses (alias for compatibility)
const getAllWarehouses = getWarehouses;

// Update warehouse
const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      pincode,
      address,
      contact_person,
      contact_phone,
      contact_email,
      zone_ids,
      ...otherUpdates
    } = req.body;

    // Validate required fields
    if (!name || !type || !["central", "zonal"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Name and valid type (central/zonal) are required",
      });
    }

    // For zonal warehouses, zone_ids are required
    if (
      type === "zonal" &&
      (!zone_ids || !Array.isArray(zone_ids) || zone_ids.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Zonal warehouses must be mapped to at least one zone",
      });
    }

    // First, update the warehouse basic info
    const warehouseUpdates = {
      name,
      type,
      location: pincode, // Map pincode to location
      address,
      contact_person,
      contact_phone,
      contact_email,
      ...otherUpdates,
      updated_at: new Date().toISOString(),
    };

    const { data: warehouse, error: warehouseError } = await supabase
      .from("warehouses")
      .update(warehouseUpdates)
      .eq("id", id)
      .select()
      .single();

    if (warehouseError) {
      console.error("Warehouse update error:", warehouseError);
      return res.status(400).json({
        success: false,
        error: "Failed to update warehouse",
        details: warehouseError.message,
      });
    }

    // If zonal warehouse, update zone mappings
    if (type === "zonal" && zone_ids && zone_ids.length > 0) {
      // First, remove existing zone mappings
      const { error: deleteError } = await supabase
        .from("warehouse_zones")
        .delete()
        .eq("warehouse_id", id);

      if (deleteError) {
        console.error("Failed to delete existing zone mappings:", deleteError);
        return res.status(500).json({
          success: false,
          error: "Warehouse updated but failed to update zone mappings",
        });
      }

      // Then, create new zone mappings
      const zoneMappings = zone_ids.map((zone_id) => ({
        warehouse_id: parseInt(id),
        zone_id: parseInt(zone_id),
        priority: 1, // Default priority
        is_active: true,
      }));

      const { error: zoneError } = await supabase
        .from("warehouse_zones")
        .insert(zoneMappings);

      if (zoneError) {
        console.error("Failed to create zone mappings:", zoneError);
        return res.status(500).json({
          success: false,
          error: "Warehouse updated but failed to map zones",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: warehouse,
      message: "Warehouse updated successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Delete warehouse
const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if warehouse has any stock records
    const { data: stockRecords, error: stockError } = await supabase
      .from("product_warehouse_stock")
      .select("id")
      .eq("warehouse_id", id)
      .limit(1);

    if (stockError) {
      return res.status(500).json({
        success: false,
        error: "Failed to check warehouse dependencies",
      });
    }

    if (stockRecords && stockRecords.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete warehouse with existing stock records",
      });
    }

    const { error } = await supabase.from("warehouses").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Failed to delete warehouse",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Add product to warehouse
const addProductToWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, stock_quantity, minimum_threshold, cost_per_unit } =
      req.body;

    if (!product_id || !stock_quantity) {
      return res.status(400).json({
        success: false,
        error: "Product ID and stock quantity are required",
      });
    }

    // Check if product already exists in warehouse
    const { data: existingStock, error: checkError } = await supabase
      .from("product_warehouse_stock")
      .select("*")
      .eq("warehouse_id", id)
      .eq("product_id", product_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return res.status(500).json({
        success: false,
        error: "Error checking existing stock",
        details: checkError.message,
      });
    }

    if (existingStock) {
      return res.status(400).json({
        success: false,
        error: "Product already exists in this warehouse",
      });
    }

    const { data, error } = await supabase
      .from("product_warehouse_stock")
      .insert([
        {
          warehouse_id: id,
          product_id,
          stock_quantity,
          reserved_quantity: 0,
          minimum_threshold: minimum_threshold || 10,
          cost_per_unit: cost_per_unit || 0,
          last_restocked_at: new Date().toISOString(),
          is_active: true,
        },
      ])
      .select(
        `
        product_id,
        stock_quantity,
        reserved_quantity,
        minimum_threshold,
        cost_per_unit,
        last_restocked_at,
        products (
          id,
          name,
          delivery_type,
          price,
          image
        )
      `
      )
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Error adding product to warehouse",
        details: error.message,
      });
    }

    const productWithStock = {
      product_id: data.product_id,
      product_name: data.products?.name || "Unknown Product",
      product_price: data.products?.price,
      stock_quantity: data.stock_quantity,
      reserved_quantity: data.reserved_quantity || 0,
      available_quantity: data.stock_quantity - (data.reserved_quantity || 0),
      minimum_threshold: data.minimum_threshold || 0,
      cost_per_unit: data.cost_per_unit,
      last_restocked_at: data.last_restocked_at,
      delivery_type: data.products?.delivery_type,
      image_url: data.products?.image,
      is_low_stock: data.stock_quantity <= (data.minimum_threshold || 0),
    };

    res.status(201).json({
      success: true,
      data: productWithStock,
      message: "Product added to warehouse successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update product stock in warehouse
const updateWarehouseProduct = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const { stock_quantity, minimum_threshold, cost_per_unit } = req.body;

    const { data, error } = await supabase
      .from("product_warehouse_stock")
      .update({
        stock_quantity,
        minimum_threshold,
        cost_per_unit,
        last_restocked_at: new Date().toISOString(),
      })
      .eq("warehouse_id", id)
      .eq("product_id", productId)
      .select(
        `
        product_id,
        stock_quantity,
        reserved_quantity,
        minimum_threshold,
        cost_per_unit,
        last_restocked_at,
        products (
          id,
          name,
          delivery_type,
          price,
          image
        )
      `
      )
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Error updating product stock",
        details: error.message,
      });
    }

    const productWithStock = {
      product_id: data.product_id,
      product_name: data.products?.name || "Unknown Product",
      product_price: data.products?.price,
      stock_quantity: data.stock_quantity,
      reserved_quantity: data.reserved_quantity || 0,
      available_quantity: data.stock_quantity - (data.reserved_quantity || 0),
      minimum_threshold: data.minimum_threshold || 0,
      cost_per_unit: data.cost_per_unit,
      last_restocked_at: data.last_restocked_at,
      delivery_type: data.products?.delivery_type,
      image_url: data.products?.image,
      is_low_stock: data.stock_quantity <= (data.minimum_threshold || 0),
    };

    res.status(200).json({
      success: true,
      data: productWithStock,
      message: "Product stock updated successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Remove product from warehouse
const removeProductFromWarehouse = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const { error } = await supabase
      .from("product_warehouse_stock")
      .delete()
      .eq("warehouse_id", id)
      .eq("product_id", productId);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Error removing product from warehouse",
        details: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from warehouse successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get warehouse hierarchy
const getWarehouseHierarchy = async (req, res) => {
  try {
    const { data: hierarchy, error } = await supabase
      .from("warehouse_hierarchy")
      .select("*")
      .order("hierarchy_level")
      .order("name");

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch warehouse hierarchy",
        details: error.message,
      });
    }

    // Group by hierarchy level for easier frontend handling
    const grouped = hierarchy.reduce((acc, warehouse) => {
      const level = warehouse.hierarchy_level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(warehouse);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: hierarchy,
      grouped: grouped,
      levels: Object.keys(grouped).map((k) => parseInt(k)),
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get child warehouses for a parent
const getChildWarehouses = async (req, res) => {
  try {
    const { parentId } = req.params;

    const { data: children, error } = await supabase.rpc(
      "get_child_warehouses",
      { parent_id: parseInt(parentId) }
    );

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch child warehouses",
        details: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data: children,
      count: children.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export {
  getWarehouses,
  createWarehouse,
  getWarehouseProducts,
  updateProductStock,
  getAllWarehouses,
  getSingleWarehouse,
  updateWarehouse,
  deleteWarehouse,
  addProductToWarehouse,
  updateWarehouseProduct,
  removeProductFromWarehouse,
  getWarehouseHierarchy,
  getChildWarehouses,
};
