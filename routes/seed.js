const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const seedProducts = [
  // Breakfast
  { name: "Pancakes", price: 149, category: "breakfast", type: "veg", description: "Fluffy pancakes with butter and syrup", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop", available: true },
  { name: "Poha", price: 40, category: "breakfast", type: "veg", description: "Light and easy breakfast", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop", available: true },
  { name: "Upma", price: 60, category: "breakfast", type: "veg", description: "Savory semolina breakfast", image: "https://images.unsplash.com/photo-1598409810696-b01c5c671b50?w=200&h=200&fit=crop", available: true },
  { name: "Idli", price: 50, category: "breakfast", type: "veg", description: "Steamed rice cakes with sambar", image: "https://images.unsplash.com/photo-1557803104200-b6a49d4b37b0?w=200&h=200&fit=crop", available: true },
  
  // Soups
  { name: "Chicken Soup", price: 179, category: "soups", type: "non_veg", description: "Warm and comforting", image: "https://images.unsplash.com/photo-1547592166-7aae4d755be1?w=200&h=200&fit=crop", available: true },
  { name: "Minestrone Soup", price: 159, category: "soups", type: "veg", description: "Vegetable soup with pasta", image: "https://images.unsplash.com/photo-1585238341710-4edd9691794e?w=200&h=200&fit=crop", available: true },
  { name: "Tom Yum Soup", price: 199, category: "soups", type: "non_veg", description: "Spicy Thai soup", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop", available: true },
  
  // Pizza
  { name: "Margherita Pizza", price: 199, category: "pizza", type: "veg", description: "Classic pizza with cheese", image: "https://images.unsplash.com/photo-1599599810694-b308ca884160?w=200&h=200&fit=crop", available: true },
  { name: "Pepperoni Pizza", price: 249, category: "pizza", type: "non_veg", description: "Pizza with pepperoni and cheese", image: "https://images.unsplash.com/photo-1618840740266-7f50ef1d666b?w=200&h=200&fit=crop", available: true },
  { name: "Veggie Pizza", price: 179, category: "pizza", type: "veg", description: "Loaded with vegetables", image: "https://images.unsplash.com/photo-1605457479887-cd1b1b0f9b0a?w=200&h=200&fit=crop", available: true },
  
  // Pasta
  { name: "Spaghetti Carbonara", price: 329, category: "pasta", type: "non_veg", description: "Classic Italian pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop", available: true },
  { name: "Veg Alfredo Pasta", price: 299, category: "pasta", type: "veg", description: "Creamy pasta with vegetables", image: "https://images.unsplash.com/photo-1645112411341-6c4ee1ce4b21?w=200&h=200&fit=crop", available: true },
  { name: "Chicken Alfredo Pasta", price: 349, category: "pasta", type: "non_veg", description: "Creamy pasta with chicken", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop", available: true },
  { name: "Penne Arrabbiata", price: 279, category: "pasta", type: "veg", description: "Spicy tomato pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop", available: true },
  
  // Main Course
  { name: "Paneer Butter Masala", price: 289, category: "main_course", type: "veg", description: "Creamy paneer curry", image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=200&h=200&fit=crop", available: true },
  { name: "Chicken Tikka Masala", price: 349, category: "main_course", type: "non_veg", description: "Tender chicken in creamy sauce", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop", available: true },
  { name: "Biryani", price: 349, category: "main_course", type: "non_veg", description: "Fragrant rice with meat", image: "https://images.unsplash.com/photo-1584199471733-d938c14031c3?w=200&h=200&fit=crop", available: true },
  { name: "Vegetable Biryani", price: 279, category: "main_course", type: "veg", description: "Fragrant rice with vegetables", image: "https://images.unsplash.com/photo-1573937328693-ff4def03e671?w=200&h=200&fit=crop", available: true },
  { name: "Dal Makhani", price: 199, category: "main_course", type: "veg", description: "Creamy lentil curry", image: "https://images.unsplash.com/photo-1585866398359-2ea280801f26?w=200&h=200&fit=crop", available: true },
  
  // Snacks
  { name: "Samosa", price: 30, category: "snacks", type: "veg", description: "Crispy fried pastry", image: "https://images.unsplash.com/photo-1599023566930-f20b6748da3a?w=200&h=200&fit=crop", available: true },
  { name: "Spring Rolls", price: 80, category: "snacks", type: "veg", description: "Crispy Asian snack", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop", available: true },
  { name: "Pakora", price: 60, category: "snacks", type: "veg", description: "Fried vegetable fritters", image: "https://images.unsplash.com/photo-1599023566930-f20b6748da3a?w=200&h=200&fit=crop", available: true },
  
  // Desserts
  { name: "Chocolate Cake", price: 120, category: "dessert", type: "veg", description: "Rich chocolate dessert", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop", available: true },
  { name: "Gulab Jamun", price: 80, category: "dessert", type: "veg", description: "Sweet Indian dessert", image: "https://images.unsplash.com/photo-1563805042-7684c019e157?w=200&h=200&fit=crop", available: true },
  { name: "Ice Cream", price: 100, category: "dessert", type: "veg", description: "Vanilla ice cream", image: "https://images.unsplash.com/photo-1563805042-7684c019e157?w=200&h=200&fit=crop", available: true }
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
