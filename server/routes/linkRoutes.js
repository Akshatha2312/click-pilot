const express = require("express");
const router = express.Router();

const {
  createLink,
  getMyLinks,
  getDashboardStats,
  getLinkAnalytics,
  updateLink,
  deleteLink,
  redirectLink,
  getPublicStats,
  bulkCreateLinks,
} = require("../controllers/linkController");

const { protect } = require("../middleware/authMiddleware");

// ================= CREATE =================
router.post("/create", protect, createLink);
router.post("/bulk", protect, bulkCreateLinks);

// ================= READ =================
router.get("/my-links", protect, getMyLinks);
router.get("/dashboard", protect, getDashboardStats);
router.get("/analytics/:id", protect, getLinkAnalytics);

// ================= UPDATE =================
router.put("/:id", protect, updateLink);

// ================= DELETE =================
router.delete("/:id", protect, deleteLink);

// ================= PUBLIC ROUTES =================
router.get("/stats/:shortCode", getPublicStats);

// ================= REDIRECT =================
router.get("/:shortCode", redirectLink);

module.exports = router;