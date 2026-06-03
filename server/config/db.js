const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error(
        'MongoDB URI not configured. Set MONGODB_URI environment variable.'
      );
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Error:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;