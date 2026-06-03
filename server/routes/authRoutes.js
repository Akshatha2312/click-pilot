const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many auth requests, please try again later.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);

module.exports = router;