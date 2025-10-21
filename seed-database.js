import { supabase } from "./config/supabaseClient.js";

const sampleCategories = [
  {
    name: "Fruits & Vegetables",
    description: "Fresh fruits and vegetables",
    image_url: "/categories/fruits-vegetables.jpg",
    featured: true,
  },
  {
    name: "Dairy & Bakery",
    description: "Milk, bread and bakery items",
    image_url: "/categories/dairy-bakery.jpg",
    featured: true,
  },
  {
    name: "Staples",
    description: "Rice, wheat and cooking essentials",
    image_url: "/categories/staples.jpg",
    featured: true,
  },
  {
    name: "Beverages",
    description: "Drinks and beverages",
    image_url: "/categories/beverages.jpg",
    featured: true,
  },
  {
    name: "Snacks & Foods",
    description: "Snacks and packaged foods",
    image_url: "/categories/snacks.jpg",
    featured: false,
  },
  {
    name: "Beauty & Hygiene",
    description: "Personal care products",
    image_url: "/categories/beauty.jpg",
    featured: false,
  },
  {
    name: "Cleaning & Household",
    description: "Cleaning supplies and household items",
    image_url: "/categories/cleaning.jpg",
    featured: false,
  },
  {
    name: "Meat & Seafood",
    description: "Fresh meat and seafood",
    image_url: "/categories/meat.jpg",
    featured: false,
  },
];

const sampleProducts = [
  {
    name: "Fresh Bananas",
    description: "Premium quality bananas from Kerala",
    category: "Fruits & Vegetables",
    price: 45.0,
    old_price: 55.0,
    rating: 4.5,
    review_count: 120,
    discount: 18,
    image: "/prod2.png",
    uom: "1kg",
    brand_name: "Fresh Farm",
    in_stock: true,
    featured: true,
    popular: true,
  },
  {
    name: "Amul Fresh Milk",
    description: "Fresh toned milk from Amul",
    category: "Dairy & Bakery",
    price: 28.0,
    old_price: 32.0,
    rating: 4.8,
    review_count: 250,
    discount: 12,
    image: "/prod1.png",
    uom: "500ml",
    brand_name: "Amul",
    in_stock: true,
    featured: true,
    popular: true,
  },
  {
    name: "Basmati Rice",
    description: "Premium aged basmati rice",
    category: "Staples",
    price: 180.0,
    old_price: 200.0,
    rating: 4.6,
    review_count: 89,
    discount: 10,
    image: "/prod3.png",
    uom: "1kg Premium",
    brand_name: "India Gate",
    in_stock: true,
    featured: true,
    popular: false,
  },
  {
    name: "Coca Cola",
    description: "Refreshing cola drink",
    category: "Beverages",
    price: 40.0,
    old_price: 45.0,
    rating: 4.2,
    review_count: 156,
    discount: 11,
    image: "/prod4.png",
    uom: "600ml Bottle",
    brand_name: "Coca Cola",
    in_stock: true,
    featured: false,
    popular: true,
  },
  {
    name: "Lays Chips",
    description: "Crispy potato chips",
    category: "Snacks & Foods",
    price: 20.0,
    old_price: 25.0,
    rating: 4.3,
    review_count: 78,
    discount: 20,
    image: "/prod5.png",
    uom: "50g Pack",
    brand_name: "Lays",
    in_stock: true,
    featured: false,
    popular: false,
  },
  {
    name: "Dove Soap",
    description: "Moisturizing beauty soap",
    category: "Beauty & Hygiene",
    price: 45.0,
    old_price: 50.0,
    rating: 4.7,
    review_count: 134,
    discount: 10,
    image: "/prod6.png",
    uom: "100g Bar",
    brand_name: "Dove",
    in_stock: true,
    featured: false,
    popular: true,
  },
  {
    name: "Surf Excel",
    description: "Advanced stain removal detergent",
    category: "Cleaning & Household",
    price: 85.0,
    old_price: 95.0,
    rating: 4.4,
    review_count: 67,
    discount: 11,
    image: "/prod7.png",
    uom: "500g Powder",
    brand_name: "Surf Excel",
    in_stock: true,
    featured: false,
    popular: false,
  },
  {
    name: "Fresh Chicken",
    description: "Farm fresh chicken",
    category: "Meat & Seafood",
    price: 220.0,
    old_price: 250.0,
    rating: 4.6,
    review_count: 45,
    discount: 12,
    image: "/prod8.png",
    uom: "500g Fresh Cut",
    brand_name: "Fresh Mart",
    in_stock: true,
    featured: true,
    popular: false,
  },
  {
    name: "Organic Apples",
    description: "Premium organic apples",
    category: "Fruits & Vegetables",
    price: 120.0,
    old_price: 140.0,
    rating: 4.8,
    review_count: 92,
    discount: 14,
    image: "/prod9.png",
    uom: "1kg Premium",
    brand_name: "Organic Farm",
    in_stock: true,
    featured: true,
    popular: true,
  },
  {
    name: "Britannia Bread",
    description: "Soft white bread",
    category: "Dairy & Bakery",
    price: 25.0,
    old_price: 30.0,
    rating: 4.3,
    review_count: 156,
    discount: 17,
    image: "/prod10.png",
    uom: "400g Loaf",
    brand_name: "Britannia",
    in_stock: true,
    featured: false,
    popular: false,
  },
  {
    name: "Tata Tea Gold",
    description: "Premium blend tea",
    category: "Beverages",
    price: 95.0,
    old_price: 105.0,
    rating: 4.5,
    review_count: 203,
    discount: 10,
    image: "/prod1.png",
    uom: "250g Pack",
    brand_name: "Tata Tea",
    in_stock: true,
    featured: false,
    popular: true,
  },
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if categories already exist
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id");

    if (existingCategories && existingCategories.length > 0) {
      console.log("Categories already exist, skipping category seeding.");
    } else {
      // Insert categories
      console.log("Inserting categories...");
      const { data: categoriesResult, error: categoriesError } = await supabase
        .from("categories")
        .insert(sampleCategories)
        .select();

      if (categoriesError) {
        console.error("Error inserting categories:", categoriesError);
      } else {
        console.log(
          `Successfully inserted ${categoriesResult.length} categories`
        );
      }
    }

    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id");

    if (existingProducts && existingProducts.length > 0) {
      console.log("Products already exist, skipping product seeding.");
    } else {
      // Insert products
      console.log("Inserting products...");
      const { data: productsResult, error: productsError } = await supabase
        .from("products")
        .insert(sampleProducts)
        .select();

      if (productsError) {
        console.error("Error inserting products:", productsError);
      } else {
        console.log(`Successfully inserted ${productsResult.length} products`);
      }
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
