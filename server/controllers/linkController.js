const mongoose = require("mongoose");
const Link = require("../models/Link");
const { nanoid } = require("nanoid");
const { isURL } = require("validator");
const { parseUserAgent, getClientIP, generateQRCode, getGeoFromIP } = require("../utils/analytics");
const Analytics = require("../models/Analytics");

const createLink = async (req, res) => {
  try {
    const { originalUrl, shortCode: requestedShortCode, expiresAt } = req.body;
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

    // Validate expiry date if provided
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format",
        });
      }
      if (expiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future",
        });
      }
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
      expiresAt: expiryDate,
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

    // Check expiry — return HTML page instead of JSON for better UX
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Expired</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
            .container { background: white; border-radius: 16px; padding: 48px 32px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            .icon { font-size: 64px; margin-bottom: 24px; }
            h1 { font-size: 32px; color: #1f2937; margin: 0 0 16px 0; }
            p { font-size: 16px; color: #6b7280; margin: 12px 0; line-height: 1.6; }
            .meta { background: #f3f4f6; border-radius: 8px; padding: 16px; margin-top: 24px; font-size: 14px; color: #4b5563; }
            .info { text-align: left; }
            .label { font-weight: 600; color: #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⏰</div>
            <h1>Link Expired</h1>
            <p>This shortened link is no longer active.</p>
            <p>Please contact the owner for an updated link.</p>
            <div class="meta">
              <div class="info">
                <div class="label">Short Code:</div>
                <div>${link.shortCode}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    // Parse user agent for device, browser and OS tracking
    const userAgent = req.headers["user-agent"] || "";
    const { device, browser, os } = parseUserAgent(userAgent);
    const ipAddress = getClientIP(req);
    const referrer = req.get("referer") || req.get("referrer") || null;
    const geo = getGeoFromIP(ipAddress);

    // Create visit record (embedded)
    const visit = {
      timestamp: new Date(),
      ipAddress,
      device,
      browser,
      os,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      referrer,
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

    // Persist analytics as a separate document for long-term storage
    try {
      await Analytics.create({
        urlId: link._id,
        shortCode: link.shortCode,
        timestamp: visit.timestamp,
        ip: ipAddress,
        device,
        browser,
        os,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        referrer,
        userAgent,
      });
    } catch (e) {
      // Log and continue — analytics persistence should not block redirect
      console.error("Analytics save error:", e.message || e);
    }
console.log("FOUND LINK:", link);
console.log("REDIRECTING TO:", link.originalUrl);
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

    // Allow updating expiry date
    if (req.body.expiresAt) {
      const newExpiry = new Date(req.body.expiresAt);
      if (isNaN(newExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format",
        });
      }
      if (newExpiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future",
        });
      }
      link.expiresAt = newExpiry;
    }

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

// ============ Public Daily Trends Endpoint ============
exports.getPublicDailyTrends = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const days = Math.min(parseInt(req.query.days, 10) || 30, 365);

    // Find link by short code
    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({ success: false, message: "Link not found" });
    }

    // Check if expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: "This link has expired" });
    }

    // Aggregate daily trends from Analytics collection
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Analytics.aggregate([
      {
        $match: {
          urlId: link._id,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          clicks: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: trends.map((d) => ({
        date: d._id,
        clicks: d.clicks,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============ Link Status Endpoint ============
exports.getLinkStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const now = new Date();
    const expired = link.expiresAt && new Date(link.expiresAt) < now;

    return res.status(200).json({
      success: true,
      status: {
        active: !expired,
        expiresAt: link.expiresAt,
        expired,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============ Analytics aggregation endpoints ============
exports.analyticsOverview = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const objectId = new mongoose.Types.ObjectId(linkId);

    const [result] = await Analytics.aggregate([
      { $match: { urlId: objectId } },
      {
        $facet: {
          totals: [
            { $group: { _id: null, totalClicks: { $sum: 1 }, lastVisited: { $max: '$timestamp' } } },
          ],
          countries: [
            { $match: { country: { $ne: null } } },
            { $group: { _id: '$country' } },
            { $count: 'totalCountries' },
          ],
          devices: [
            { $match: { device: { $ne: null } } },
            { $group: { _id: '$device' } },
            { $count: 'totalDevices' },
          ],
          browsers: [
            { $match: { browser: { $ne: null } } },
            { $group: { _id: '$browser' } },
            { $count: 'totalBrowsers' },
          ],
        },
      },
      {
        $project: {
          totalClicks: { $ifNull: [{ $arrayElemAt: ['$totals.totalClicks', 0] }, 0] },
          lastVisited: { $arrayElemAt: ['$totals.lastVisited', 0] },
          totalCountries: { $ifNull: [{ $arrayElemAt: ['$countries.totalCountries', 0] }, 0] },
          totalDevices: { $ifNull: [{ $arrayElemAt: ['$devices.totalDevices', 0] }, 0] },
          totalBrowsers: { $ifNull: [{ $arrayElemAt: ['$browsers.totalBrowsers', 0] }, 0] },
        },
      },
    ]);

    const overviewPayload = result || { totalClicks: 0, lastVisited: null, totalCountries: 0, totalDevices: 0, totalBrowsers: 0 };
overviewPayload.totalClicks = link.clicks || 0;
overviewPayload.lastVisited = link.lastVisitedAt;
    // include link metadata
    overviewPayload.shortCode = link.shortCode;
    overviewPayload.createdAt = link.createdAt;
    overviewPayload.expiresAt = link.expiresAt;
    overviewPayload.status = link.expiresAt && new Date(link.expiresAt) < new Date() ? 'expired' : 'active';

    return res.status(200).json({ success: true, overview: overviewPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.analyticsRecent = async (req, res) => {
  try {
    const { linkId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const docs = await Analytics.find({ urlId: linkId }).sort({ timestamp: -1 }).limit(limit).select('timestamp country city device browser os referrer -_id');

    return res.status(200).json({ success: true, recent: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.analyticsDailyTrends = async (req, res) => {
  try {
    const { linkId } = req.params;
    const days = Math.min(parseInt(req.query.days, 10) || 30, 365);

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const objectId = new mongoose.Types.ObjectId(linkId);

    const rows = await Analytics.aggregate([
      { $match: { urlId: objectId, timestamp: { $gte: since } } },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } } },
      { $group: { _id: '$day', clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', clicks: 1, _id: 0 } },
    ]);

    return res.status(200).json({ success: true, trends: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.analyticsBrowserBreakdown = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const objectId = new mongoose.Types.ObjectId(linkId);

    const rows = await Analytics.aggregate([
      { $match: { urlId: objectId } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { browser: '$_id', count: 1, _id: 0 } },
    ]);

    return res.status(200).json({ success: true, browsers: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.analyticsDeviceBreakdown = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const objectId = new mongoose.Types.ObjectId(linkId);

    const rows = await Analytics.aggregate([
      { $match: { urlId: objectId } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { device: '$_id', count: 1, _id: 0 } },
    ]);

    return res.status(200).json({ success: true, devices: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.analyticsCountryBreakdown = async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (String(link.user) !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const objectId = new mongoose.Types.ObjectId(linkId);

    const rows = await Analytics.aggregate([
      { $match: { urlId: objectId, country: { $ne: null } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { country: '$_id', count: 1, _id: 0 } },
      { $limit: 100 },
    ]);

    return res.status(200).json({ success: true, countries: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============ Ensure all exported functions are available ============
module.exports = Object.assign({}, module.exports, {
  analyticsOverview: exports.analyticsOverview,
  analyticsRecent: exports.analyticsRecent,
  analyticsDailyTrends: exports.analyticsDailyTrends,
  analyticsBrowserBreakdown: exports.analyticsBrowserBreakdown,
  analyticsDeviceBreakdown: exports.analyticsDeviceBreakdown,
  analyticsCountryBreakdown: exports.analyticsCountryBreakdown,
  getLinkStatus: exports.getLinkStatus,
  getPublicDailyTrends: exports.getPublicDailyTrends,
});