const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  shortCode: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  ip: String,
  device: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
  browser: String,
  os: String,
  country: String,
  region: String,
  city: String,
  referrer: String,
  userAgent: String,
}, { timestamps: false });

// Indexes for performance
analyticsSchema.index({ urlId: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ country: 1 });
analyticsSchema.index({ browser: 1 });
analyticsSchema.index({ device: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
