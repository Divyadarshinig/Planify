// =========================================================
// PLANIFY - SERVER
// =========================================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();


// =========================================================
// DATABASE
// =========================================================

const connectDB = require("./config/db");


// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const productivityRoutes = require("./routes/productivityRoutes");


// =========================================================
// CREATE EXPRESS APP
// =========================================================

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

// Allow requests from the frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());


// =========================================================
// CONNECT DATABASE
// =========================================================

connectDB();


// =========================================================
// API ROUTES
// =========================================================

// Authentication
app.use("/api/auth", authRoutes);

// Tasks
app.use("/api/tasks", taskRoutes);

// Productivity Analysis + Streak
app.use("/api/productivity", productivityRoutes);


// =========================================================
// HOME ROUTE
// =========================================================

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Planify API 🚀"
    });
});


// =========================================================
// SERVER
// =========================================================

const PORT = process.env.PORT || 5000;

// Listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Planify server running on port ${PORT}`);
});