const express = require("express");
const router = express.Router();
const { chatController } = require("../controllers/chatController");

// Chat endpoint - PUBLIC (no auth required for MVP)
// In production, you might want to add rate limiting or auth
router.post("/chat", chatController);

module.exports = router;
