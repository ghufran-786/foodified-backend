require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

const app = express();

// Security middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./routes/auth"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/payments", require("./routes/payments"));

app.get("/", (req, res)=>{
    res.send("API running...");
});

//mongdb connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("MongoDB Connection Error:", err.message);
});

// Use PORT from environment variables for deployment platforms
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})