const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const logger = require("./middleware/logger");

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET environment variable is required");
  process.exit(1);
}

// Connect Database
connectDB();

const app = express();

const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many link creation requests, please try again later.",
  },
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Configure CORS with environment variable
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/links/create", createLinkLimiter);
app.use("/api/links", linkRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "ClickPilot",
    message: "API Running Successfully 🚀",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║          🚀 ClickPilot Server Started                 ║
╠════════════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(40)}║
║ Port: ${PORT.toString().padEnd(48)}║
║ CORS Origin: ${(process.env.CORS_ORIGIN || "http://localhost:5173").padEnd(36)}║
║ MongoDB: ${(process.env.MONGODB_URI ? "Connected" : "Not configured").padEnd(43)}║
╚════════════════════════════════════════════════════════╝
  `);
});