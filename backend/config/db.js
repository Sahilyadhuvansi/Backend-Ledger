const mongoose = require("mongoose");
const validateEnv = require("./validateEnv");

async function connectToDB() {
  validateEnv();
  const MONGO_URI = process.env.MONGO_URI;
  if (mongoose.connection.readyState >= 1) {
    console.log("\u2705 Using existing database connection");
    return;
  }
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  console.log(`\uD83D\uDD04 Attempting MongoDB connection...`);
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    console.log(
      `\u2705 MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`,
    );
    return conn;
  } catch (err) {
    console.error("\u274c MongoDB Connection Failed");
    console.error(`   Error Message: ${err.message}`);
    console.error(`   Error Code: ${err.code}`);
    console.error(`   Error Name: ${err.name}`);
    if (err.message.includes("ENOTFOUND")) {
      console.error("   \u2192 FIX: Check MONGO_URI host (DNS issue)");
    } else if (err.message.includes("authentication failed")) {
      console.error("   \u2192 FIX: Check MongoDB credentials in MONGO_URI");
    } else if (err.message.includes("connect ECONNREFUSED")) {
      console.error(
        "   \u2192 FIX: MongoDB cluster not accessible or IP not whitelisted",
      );
    } else if (err.message.includes("timed out")) {
      console.error(
        "   \u2192 FIX: Network timeout - check firewall/IP whitelist in MongoDB Atlas",
      );
    }
    process.exit(1);
  }
}

module.exports = connectToDB;
