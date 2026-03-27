/**
 * Environment Variable Auditor
 * Ensures all critical strings are present before startup.
 */
// ─── Commit: Fail-Fast Validation ────────────────────────────────────────────
// What this does: Stops the server immediately if a key is missing.
// Why it exists: To prevent "Silent Failures" or "Undefined" crashes deeper in the app.
// Interview insight: This is part of the "12-Factor App" methodology (Config section).
const REQUIRED_ENV = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "GROQ_API_KEY", // AI critical feature
];

const validateEnv = () => {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ CRITICAL FAILURE: Missing required environment variables:");
    missing.forEach((m) => console.error(`   - ${m}`));
    
    // Fail-fast principle: Don't start a broken server
    process.exit(1);
  }

  // Soft warning for optional keys
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    console.warn("⚠️ WARNING: SESSION_SECRET not set. Falling back to JWT_SECRET.");
  }

  console.log("✅ Environment validation successful");
};

module.exports = validateEnv;
