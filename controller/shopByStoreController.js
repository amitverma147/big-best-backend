import { supabase } from "../config/supabaseClient.js";

// Get all shop by stores
const getAllShopByStores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("shop_by_stores")
      .select("*")
      .order("id");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching shop by stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get shop by store by ID
const getShopByStoreById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("shop_by_stores")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Shop by store not found" });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching shop by store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new shop by store
const createShopByStore = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("shop_by_stores")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res.status(400).json({ error: uploadError.message });
      const { data: urlData } = supabase.storage
        .from("shop_by_stores")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("shop_by_stores")
      .insert([{ title, image_url: imageUrl, subtitle }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating shop by store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update shop by store
const updateShopByStore = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, subtitle } = req.body;
    const imageFile = req.file;
    let updateData = { title, subtitle };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("shop_by_stores")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });
      if (uploadError)
        return res.status(400).json({ error: uploadError.message });
      const { data: urlData } = supabase.storage
        .from("shop_by_stores")
        .getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("shop_by_stores")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Shop by store not found" });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error("Error updating shop by store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete shop by store
const deleteShopByStore = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("shop_by_stores")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Shop by store not found" });
      }
      throw error;
    }
    res.json({ message: "Shop by store deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop by store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getAllShopByStores,
  getShopByStoreById,
  createShopByStore,
  updateShopByStore,
  deleteShopByStore,
};
