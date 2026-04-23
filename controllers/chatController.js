const Product = require("../models/Product");

// Extract intent and filters from user message
const extractFilters = (userMessage) => {
  const message = userMessage.toLowerCase();
  const filters = {
    maxPrice: null,
    category: null,
    type: null,
  };

  // Extract price constraints (e.g., "under 100", "below 200")
  const priceMatch = message.match(/(?:under|below|within|less than|max|upto)\s+(\d+)/i);
  if (priceMatch) {
    filters.maxPrice = parseInt(priceMatch[1]);
  }

  // Extract categories
  const categories = ["breakfast", "lunch", "dinner", "snacks", "dessert", "pizza", "pasta", "soups", "main_course"];
  for (const cat of categories) {
    if (message.includes(cat)) {
      filters.category = cat;
      break;
    }
  }

  // Extract type (veg/non-veg)
  if (message.includes("veg") || message.includes("vegetarian")) {
    filters.type = "veg";
  } else if (message.includes("chicken") || message.includes("meat") || message.includes("non-veg")) {
    filters.type = "non_veg";
  }

  return filters;
};

// Build MongoDB query based on extracted filters
const buildQuery = (filters) => {
  const query = { available: true };

  if (filters.maxPrice) {
    query.price = { $lte: filters.maxPrice };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  return query;
};

// Generate friendly bot response
const generateBotResponse = (filters, productCount) => {
  if (productCount === 0) {
    return "Sorry, I couldn't find items matching your criteria. Try adjusting your budget or preferences! 😊";
  }

  let response = "🎉 Here are some great options for you:\n\n";

  if (filters.maxPrice && filters.category) {
    response = `Found ${productCount} ${filters.category} items under ₹${filters.maxPrice}! 💰\n\n`;
  } else if (filters.maxPrice) {
    response = `Found ${productCount} items under ₹${filters.maxPrice}! 💰\n\n`;
  } else if (filters.category) {
    response = `Found ${productCount} delicious ${filters.category} items! 🍽️\n\n`;
  }

  response += "Click 'Add' on any item to add it to your cart. You can review and checkout anytime! ✨";
  return response;
};

// Main chat controller
const chatController = async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(200).json({ 
        reply: "I didn't understand that. Try asking for specific food like 'breakfast under 100' or 'veg pizza'",
        products: [] 
      });
    }

    // Extract filters from user message
    const filters = extractFilters(userMessage);

    // Build MongoDB query
    const query = buildQuery(filters);

    // Query products from database
    let products = await Product.find(query).limit(8).lean();

    // If no exact matches, return all available products
    if (products.length === 0) {
      products = await Product.find({ available: true }).limit(8).lean();
    }

    // Generate bot response
    const reply = generateBotResponse(filters, products.length);

    // Return structured response for frontend to display as cards
    res.status(200).json({
      reply,
      products: products.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.description,
        category: p.category,
        type: p.type
      }))
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(200).json({
      reply: "I'm having trouble right now. Please try again later! 😊",
      products: []
    });
  }
};

module.exports = { chatController };
