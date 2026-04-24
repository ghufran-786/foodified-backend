const Product = require("../models/Product");

// ============================================
// HELPER: CONVERT RELATIVE IMAGE PATHS TO FULL URLs
// ============================================

const getFullImageURL = (imagePath) => {
  // If image path is already a full URL (starts with http), return as is
  if (imagePath && imagePath.startsWith("http")) {
    return imagePath;
  }

  // If no image path, return empty string
  if (!imagePath) {
    return "";
  }

  // Construct full URL for relative paths
  const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseURL}/${imagePath}`;
};

// ============================================
// SMART NATURAL LANGUAGE PARSING
// ============================================

// Extract keyword, category, price, and type from user message
const extractFilters = (userMessage) => {
  const message = userMessage.toLowerCase();
  const filters = {
    keyword: null,
    maxPrice: null,
    category: null,
    type: null,
    isCheap: false,
  };

  // ========== KEYWORD EXTRACTION ==========
  // Common food items users might search for
  const foodKeywords = [
    "biryani", "pizza", "burger", "roll", "thali", "samosa", "naan", "roti",
    "chicken", "paneer", "dosa", "idli", "pasta", "momos", "chowmein",
    "biryanis", "pizzas", "burgers", "rolls", "thalis"
  ];

  for (const keyword of foodKeywords) {
    if (message.includes(keyword)) {
      filters.keyword = keyword;
      break;
    }
  }

  // ========== PRICE EXTRACTION ==========
  // Match patterns like "under 100", "below 200", "upto 300", "max 150"
  const pricePatterns = [
    /(?:under|below|within|less than|max|upto|up to)\s+(?:₹\s*)?(\d+)/i,
    /(\d+)\s*(?:rupees|rs|or less|and below)/i,
    /budget[:\s]+(?:₹\s*)?(\d+)/i
  ];

  for (const pattern of pricePatterns) {
    const priceMatch = message.match(pattern);
    if (priceMatch) {
      filters.maxPrice = parseInt(priceMatch[1]);
      break;
    }
  }

  // ========== CATEGORY EXTRACTION ==========
  // Match meal times and categories
  const mealCategories = {
    breakfast: ["breakfast", "morning", "brunch"],
    lunch: ["lunch", "afternoon"],
    dinner: ["dinner", "evening"],
    snacks: ["snacks", "snack", "appetizer"],
    dessert: ["dessert", "sweet", "sweets"]
  };

  for (const [category, keywords] of Object.entries(mealCategories)) {
    if (keywords.some(kw => message.includes(kw))) {
      filters.category = category;
      break;
    }
  }

  // ========== VEG/NON-VEG EXTRACTION ==========
  if (message.includes("veg") || message.includes("vegetarian") || message.includes("veggie")) {
    filters.type = "veg";
  } else if (
    message.includes("chicken") ||
    message.includes("meat") ||
    message.includes("non-veg") ||
    message.includes("non veg") ||
    message.includes("nonveg")
  ) {
    filters.type = "non_veg";
  }

  // ========== DETECT IF USER WANTS CHEAP OPTIONS ==========
  if (message.includes("cheap") || message.includes("cheapest") || message.includes("budget")) {
    filters.isCheap = true;
  }

  return filters;
};

// Build MongoDB query based on extracted filters
const buildQuery = (filters) => {
  const query = { available: true };

  // Add keyword filter (food name)
  if (filters.keyword) {
    query.name = { $regex: filters.keyword, $options: "i" };
  }

  // Add price filter
  if (filters.maxPrice) {
    query.price = { $lte: filters.maxPrice };
  }

  // Add category filter
  if (filters.category) {
    query.category = filters.category;
  }

  // Add veg/non-veg filter
  if (filters.type) {
    query.type = filters.type;
  }

  return query;
};

// Generate friendly bot response based on filters and results
const generateBotResponse = (filters, productCount) => {
  if (productCount === 0) {
    return "😢 No matching food found. Try searching for something else or adjust your budget!";
  }

  let response = "🎉 Here are some great options for you:\n\n";

  // Build descriptive message based on filters
  const parts = [];
  if (filters.keyword) parts.push(filters.keyword);
  if (filters.type === "veg") parts.push("veg");
  if (filters.type === "non_veg") parts.push("non-veg");
  if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice}`);

  if (parts.length > 0) {
    response = `Found ${productCount} ${parts.join(" ")} options! 💰\n\n`;
  }

  if (filters.isCheap) {
    response += "Sorted by price (cheapest first)! 💸";
  }

  response += "\nClick 'Add' to add any item to your cart! ✨";
  return response;
};

// ============================================
// MAIN CHAT CONTROLLER
// ============================================

const chatController = async (req, res) => {
  try {
    const { userMessage } = req.body;

    // Validate input
    if (!userMessage || typeof userMessage !== "string") {
      return res.status(200).json({
        reply: "I didn't understand that. Try asking like 'cheap chicken biryani' or 'veg breakfast under 100'",
        products: []
      });
    }

    // ========== EXTRACT FILTERS FROM USER MESSAGE ==========
    const filters = extractFilters(userMessage);
    console.log("📊 Extracted filters:", filters);

    // ========== BUILD MONGODB QUERY ==========
    const query = buildQuery(filters);
    console.log("🔍 MongoDB query:", query);

    // ========== QUERY PRODUCTS ==========
    let products = await Product.find(query).lean();

    // ========== SORT BY PRICE IF USER WANTS CHEAP OPTIONS ==========
    if (filters.isCheap) {
      products = products.sort((a, b) => a.price - b.price);
    }

    // Limit to 8 results for chat display
    products = products.slice(0, 8);

    // ========== GENERATE RESPONSE ==========
    const reply = generateBotResponse(filters, products.length);

    // ========== RETURN STRUCTURED RESPONSE ==========
    res.status(200).json({
      reply,
      products: products.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: getFullImageURL(p.image),
        description: p.description,
        category: p.category,
        type: p.type
      }))
    });

  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(200).json({
      reply: "Oops! I'm having trouble right now. Please try again later! 😊",
      products: []
    });
  }
};

module.exports = { chatController };
