const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const seedProducts = [
  // Breakfast
  { name: "Pancakes", price: 149, category: "breakfast", type: "veg", description: "Fluffy pancakes with butter and syrup", image: "https://via.placeholder.com/200?text=Pancakes", available: true },
  { name: "Poha", price: 40, category: "breakfast", type: "veg", description: "Light and easy breakfast", image: "https://via.placeholder.com/200?text=Poha", available: true },
  { name: "Upma", price: 60, category: "breakfast", type: "veg", description: "Savory semolina breakfast", image: "https://via.placeholder.com/200?text=Upma", available: true },
  { name: "Idli", price: 50, category: "breakfast", type: "veg", description: "Steamed rice cakes with sambar", image: "https://via.placeholder.com/200?text=Idli", available: true },
  
  // Soups
  { name: "Chicken Soup", price: 179, category: "soups", type: "non_veg", description: "Warm and comforting", image: "https://via.placeholder.com/200?text=Chicken+Soup", available: true },
  { name: "Minestrone Soup", price: 159, category: "soups", type: "veg", description: "Vegetable soup with pasta", image: "https://via.placeholder.com/200?text=Minestrone+Soup", available: true },
  { name: "Tom Yum Soup", price: 199, category: "soups", type: "non_veg", description: "Spicy Thai soup", image: "https://via.placeholder.com/200?text=Tom+Yum+Soup", available: true },
  
  // Pizza
  { name: "Margherita Pizza", price: 199, category: "pizza", type: "veg", description: "Classic pizza with cheese", image: "https://via.placeholder.com/200?text=Margherita+Pizza", available: true },
  { name: "Pepperoni Pizza", price: 249, category: "pizza", type: "non_veg", description: "Pizza with pepperoni and cheese", image: "https://via.placeholder.com/200?text=Pepperoni+Pizza", available: true },
  { name: "Veggie Pizza", price: 179, category: "pizza", type: "veg", description: "Loaded with vegetables", image: "https://via.placeholder.com/200?text=Veggie+Pizza", available: true },
  
  // Pasta
  { name: "Spaghetti Carbonara", price: 329, category: "pasta", type: "non_veg", description: "Classic Italian pasta", image: "https://via.placeholder.com/200?text=Spaghetti+Carbonara", available: true },
  { name: "Veg Alfredo Pasta", price: 299, category: "pasta", type: "veg", description: "Creamy pasta with vegetables", image: "https://via.placeholder.com/200?text=Veg+Alfredo+Pasta", available: true },
  { name: "Chicken Alfredo Pasta", price: 349, category: "pasta", type: "non_veg", description: "Creamy pasta with chicken", image: "https://via.placeholder.com/200?text=Chicken+Alfredo+Pasta", available: true },
  { name: "Penne Arrabbiata", price: 279, category: "pasta", type: "veg", description: "Spicy tomato pasta", image: "https://via.placeholder.com/200?text=Penne+Arrabbiata", available: true },
  
  // Main Course
  { name: "Paneer Butter Masala", price: 289, category: "main_course", type: "veg", description: "Creamy paneer curry", image: "https://via.placeholder.com/200?text=Paneer+Butter+Masala", available: true },
  { name: "Chicken Tikka Masala", price: 349, category: "main_course", type: "non_veg", description: "Tender chicken in creamy sauce", image: "https://via.placeholder.com/200?text=Chicken+Tikka+Masala", available: true },
  { name: "Biryani", price: 349, category: "main_course", type: "non_veg", description: "Fragrant rice with meat", image: "https://via.placeholder.com/200?text=Biryani", available: true },
  { name: "Vegetable Biryani", price: 279, category: "main_course", type: "veg", description: "Fragrant rice with vegetables", image: "https://via.placeholder.com/200?text=Veg+Biryani", available: true },
  { name: "Dal Makhani", price: 199, category: "main_course", type: "veg", description: "Creamy lentil curry", image: "https://via.placeholder.com/200?text=Dal+Makhani", available: true },
  
  // Snacks
  { name: "Samosa", price: 30, category: "snacks", type: "veg", description: "Crispy fried pastry", image: "https://via.placeholder.com/200?text=Samosa", available: true },
  { name: "Spring Rolls", price: 80, category: "snacks", type: "veg", description: "Crispy Asian snack", image: "https://via.placeholder.com/200?text=Spring+Rolls", available: true },
  { name: "Pakora", price: 60, category: "snacks", type: "veg", description: "Fried vegetable fritters", image: "https://via.placeholder.com/200?text=Pakora", available: true },
  
  // Desserts
  { name: "Chocolate Cake", price: 120, category: "dessert", type: "veg", description: "Rich chocolate dessert", image: "https://via.placeholder.com/200?text=Chocolate+Cake", available: true },
  { name: "Gulab Jamun", price: 80, category: "dessert", type: "veg", description: "Sweet Indian dessert", image: "https://via.placeholder.com/200?text=Gulab+Jamun", available: true },
  { name: "Ice Cream", price: 100, category: "dessert", type: "veg", description: "Vanilla ice cream", image: "https://via.placeholder.com/200?text=Ice+Cream", available: true }
];

// Public endpoint to seed database (for demo/development only)
router.post("/seed-products", async (req, res) => {
  try {
    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.status(200).json({ 
        message: `Database already has ${count} products. No action taken.`,
        count 
      });
    }

    // Insert products
    const result = await Product.insertMany(seedProducts);
    res.status(201).json({
      message: `✅ Successfully inserted ${result.length} products`,
      count: result.length,
      products: result
    });

  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      message: "Error seeding products",
      error: error.message
    });
  }
});

module.exports = router;
