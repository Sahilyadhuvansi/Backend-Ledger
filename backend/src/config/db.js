const mongoose = require("mongoose");

/**
 * MongoDB Connection with Scaling Support
 * Implements connection pooling and retry logic for production readiness.
 */
const connectDB = async () => {
  const poolSize = parseInt(process.env.DB_POOL_SIZE || "10", 10);
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: poolSize,
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [Pool: ${poolSize}]`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    // In production, we might want to retry. In dev, we exit.
    if (process.env.NODE_ENV === "production") {
       console.log("Retrying connection in 5 seconds...");
       setTimeout(connectDB, 5000);
    } else {
       process.exit(1);
    }
  }
};

module.exports = connectDB;
