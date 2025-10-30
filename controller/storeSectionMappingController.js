import { supabase } from "../config/supabaseClient.js";

// Get all product sections
export async function getAllProductSections(req, res) {
  try {
    const { data, error } = await supabase
      .from("product_sections")
      .select("*")
      .order("display_order");

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, sections: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Create store-section mapping
export async function createStoreSectionMapping(req, res) {
  try {
    const { store_id, section_ids } = req.body;

    // Create mappings for each section
    const mappings = section_ids.map((section_id) => ({
      store_id: store_id,
      section_id: parseInt(section_id),
      mapping_type: "store_section",
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("store_section_mappings")
      .insert(mappings)
      .select();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, mappings: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Create section-product mapping
export async function createSectionProductMapping(req, res) {
  try {
    const { section_id, product_ids } = req.body;

    // Create mappings for each product
    const mappings = product_ids.map((product_id) => ({
      section_id: parseInt(section_id),
      product_id: product_id,
      mapping_type: "section_product",
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("store_section_mappings")
      .insert(mappings)
      .select();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, mappings: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all mappings with related data
export async function getAllMappings(req, res) {
  try {
    // Get store-section mappings
    const { data: storeSectionData, error: storeSectionError } = await supabase
      .from("store_section_mappings")
      .select(
        `
        *,
        recommended_store:store_id(*),
        product_sections:section_id(*)
      `
      )
      .eq("mapping_type", "store_section");

    if (storeSectionError) {
      console.error("Store section error:", storeSectionError);
    }

    // Get section-product mappings
    const { data: sectionProductData, error: sectionProductError } =
      await supabase
        .from("store_section_mappings")
        .select(
          `
        *,
        product_sections:section_id(*),
        products:product_id(*)
      `
        )
        .eq("mapping_type", "section_product");

    if (sectionProductError) {
      console.error("Section product error:", sectionProductError);
    }

    // Group mappings by type
    const groupedStoreSections = {};
    const groupedSectionProducts = {};

    // Group store-section mappings by store
    (storeSectionData || []).forEach((mapping) => {
      const storeId = mapping.store_id;
      if (!groupedStoreSections[storeId]) {
        groupedStoreSections[storeId] = {
          id: `store_${storeId}`,
          type: "store-section",
          store_id: storeId,
          store_name: mapping.recommended_store?.name || "Unknown Store",
          sections: [],
          is_active: true,
        };
      }
      if (mapping.product_sections) {
        groupedStoreSections[storeId].sections.push(mapping.product_sections);
      }
    });

    // Group section-product mappings by section
    (sectionProductData || []).forEach((mapping) => {
      const sectionId = mapping.section_id;
      if (!groupedSectionProducts[sectionId]) {
        groupedSectionProducts[sectionId] = {
          id: `section_${sectionId}`,
          type: "section-product",
          section_id: sectionId,
          section_name:
            mapping.product_sections?.section_name || "Unknown Section",
          products: [],
          is_active: true,
        };
      }
      if (mapping.products) {
        groupedSectionProducts[sectionId].products.push(mapping.products);
      }
    });

    const allMappings = [
      ...Object.values(groupedStoreSections),
      ...Object.values(groupedSectionProducts),
    ];

    res.json({ success: true, mappings: allMappings });
  } catch (err) {
    console.error("Get all mappings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update mapping status
export async function updateMappingStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data, error } = await supabase
      .from("store_section_mappings")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, mapping: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete mapping
export async function deleteMapping(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("store_section_mappings")
      .delete()
      .eq("id", id);

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Mapping deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get products by section for frontend
export async function getProductsBySection(req, res) {
  try {
    const { section_key } = req.params;

    // Get section info
    const { data: sectionData, error: sectionError } = await supabase
      .from("product_sections")
      .select("*")
      .eq("section_key", section_key)
      .eq("is_active", true)
      .single();

    if (sectionError || !sectionData) {
      return res
        .status(404)
        .json({ success: false, error: "Section not found" });
    }

    // Get products mapped to this section
    const { data: mappingsData, error: mappingsError } = await supabase
      .from("store_section_mappings")
      .select(
        `
        products!inner(*)
      `
      )
      .eq("section_id", sectionData.id)
      .eq("mapping_type", "section_product")
      .eq("is_active", true);

    if (mappingsError) {
      console.error("Mappings error:", mappingsError);
      return res
        .status(400)
        .json({ success: false, error: mappingsError.message });
    }

    const products = (mappingsData || []).map((mapping) => mapping.products);

    res.json({
      success: true,
      section: sectionData,
      products,
    });
  } catch (err) {
    console.error("Get products by section error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
