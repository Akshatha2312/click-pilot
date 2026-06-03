const jwt = require("jsonwebtoken");

/**
 * Protect middleware: Validates JWT token from Authorization header
 * Expected format: Authorization: Bearer <token>
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No Authorization header provided",
      });
    }

    // Extract and validate Bearer token format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid Authorization format. Expected: Bearer <token>",
      });
    }

    const token = parts[1];

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: JWT_SECRET missing",
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token: " + error.message,
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Generic auth error
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};