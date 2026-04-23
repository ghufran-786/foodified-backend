const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ["veg", "non_veg"], required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  rating: { type: Number, default: 4.5 },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
