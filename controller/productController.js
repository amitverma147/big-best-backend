import { supabase } from "../config/supabaseClient.js";

export const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Transform the data to match frontend expectations
    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      category: product.category,
      uom: product.uom,
      uom_value: product.uom_value,
      uom_unit: product.uom_unit,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("category", category);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      category: product.category,
      uom: product.uom,
      uom_value: product.uom_value,
      uom_unit: product.uom_unit,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length,
      category: category,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    // First try to get categories from the categories table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true);

    let categories = [];

    // If we have data from categories table, use that
    if (categoriesData && categoriesData.length > 0 && !categoriesError) {
      categories = categoriesData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        image_url: cat.image_url,
        featured: cat.featured,
        icon: cat.icon,
      }));
    } else {
      // Fallback: get unique categories from products table
      const { data: productCategories, error: productError } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null)
        .eq("active", true);

      if (productCategories && !productError) {
        const uniqueProductCategories = [
          ...new Set(productCategories.map((item) => item.category)),
        ].filter(Boolean);

        categories = uniqueProductCategories.map((catName) => ({
          id: null,
          name: catName,
          description: null,
          image_url: null,
          featured: false,
          icon: null,
        }));
      }
    }

    res.status(200).json({
      success: true,
      categories: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Server error in getAllCategories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories!products_category_id_fkey(
          id,
          name,
          description,
          image_url
        )
      `
      )
      .eq("active", true)
      .eq("featured", true)
      .limit(20);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      category: product.category,
      category_info: product.categories,
      uom: product.uom,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get products with pagination and filters
export const getProductsWithFilters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      featured,
      popular,
      most_orders,
      top_sale,
      search,
    } = req.query;

    let query = supabase
      .from("products")
      .select(
        `
        *,
        categories!products_category_id_fkey(
          id,
          name,
          description,
          image_url
        )
      `,
        { count: "exact" }
      )
      .eq("active", true);

    // Apply filters
    if (category) {
      query = query.or(
        `category.eq.${category},categories.name.eq.${category}`
      );
    }

    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    if (popular === "true") {
      query = query.eq("popular", true);
    }

    if (most_orders === "true") {
      query = query.eq("most_orders", true);
    }

    if (top_sale === "true") {
      query = query.eq("top_sale", true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      category: product.category,
      category_info: product.categories,
      uom: product.uom,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Transform the data to match frontend expectations
    const transformedProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      old_price: data.old_price,
      rating: data.rating || 4.0,
      review_count: data.review_count || 0,
      discount: data.discount || 0,
      image: data.image,
      images: data.images,
      video: data.video,
      in_stock: data.in_stock,
      popular: data.popular,
      featured: data.featured,
      category: data.category,
      uom: data.uom,
      uom_value: data.uom_value,
      uom_unit: data.uom_unit,
      brand_name: data.brand_name,
      shipping_amount: data.shipping_amount || 0,
      specifications: data.specifications,
      created_at: data.created_at,
    };

    res.status(200).json({
      success: true,
      product: transformedProduct,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Quick Picks - products that are popular, most_orders, or top_sale
export const getQuickPicks = async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    // First, get top selling products based on order_items quantity
    const { data: orderItems, error: orderError } = await supabase
      .from("order_items")
      .select("product_id, quantity");

    let topSellingProductIds = [];

    if (!orderError && orderItems) {
      // Aggregate quantities by product_id
      const salesMap = {};
      orderItems.forEach((item) => {
        if (item.product_id && item.quantity) {
          salesMap[item.product_id] =
            (salesMap[item.product_id] || 0) + item.quantity;
        }
      });

      // Sort by total quantity sold (descending)
      topSellingProductIds = Object.entries(salesMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, parseInt(limit))
        .map(([productId]) => productId);
    }

    let products = [];

    if (topSellingProductIds.length > 0) {
      // Get product details for top selling products
      const { data: productDetails, error: detailsError } = await supabase
        .from("products")
        .select("*")
        .in("id", topSellingProductIds)
        .eq("active", true);

      if (!detailsError && productDetails) {
        // Sort products to match the order of top selling
        const productMap = productDetails.reduce((map, product) => {
          map[product.id] = product;
          return map;
        }, {});

        products = topSellingProductIds
          .map((id) => productMap[id])
          .filter((product) => product); // Remove any null products
      }
    }

    // If we don't have enough top selling products, fill with latest products
    if (products.length < parseInt(limit)) {
      const remainingLimit = parseInt(limit) - products.length;
      const excludeIds = products.map((p) => p.id);

      let latestQuery = supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(remainingLimit);

      if (excludeIds.length > 0) {
        latestQuery = latestQuery.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data: latestData, error: latestError } = await latestQuery;

      if (!latestError && latestData) {
        products = [...products, ...latestData];
      }
    }

    console.log("Quick picks data:", products.length, "products found");

    // Transform the data to match frontend expectations
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      most_orders: product.most_orders,
      top_sale: product.top_sale,
      category: product.category,
      category_info: product.categories,
      uom: product.uom,
      uom_value: product.uom_value,
      uom_unit: product.uom_unit,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      specifications: product.specifications,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get products by subcategory
export const getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories!products_category_id_fkey(
          id,
          name,
          description,
          image_url
        )
      `
      )
      .eq("active", true)
      .eq("subcategory_id", subcategoryId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      category: product.category,
      category_info: product.categories,
      subcategory_id: product.subcategory_id,
      group_id: product.group_id,
      uom: product.uom,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length,
      subcategoryId: subcategoryId,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get products by group
export const getProductsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories!products_category_id_fkey(
          id,
          name,
          description,
          image_url
        )
      `
      )
      .eq("active", true)
      .eq("group_id", groupId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const transformedProducts = data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      old_price: product.old_price,
      rating: product.rating || 4.0,
      review_count: product.review_count || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      in_stock: product.in_stock,
      popular: product.popular,
      featured: product.featured,
      category: product.category,
      category_info: product.categories,
      subcategory_id: product.subcategory_id,
      group_id: product.group_id,
      uom: product.uom,
      brand_name: product.brand_name,
      shipping_amount: product.shipping_amount || 0,
      created_at: product.created_at,
    }));

    res.status(200).json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length,
      groupId: groupId,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
