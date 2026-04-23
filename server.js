require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  "https://foodified-frontend.vercel.app"
].filter(Boolean);
 
// Security middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

// API running endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "API is running",
    version: "1.0.0",
    status: "active"
  });
});

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api", require("./routes/chat"));
app.use("/api", require("./routes/seed"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.path 
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.error("✗ MongoDB Connection Error:", err.message);
    console.error("  MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

// Connect to database
connectDB();

// Handle MongoDB disconnect
mongoose.connection.on("disconnected", () => {
  console.warn("⚠ MongoDB disconnected, attempting to reconnect...");
  connectDB();
});

// Use PORT from environment variables for deployment platforms
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`✓ CORS enabled for allowed origins`);
  console.log(`\nEnvironment: ${process.env.NODE_ENV || "development"}\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});