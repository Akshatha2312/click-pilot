const UAParser = require("ua-parser-js");
const QRCode = require("qrcode");
let geoip;
try {
  geoip = require('geoip-lite');
} catch (e) {
  geoip = null;
}

// Parse user agent to get device and browser info
const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let device = "desktop";
  if (result.device.type === "mobile") device = "mobile";
  else if (result.device.type === "tablet") device = "tablet";

  const browserMap = {
    Chrome: "chrome",
    Firefox: "firefox",
    Safari: "safari",
    Edge: "edge",
  };

  const browser = browserMap[result.browser.name] || "other";
  const os = result.os?.name || "unknown";

  return { device, browser, os };
};

const getGeoFromIP = (ip) => {
  if (!geoip) return { country: null, region: null, city: null };
  try {
    const geo = geoip.lookup(ip) || {};
    return {
      country: geo.country || null,
      region: geo.region || null,
      city: geo.city || null,
    };
  } catch (e) {
    return { country: null, region: null, city: null };
  }
};

// Extract IP address from request
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    "unknown"
  );
};

// Generate QR code as data URL
const generateQRCode = async (shortUrl) => {
  try {
    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrCode;
  } catch (error) {
    console.error("QR Code generation error:", error);
    return null;
  }
};

module.exports = {
  parseUserAgent,
  getClientIP,
  generateQRCode,
  getGeoFromIP,
};
