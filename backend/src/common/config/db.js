// ─── Commit: Database Driver Import ───
// What this does: Loads Mongoose specifically to handle the "Lifecycle" of the DB connection.
const mongoose = require("mongoose");

/**
 * MongoDB Connection Handler
 * Manages the connection lifecycle to MongoDB Atlas
 */
// ─── Commit: Database Connectivity Logic ───
// How it works: 1. Checks if already connected (to save resources). 2. Reads the secret URI from .env. 3. Attempts connection with retry logic.
// Interview insight: Why 'retryWrites: true'? This ensures that if a network glitch happens, MongoDB will automatically try to finish your "Write" command without you asking.
async function connectToDB() {
  const MONGO_URI = process.env.MONGO_URI;

  // Pattern: Check-then-act (prevents creating 1000 connections if this function is called repeatedly)
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ Using existing database connection");
    return;
  }

  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  console.log(`🔄 Attempting MongoDB connection...`);

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      retryWrites: true,
      w: "majority", // Ensures data is saved in multiple copies before telling us "Success" (Durability).
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`,
    );
    return conn;
  } catch (err) {
    // ─── Commit: Advanced Error Diagnosis ───
    // What this does: If the database fails, it tells you exactly HOW to fix it.
    // Why it exists: Database connection errors are usually "Network" or "Permission" issues. Standard errors are vague. This map makes it easier to debug.
    console.error("❌ MongoDB Connection Failed");
    console.error(`   Error Message: ${err.message}`);

    if (err.message.includes("ENOTFOUND")) {
      console.error("   → FIX: Check MONGO_URI host (DNS issue/URL mistyped)");
    } else if (err.message.includes("authentication failed")) {
      console.error("   → FIX: Check MongoDB credentials in MONGO_URI");
    } else if (err.message.includes("connect ECONNREFUSED")) {
      console.error(
        "   → FIX: MongoDB cluster not accessible or IP not whitelisted in Atlas Dashboard",
      );
    } else if (err.message.includes("timed out")) {
      console.error(
        "   → FIX: Network timeout - check firewall/IP whitelist in MongoDB Atlas",
      );
    }

    // Critical Failure: Kill the server because it can't function without a database.
    process.exit(1);
  }
}

// ─── Commit: Export Connection Function ───
module.exports = connectToDB;
