const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: "",
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "inr",
    },
    status: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking'],
      default: 'card'
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
