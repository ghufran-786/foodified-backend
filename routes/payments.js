const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");

const router = express.Router();

// Simulate payment processing with realistic success/failure rates
router.post("/process", authMiddleware, async (req, res) => {
  try {
    const { amount, currency = "inr", method, paymentDetails } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required"
      });
    }

    if (!method || !['card', 'upi', 'netbanking'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment method is required"
      });
    }

    // Simulate payment processing delay (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 2000));

    // Simulate realistic payment success/failure (85% success rate)
    const isSuccess = Math.random() < 0.85;

    // Generate mock transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    if (isSuccess) {
      // Record successful payment (optional - for learning purposes)
      try {
        const paymentRecord = new Payment({
          user: req.user.email,
          userId: req.user.userId || "",
          paymentIntentId: transactionId, // Using transaction ID as payment intent ID
          amount,
          currency,
          status: "succeeded",
          metadata: {
            method,
            paymentDetails: method === 'card' ? {
              ...paymentDetails,
              cardNumber: paymentDetails.cardNumber ? `**** **** **** ${paymentDetails.cardNumber.slice(-4)}` : undefined
            } : paymentDetails
          }
        });
        await paymentRecord.save();
      } catch (dbError) {
        console.error("Database error (non-critical):", dbError);
        // Continue with success response even if DB save fails
      }

      res.status(200).json({
        success: true,
        transactionId,
        message: "Payment processed successfully",
        amount: (amount / 100).toFixed(2), // Convert back to rupees for display
        method,
        timestamp: new Date().toISOString()
      });
    } else {
      // Simulate different failure reasons
      const failureReasons = [
        "Insufficient funds in your account",
        "Card expired or invalid",
        "Transaction declined by bank",
        "UPI ID not found or invalid",
        "Network error, please try again",
        "Payment timeout, please retry"
      ];

      const randomReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

      res.status(200).json({
        success: false,
        transactionId,
        message: randomReason,
        method,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed due to server error"
    });
  }
});

module.exports = router;
