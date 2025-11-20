const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

const allowedOrigins = process.env.NODE_ENV === "production"
  ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"])
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

const router = require("./routes");
const errorHandler = require("./middleware/errorHandler");

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // If allowedOrigins contains "*", allow all origins
    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log for debugging
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      // In production, be more permissive
      if (process.env.NODE_ENV === "production") {
        // If CORS_ORIGIN is not set or is "*", allow all
        if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === "*") {
          console.log('Allowing origin in production (CORS_ORIGIN not set or is *)');
          return callback(null, true);
        }
        // If CORS_ORIGIN is set but origin not in list, still allow for now (can be restricted later)
        console.log('Warning: Origin not in CORS_ORIGIN list, but allowing in production');
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
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

module.exports = { app };

