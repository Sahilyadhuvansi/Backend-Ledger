// ─── Commit: Security Blacklist Module ───
// What this does: Loads Mongoose to create a high-performance "Banned List" for sessions.
const mongoose = require("mongoose");

// ─── Commit: Token Blacklist Schema ───
// What this does: Stores JWT tokens that are no longer allowed to access the system (Logout logic).
// Why it exists: JWT tokens are like "Vouchers" — normally you can't delete them once given out. This list allows us to "Revoke" them before they naturally expire.
const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // No need to blacklist the same token twice!
    },
    // The date the login was canceled
    blacklistAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { timestamps: true },
);

// ─── Commit: Self-Cleaning Database logic (TTL Index) ───
// What this does: Automatically DELETES rows from this table after 3 days.
// Why it exists: Database hygiene! Once a token is over 3 days old, it's already expired naturally, so we don't need to keep it in our "Blacklist" anymore.
// Interview insight: This is called a "Time to Live" (TTL) index. It's built-in into MongoDB to save developer time.
tokenBlacklistSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 3, // 3 days
  },
);

// ─── Commit: Model Compilation ───
const tokenBlacklistModel = mongoose.model(
  "TokenBlacklist",
  tokenBlacklistSchema,
);

module.exports = tokenBlacklistModel;
