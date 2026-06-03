const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    device: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
    },
    browser: String,
    country: String,
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    clicks: {
      type: Number,
      default: 0,
    },

    lastVisitedAt: Date,

    expiresAt: Date,

    visits: [visitSchema],

    deviceStats: {
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
    },

    browserStats: {
      chrome: { type: Number, default: 0 },
      firefox: { type: Number, default: 0 },
      safari: { type: Number, default: 0 },
      edge: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Link", linkSchema);