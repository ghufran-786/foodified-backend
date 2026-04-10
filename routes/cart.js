const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's cart (PROTECTED)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;
    let cart = await Cart.findOne({ email });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ email, items: [] });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add item to cart (PROTECTED)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;
    const { id, name, price, image } = req.body;

    if (!id || !name || price === undefined || price < 0) {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    let cart = await Cart.findOne({ email });

    if (!cart) {
      cart = new Cart({ email, items: [] });
    }

    // Check if item already exists (normalize id types to string)
    const existingItem = cart.items.find((item) => String(item.id) === String(id));

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // store id as string to make comparisons consistent
      cart.items.push({ id: String(id), name, price, image, quantity: 1 });
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

// Remove item from cart (PROTECTED)
router.delete("/remove/:itemId", authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ email });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => String(item.id) !== String(itemId));
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item" });
  }
});

// Increase item quantity (PROTECTED)
router.put("/increase/:itemId", authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ email });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => String(item.id) === String(itemId));

    if (item) {
      item.quantity += 1;
      cart.updatedAt = new Date();
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error increasing quantity" });
  }
});

// Decrease item quantity (PROTECTED)
router.put("/decrease/:itemId", authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ email });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => String(item.id) === String(itemId));

    if (item && item.quantity > 1) {
      item.quantity -= 1;
      cart.updatedAt = new Date();
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error decreasing quantity" });
  }
});

// Clear entire cart (PROTECTED)
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const { email } = req.user;

    const cart = await Cart.findOne({ email });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;
