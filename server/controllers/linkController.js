const mongoose = require("mongoose");
const Link = require("../models/Link");
const { nanoid } = require("nanoid");
const { isURL } = require("validator");
const { parseUserAgent, getClientIP, generateQRCode } = require("../utils/analytics");

const createLink = async (req, res) => {
  try {
    const { originalUrl, shortCode: requestedShortCode } = req.body;
    const normalizedOriginalUrl = typeof originalUrl === "string" ? originalUrl.trim() : "";

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!normalizedOriginalUrl) {
      return res.status(400).json({
        success: false,
        message: "originalUrl is required",
      });
    }

    if (!isURL(normalizedOriginalUrl, { require_protocol: true, protocols: ["http", "https"] })) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid HTTP/HTTPS URL",
      });
    }

    const customShortCode = typeof requestedShortCode === "string" ? requestedShortCode.trim() : "";
    let shortCode = nanoid(6);

    if (customShortCode) {
      shortCode = customShortCode;
      const existingLink = await Link.findOne({ shortCode });

      if (existingLink) {
        return res.status(409).json({
          success: false,
          message: "Short code already exists",
        });
      }
    }

    const link = await Link.create({
      originalUrl: normalizedOriginalUrl,
      shortCode,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Short URL Created",
      link,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyLinks = async (req, res) => {
  try {
    const { search, sort } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 };

    if (sort === "clicks") {
      sortOption = { clicks: -1, createdAt: -1 };
    } else if (sort === "createdAt") {
      sortOption = { createdAt: -1 };
    }

    const query = {
      user: req.user.id,
    };

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { originalUrl: { $regex: escapedSearch, $options: "i" } },
        { shortCode: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total = await Link.countDocuments(query);
    const links = await Link.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      links,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [summary] = await Link.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalLinks: { $sum: 1 },
                totalClicks: { $sum: { $ifNull: ["$clicks", 0] } },
              },
            },
          ],
          latestLinks: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                originalUrl: 1,
                shortCode: 1,
                clicks: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          totalLinks: {
            $ifNull: [{ $arrayElemAt: ["$totals.totalLinks", 0] }, 0],
          },
          totalClicks: {
            $ifNull: [{ $arrayElemAt: ["$totals.totalClicks", 0] }, 0],
          },
          latestLinks: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      totalLinks: summary?.totalLinks ?? 0,
      totalClicks: summary?.totalClicks ?? 0,
      latestLinks: summary?.latestLinks ?? [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLinkAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    if (String(link.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Get recent visits (last 50)
    const recentVisits = link.visits ? link.visits.slice(-50).reverse() : [];

    return res.status(200).json({
      success: true,
      analytics: {
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        totalClicks: link.clicks,
        lastVisitedAt: link.lastVisitedAt,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        status: link.expiresAt && new Date(link.expiresAt) < new Date() ? "expired" : "active",
        deviceStats: link.deviceStats || {},
        browserStats: link.browserStats || {},
        recentVisits,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    if (String(link.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Link.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const redirectLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "This link has expired",
      });
    }

    // Parse user agent for device and browser tracking
    const userAgent = req.headers["user-agent"] || "";
    const { device, browser } = parseUserAgent(userAgent);
    const ipAddress = getClientIP(req);

    // Create visit record
    const visit = {
      timestamp: new Date(),
      ipAddress,
      device,
      browser,
    };

    // Update link stats
    link.clicks = (link.clicks || 0) + 1;
    link.lastVisitedAt = new Date();
    link.visits.push(visit);

    // Update device stats
    if (device) {
      link.deviceStats[device] = (link.deviceStats[device] || 0) + 1;
    }

    // Update browser stats
    if (browser && link.browserStats[browser] !== undefined) {
      link.browserStats[browser] = (link.browserStats[browser] || 0) + 1;
    }

    // Keep only last 1000 visits to avoid unbounded array growth
    if (link.visits.length > 1000) {
      link.visits = link.visits.slice(-1000);
    }

    await link.save();

    return res.redirect(link.originalUrl);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateLink = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const normalizedOriginalUrl = typeof originalUrl === "string" ? originalUrl.trim() : "";

    if (!normalizedOriginalUrl) {
      return res.status(400).json({
        success: false,
        message: "originalUrl is required",
      });
    }

    if (!isURL(normalizedOriginalUrl, { require_protocol: true, protocols: ["http", "https"] })) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid HTTP/HTTPS URL",
      });
    }

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    if (link.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    link.originalUrl = normalizedOriginalUrl;
    await link.save();

    res.status(200).json({
      success: true,
      message: "Link updated successfully",
      link,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============= PUBLIC ENDPOINTS =============

const getPublicStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "This link has expired",
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks: link.clicks,
        createdAt: link.createdAt,
        lastVisitedAt: link.lastVisitedAt,
        status: link.expiresAt && new Date(link.expiresAt) < new Date() ? "expired" : "active",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkCreateLinks = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of URLs",
      });
    }

    if (urls.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Maximum 100 URLs allowed per request",
      });
    }

    const createdLinks = [];
    const errors = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      // Validate URL
      if (!isURL(url, { require_protocol: true, protocols: ["http", "https"] })) {
        errors.push({
          index: i,
          url,
          error: "Invalid URL format",
        });
        continue;
      }

      try {
        const shortCode = nanoid(6);
        const link = await Link.create({
          originalUrl: url,
          shortCode,
          user: req.user.id,
        });
        createdLinks.push(link);
      } catch (error) {
        errors.push({
          index: i,
          url,
          error: error.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      createdCount: createdLinks.length,
      errorCount: errors.length,
      links: createdLinks,
      errors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportedControllers = {
  createLink,
  getMyLinks,
  getDashboardStats,
  getLinkAnalytics,
  updateLink,
  deleteLink,
  redirectLink,
  getPublicStats,
  bulkCreateLinks,
};

module.exports = exportedControllers;