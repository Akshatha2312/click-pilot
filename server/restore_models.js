const fs = require("fs");
const path = require("path");

// Restore Link.js
const linkContent = `const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Link", linkSchema);
`;

fs.writeFileSync("./models/Link.js", linkContent, "utf8");
console.log("✓ Link.js restored");

// Verify
delete require.cache[require.resolve("./models/Link")];
const Link = require("./models/Link");
console.log("✓ Link model loaded successfully");
console.log("  Link.create:", typeof Link.create);
console.log("  Link.schema:", !!Link.schema);
