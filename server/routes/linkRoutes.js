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
  analyticsOverview,
  analyticsRecent,
  analyticsDailyTrends,
  analyticsBrowserBreakdown,
  analyticsDeviceBreakdown,
  analyticsCountryBreakdown,
  getLinkStatus,
  getPublicDailyTrends,
} = require("../controllers/linkController");

const { protect } = require("../middleware/authMiddleware");

// ================= CREATE =================
router.post("/create", protect, createLink);
router.post("/bulk", protect, bulkCreateLinks);

// ================= READ =================
router.get("/my-links", protect, getMyLinks);
router.get("/dashboard", protect, getDashboardStats);
router.get("/:id/status", protect, getLinkStatus);
router.get("/analytics/:id", protect, getLinkAnalytics);
router.get('/analytics/:linkId/overview', protect, analyticsOverview);
router.get('/analytics/:linkId/recent', protect, analyticsRecent);
router.get('/analytics/:linkId/daily-trends', protect, analyticsDailyTrends);
router.get('/analytics/:linkId/browser-breakdown', protect, analyticsBrowserBreakdown);
router.get('/analytics/:linkId/device-breakdown', protect, analyticsDeviceBreakdown);
router.get('/analytics/:linkId/country-breakdown', protect, analyticsCountryBreakdown);

// ================= UPDATE =================
router.put("/:id", protect, updateLink);

// ================= DELETE =================
router.delete("/:id", protect, deleteLink);

// ================= PUBLIC ROUTES =================
router.get("/stats/:shortCode/trends", getPublicDailyTrends);
router.get("/stats/:shortCode", getPublicStats);

// ================= REDIRECT =================
router.get("/:shortCode", redirectLink);

module.exports = router;