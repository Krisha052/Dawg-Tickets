const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const tradeRoutes = require("./routes/trades");
const userRoutes = require("./routes/users");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve legacy UI (until React UI is fully built)
app.use(express.static(path.join(__dirname, "public")));

// Serve uploads (if you use uploads/)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
