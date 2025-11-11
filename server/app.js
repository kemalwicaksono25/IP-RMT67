const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Import routes and services
const router = require("./routes");
const socketService = require("./services/socketService");
const errorHandler = require("./middleware/errorHandler");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use(router);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Content Planner & Writer Pro API" });
});

// Socket.io
socketService(io);

// Error handler (must be last)
app.use(errorHandler);

// Create uploads directory if not exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads", "products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = { app, server, io };

