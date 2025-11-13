const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();

const allowedOrigins = process.env.NODE_ENV === "production"
  ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173"])
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

const router = require("./routes");
const errorHandler = require("./middleware/errorHandler");

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(router);

app.get("/", (req, res) => {
  res.json({ message: "Content Planner & Writer Pro API" });
});

app.use(errorHandler);
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads", "products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 3000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = { app };

